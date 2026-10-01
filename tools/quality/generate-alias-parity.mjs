#!/usr/bin/env node
/**
 * Generates the total alias/identity spec for every alias entry point.
 *
 * An alias entry point is a secondary package directory whose index only
 * re-exports symbols from other `@ciag/orchestra/*` entry points (the
 * PrimeNG-compat fan-out). The generated spec imports every value export of
 * every alias entry point and asserts it is the SAME class/function reference
 * as the declaration reached by following the re-export chain to its
 * declaring source file. Type-only exports cannot be compared at runtime;
 * they are resolved statically here (generation fails on a dangling export)
 * and still imported (as `import type`) by the spec for compile-time
 * resolvability.
 *
 * Modes:
 *   node tools/quality/generate-alias-parity.mjs          regenerate the spec
 *   node tools/quality/generate-alias-parity.mjs --check  fail if stale (CI)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import prettier from "prettier";

const root = fileURLToPath(new URL("../../", import.meta.url));
const library = path.join(root, "projects/orc-ds");
const specPath = path.join(library, "alias-parity.generated.spec.ts");
const checkOnly = process.argv.includes("--check");

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(file) : [file];
    })
    .sort();
const relative = (file) => path.relative(root, file).split(path.sep).join("/");

const sourceFiles = new Map(
  walk(library)
    .filter(
      (file) =>
        file.endsWith(".ts") &&
        !file.endsWith(".d.ts") &&
        !file.endsWith(".spec.ts"),
    )
    .map((file) => [file, ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true)]),
);

/** name of the package entry point a module specifier refers to, if any */
function packageEntry(specifier) {
  const match = /^@ciag\/orchestra(?:\/(.+))?$/.exec(specifier);
  return match ? (match[1] ?? "") : null;
}

/** resolve a module specifier used inside `fromFile` to a concrete file */
function resolveModule(specifier, fromFile) {
  const entry = packageEntry(specifier);
  if (entry !== null) {
    const dir = path.join(library, entry);
    const config = path.join(dir, "ng-package.json");
    if (!fs.existsSync(config)) return null;
    const { lib } = JSON.parse(fs.readFileSync(config, "utf8"));
    return path.join(dir, lib?.entryFile ?? "index.ts");
  }
  if (specifier.startsWith(".")) {
    const base = path.resolve(path.dirname(fromFile), specifier);
    for (const candidate of [base, `${base}.ts`, `${base}/index.ts`])
      if (sourceFiles.has(candidate)) return candidate;
  }
  return null;
}

/** exported value/type symbols plus re-export edges of one source file */
const moduleCache = new Map();
function moduleInfo(file) {
  if (moduleCache.has(file)) return moduleCache.get(file);
  const source = sourceFiles.get(file);
  const info = { declarations: new Map(), reexports: [], localImports: new Map() };
  moduleCache.set(file, info);
  if (!source) return info;

  const statements = source.statements;
  // import { X as Y } / import { type X } maps local name -> imported name
  for (const statement of statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const specifier = ts.isStringLiteral(statement.moduleSpecifier)
      ? statement.moduleSpecifier.text
      : "";
    const clause = statement.importClause;
    if (specifier.startsWith(".") || packageEntry(specifier) !== null) {
      for (const element of clause?.namedBindings?.elements ?? []) {
        const local = element.name.text;
        const imported = element.propertyName?.text ?? local;
        info.localImports.set(local, { imported, specifier });
      }
    }
  }

  const declare = (name, kind, isTypeOnly) => {
    if (!info.declarations.has(name)) info.declarations.set(name, { name, kind, isTypeOnly, file });
  };
  for (const statement of statements) {
    if (ts.isClassDeclaration(statement) && statement.name)
      declare(statement.name.text, "class", false);
    else if (ts.isFunctionDeclaration(statement) && statement.name)
      declare(statement.name.text, "function", false);
    else if (ts.isEnumDeclaration(statement))
      declare(statement.name.text, "enum", false);
    else if (ts.isInterfaceDeclaration(statement))
      declare(statement.name.text, "interface", true);
    else if (ts.isTypeAliasDeclaration(statement))
      declare(statement.name.text, "type", true);
    else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const name = declaration.name.text;
        declare(name, "const", false);
        if (statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
          info.reexports.push({ names: [{ source: name, exported: name }], file: undefined });
      }
    } else if (ts.isExportDeclaration(statement)) {
      const isTypeOnly = statement.isTypeOnly;
      if (!statement.exportClause && statement.moduleSpecifier) {
        info.reexports.push({ star: true, file: statement.moduleSpecifier.text, isTypeOnly });
      } else if (ts.isNamedExports(statement.exportClause)) {
        const names = statement.exportClause.elements.map((element) => ({
          source: (element.propertyName ?? element.name).text,
          exported: element.name.text,
          isTypeOnly: isTypeOnly || element.isTypeOnly,
        }));
        const module = statement.moduleSpecifier
          ? ts.isStringLiteral(statement.moduleSpecifier)
            ? statement.moduleSpecifier.text
            : null
          : undefined; // null = external, undefined = same-file re-export
        info.reexports.push({ names, file: module });
      }
    }
  }
  return info;
}

/**
 * Resolve an exported name of `file` to its declaring file + symbol.
 * Returns { file, name, kind, isTypeOnly } or { external } when the chain
 * leaves the library, or null when unresolvable.
 */
function resolveExport(file, name, seen = new Set()) {
  const key = `${file}::${name}`;
  if (seen.has(key)) return null;
  seen.add(key);
  const info = moduleInfo(file);
  for (const edge of info.reexports) {
    if (edge.star) {
      const target = resolveModule(edge.file, file);
      if (!target) continue;
      const resolution = resolveExport(target, name, seen);
      if (resolution && !resolution.ambiguous) return resolution;
      continue;
    }
    const match = edge.names.find((element) => element.exported === name);
    if (!match) continue;
    if (edge.file === null) return { external: true, name };
    if (edge.file === undefined) {
      // export { local } — a declaration in this file or an imported binding
      const declaration = info.declarations.get(match.source);
      if (declaration && !info.localImports.has(match.source)) return declaration;
      const imported = info.localImports.get(match.source);
      if (imported) {
        const target = resolveModule(imported.specifier, file);
        if (target) return resolveExport(target, imported.imported, seen);
        return { external: true, name: match.source };
      }
      return declaration ?? null;
    }
    const target = resolveModule(edge.file, file);
    if (!target) return { external: true, name };
    return resolveExport(target, match.source, seen);
  }
  const local = info.declarations.get(name);
  if (local && !isImportedOnly(info, name)) return local;
  const imported = info.localImports.get(name);
  if (imported) {
    const target = resolveModule(imported.specifier, file);
    if (target) return resolveExport(target, imported.imported, seen);
    return { external: true, name };
  }
  return local ?? null;
}

/** true when `name` only exists as an import binding (not a declaration) */
function isImportedOnly(info, name) {
  return !info.declarations.has(name) && info.localImports.has(name);
}

// ── classify entry points ────────────────────────────────────────────────
const entryPoints = [];
for (const configFile of walk(library)) {
  if (path.basename(configFile) !== "ng-package.json") continue;
  const dir = path.dirname(configFile);
  if (dir === library) continue;
  const { lib } = JSON.parse(fs.readFileSync(configFile, "utf8"));
  const file = path.join(dir, lib?.entryFile ?? "index.ts");
  const info = moduleInfo(file);
  const declaresLocally =
    exportsLocalDeclaration(file) ||
    info.reexports.some((edge) => edge.file === undefined && !edge.star);
  const packageReexports = info.reexports.filter(
    (edge) => typeof edge.file === "string" && packageEntry(edge.file) !== null,
  );
  const alias =
    !declaresLocally &&
    info.reexports.length > 0 &&
    info.reexports.every(
      (edge) => typeof edge.file === "string" && packageEntry(edge.file) !== null,
    );
  entryPoints.push({
    name: path.relative(library, dir).split(path.sep).join("/"),
    file,
    alias,
    reexports: alias ? packageReexports : [],
    declaresLocally,
  });
}

/** true when the file itself exports a declaration made in that file */
function exportsLocalDeclaration(file) {
  const source = sourceFiles.get(file);
  if (!source) return false;
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      if (statement.declarationList.declarations.some((d) => ts.isIdentifier(d.name))) return true;
    }
    if (
      (ts.isClassDeclaration(statement) ||
        ts.isFunctionDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)) &&
      statement.name &&
      statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      return true;
  }
  return false;
}

// ── resolve the alias surface ────────────────────────────────────────────
const aliases = [];
const findings = [];
for (const entry of entryPoints.filter((candidate) => candidate.alias)) {
  const exports = new Map();
  for (const edge of entry.reexports) {
    const target = resolveModule(edge.file, entry.file);
    if (!target) {
      findings.push(`${entry.name}: cannot resolve "${edge.file}"`);
      continue;
    }
    if (edge.star) {
      // collect the target's exported names
      const names = exportedNames(target, new Set());
      for (const name of names) {
        if (exports.has(name)) { findings.push(`${entry.name}: "export *" provides "${name}" more than once`); continue; }
        const resolution = resolveExport(target, name);
        exports.set(name, resolution);
      }
    } else {
      for (const element of edge.names) {
        const resolution = resolveExport(target, element.source);
        exports.set(element.exported, resolution ? { ...resolution, aliasTypeOnly: element.isTypeOnly } : null);
      }
    }
  }
  aliases.push({ name: entry.name, exports });
}

function exportedNames(file, seen) {
  if (seen.has(file)) return [];
  seen.add(file);
  const info = moduleInfo(file);
  const source = sourceFiles.get(file);
  const names = new Set();
  for (const statement of source?.statements ?? []) {
    const exported = statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations)
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
    } else if (
      (ts.isClassDeclaration(statement) ||
        ts.isFunctionDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)) &&
      statement.name
    ) {
      names.add(statement.name.text);
    } else if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) names.add(element.name.text);
    }
  }
  for (const edge of info.reexports) {
    if (edge.star) {
      const target = resolveModule(edge.file, file);
      if (target) for (const name of exportedNames(target, seen)) names.add(name);
    } else {
      for (const element of edge.names) names.add(element.exported);
    }
  }
  return [...names];
}

// ── validate & emit ──────────────────────────────────────────────────────
for (const alias of aliases) {
  for (const [name, resolution] of alias.exports) {
    if (!resolution) {
      findings.push(`@ciag/orchestra/${alias.name}: export "${name}" does not resolve to any library declaration`);
    } else if (resolution.external) {
      findings.push(`@ciag/orchestra/${alias.name}: export "${name}" resolves outside the library`);
    }
  }
}

const valid = (value) => typeof value === "string" && /^[a-zA-Z_$][\w$]*$/.test(value);
const sanitize = (dir) => dir.replace(/[^a-zA-Z0-9_$]/g, "_");

const lines = [];
const typeImports = [];
const checks = [];
let valueExports = 0;
let typeExports = 0;

for (const alias of aliases.sort((a, b) => a.name.localeCompare(b.name))) {
  const dirConst = sanitize(alias.name);
  const expectations = [];
  for (const [exportName, resolution] of [...alias.exports].sort(([a], [b]) => a.localeCompare(b))) {
    if (!resolution || resolution.external) continue;
    const local = `${dirConst}__${exportName}`;
    const canonicalModule = path
      .relative(library, resolution.file)
      .split(path.sep)
      .join("/")
      .replace(/\.ts$/, "");
    const canonicalImport = `./${canonicalModule}`;
    const canonicalLocal = `canonical__${sanitize(canonicalModule)}__${resolution.name}`;
    const isType =
      resolution.isTypeOnly ||
      resolution.aliasTypeOnly ||
      ["interface", "type"].includes(resolution.kind);
    if (isType) {
      typeExports += 1;
      if (valid(exportName)) {
        typeImports.push(`import type { ${exportName} as ${local} } from '@ciag/orchestra/${alias.name}';`);
        typeImports.push(`import type { ${resolution.name} as ${canonicalLocal} } from '${canonicalImport}';`);
        checks.push(`  // ${alias.name}.${exportName} === ${canonicalImport}#${resolution.name} (type-only, checked at generation time)`);
      }
    } else if (valid(exportName) && valid(resolution.name)) {
      valueExports += 1;
      lines.push(`import { ${exportName} as ${local} } from '@ciag/orchestra/${alias.name}';`);
      lines.push(`import { ${resolution.name} as ${canonicalLocal} } from '${canonicalImport}';`);
      expectations.push(
        `    expect(${local}).withContext('${alias.name}#${exportName}').toBe(${canonicalLocal});`,
      );
    }
  }
  if (expectations.length) {
    checks.push(
      `  it('@ciag/orchestra/${alias.name} re-exports the canonical declarations', () => {\n${expectations.join("\n")}\n  });`,
    );
  }
}

const generated = `// AUTO-GENERATED by tools/quality/generate-alias-parity.mjs — do not edit.
// Total alias guarantee: every alias entry point resolves to the same class
// (reference identity, not name equality) as its canonical declaration, and
// every import used below compiles in the spec build. Regenerate with:
//   npm run generate:alias-parity
// Alias entry points: ${aliases.length}. Value exports asserted: ${valueExports}. Type exports resolved: ${typeExports}.
${[...new Set(lines)].join("\n")}
${[...new Set(typeImports)].join("\n")}

describe('Alias entry points (generated identity sweep)', () => {
${checks.join("\n\n")}
});
`;

// Mirror the CLI's config resolution (the programmatic API skips
// .editorconfig unless asked), so `prettier --check` stays green.
const formatOptions = {
  ...(await prettier.resolveConfig(specPath, { editorconfig: true })),
  filepath: specPath,
};
const formatted = await prettier.format(generated, formatOptions);

if (findings.length) {
  console.error("Alias resolution findings (these block generation):");
  for (const finding of findings) console.error(`  - ${finding}`);
  process.exitCode = 1;
}

if (checkOnly) {
  if (!fs.existsSync(specPath) || fs.readFileSync(specPath, "utf8") !== formatted) {
    console.error(`${relative(specPath)} is stale. Run: npm run generate:alias-parity`);
    process.exitCode = 1;
  } else {
    console.log(`alias parity spec up to date (${aliases.length} alias entry points)`);
  }
} else {
  fs.writeFileSync(specPath, formatted);
  console.log(`wrote ${relative(specPath)} (${aliases.length} alias entry points, ${valueExports} value exports, ${typeExports} type exports)`);
}
if (findings.length === 0 && !checkOnly) console.log("no alias resolution findings");
