/**
 * Builds the generated component API reference consumed by the docs app.
 *
 * The docs pages must never hand-maintain inputs/outputs tables: this library
 * turns the component inventory (docs/quality/inventory.json, itself generated
 * from the library source) into a typed TypeScript module that the generic
 * documentation page renders. Family grouping reuses the coverage gate's
 * deriveFamilyId so catalog entries, routes, and API tables always agree on
 * what a "component family" is.
 */
import { deriveFamilyId } from "../quality/docs-coverage-lib.mjs";

/**
 * Reads one `input`/`model`/`output` declaration string from the inventory
 * and extracts the documented facets: declared type (first type argument or
 * primitive inferred from the default), default value (first call argument,
 * null when absent or when the argument is an options object), and whether
 * the binding is a required input.
 */
export function parseBindingDeclaration(declaration) {
  const text = declaration.trim().replace(/^@Input\([^)]*\)\s*/, "");
  const callMatch = text.match(
    /(?:^|\s)(input|model|output)(\.required)?\s*(?=[<(])/,
  );
  if (!callMatch) return { type: null, defaultValue: null, required: false };

  const scanner = new CharScanner(text.slice(callMatch.index));
  scanner.skip(/\s/);
  scanner.expect(callMatch[1]);
  scanner.skip(/\s/);
  if (callMatch[2]) scanner.expect(".required");
  scanner.skip(/\s/);

  let type = null;
  if (scanner.peek() === "<") {
    type = firstTypeArgument(scanner.readBalanced("<", ">"));
  }

  let defaultValue = null;
  scanner.skip(/\s/);
  if (scanner.peek() === "(") {
    const args = splitArguments(scanner.readBalanced("(", ")"));
    const first = args[0];
    if (first !== undefined && !/^\{/.test(first.trim())) {
      defaultValue = normalizeSourceText(first);
    }
  }

  return {
    type: type ?? inferPrimitiveType(defaultValue),
    defaultValue,
    required: Boolean(callMatch[2]),
  };
}

/** Extracts the type of a legacy decorator `set` binding, if present. */
export function parseLegacySetterType(declaration) {
  const match = declaration.match(/set\s+\w+\s*\([^:)]*:\s*([^)]+)\)/);
  return match ? normalizeSourceText(match[1]) : null;
}

class CharScanner {
  constructor(text) {
    this.text = text;
    this.index = 0;
  }
  peek() {
    return this.text[this.index];
  }
  expect(token) {
    if (!this.text.startsWith(token, this.index)) {
      throw new Error(`Expected "${token}" at ${this.index}`);
    }
    this.index += token.length;
  }
  skip(pattern) {
    while (
      this.index < this.text.length &&
      pattern.test(this.text[this.index])
    ) {
      this.index += 1;
    }
  }
  /** Consumes a balanced `<...>` or `(...)` region, respecting strings. */
  readBalanced(open, close) {
    if (this.peek() !== open) {
      throw new Error(`Expected "${open}" at ${this.index}`);
    }
    const start = this.index;
    let depth = 0;
    while (this.index < this.text.length) {
      const char = this.text[this.index];
      if (char === "'" || char === '"' || char === "`") {
        this.index = skipString(this.text, this.index, char);
        continue;
      }
      if (char === open) depth += 1;
      if (char === close) {
        depth -= 1;
        if (depth === 0) {
          const inner = this.text.slice(start + 1, this.index);
          this.index += 1;
          return inner;
        }
      }
      this.index += 1;
    }
    throw new Error(
      `Unbalanced "${open}" region in: ${this.text.slice(start, start + 80)}`,
    );
  }
}

function skipString(text, start, quote) {
  let index = start + 1;
  while (index < text.length) {
    if (text[index] === "\\") {
      index += 2;
      continue;
    }
    if (text[index] === quote) return index + 1;
    index += 1;
  }
  return index;
}

function splitArguments(inner) {
  const args = [];
  let depth = 0;
  let current = "";
  let index = 0;
  while (index < inner.length) {
    const char = inner[index];
    if (char === "'" || char === '"' || char === "`") {
      const end = skipString(inner, index, char);
      current += inner.slice(index, end);
      index = end;
      continue;
    }
    if (char === "(" || char === "{" || char === "[" || char === "<")
      depth += 1;
    if (char === ")" || char === "}" || char === "]" || char === ">")
      depth -= 1;
    if (char === "," && depth === 0) {
      args.push(current);
      current = "";
      index += 1;
      continue;
    }
    current += char;
    index += 1;
  }
  if (current.trim()) args.push(current);
  return args;
}

function firstTypeArgument(typeArguments) {
  const parts = splitArguments(typeArguments);
  return parts.length ? normalizeSourceText(parts[0]) : null;
}

function normalizeSourceText(source) {
  return source.replace(/\s+/g, " ").trim();
}

function inferPrimitiveType(defaultValue) {
  if (defaultValue === null) return null;
  if (defaultValue === "true" || defaultValue === "false") return "boolean";
  if (/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(defaultValue))
    return "number";
  if (/^(['"]).*\1$/.test(defaultValue)) return "string";
  return null;
}

const INPUT_KINDS = { signal: "input", model: "model", decorator: "input" };

/**
 * Groups an inventory's component declarations into families keyed by the
 * documentation route id. Deprecated bindings are dropped; members keep their
 * declaration order (inputs first, then outputs).
 */
export function buildComponentApi(inventory) {
  const families = new Map();
  for (const declaration of inventory.declarations) {
    if (declaration.kind !== "Component") continue;
    const family = deriveFamilyId(declaration);
    const entries = [];
    for (const member of declaration.inputs ?? []) {
      if (member.deprecated) continue;
      const parsed =
        member.kind === "decorator"
          ? {
              ...parseBindingDeclaration(member.declaration),
              type:
                parseBindingDeclaration(member.declaration).type ??
                parseLegacySetterType(member.declaration),
            }
          : parseBindingDeclaration(member.declaration);
      entries.push({
        kind: INPUT_KINDS[member.kind] ?? "input",
        name: member.publicName ?? member.name,
        type: parsed.type,
        defaultValue: parsed.defaultValue,
        required: Boolean(member.required ?? parsed.required),
        ...(member.description ? { description: member.description } : {}),
      });
    }
    for (const member of declaration.outputs ?? []) {
      if (member.deprecated) continue;
      const parsed = parseBindingDeclaration(member.declaration);
      entries.push({
        kind: "output",
        name: member.publicName ?? member.name,
        type: parsed.type,
        defaultValue: null,
        required: false,
        ...(member.description ? { description: member.description } : {}),
      });
    }
    const members = families.get(family) ?? [];
    members.push({
      component: declaration.name,
      selector: declaration.selector ?? null,
      entries,
    });
    families.set(family, members);
  }

  const api = {};
  for (const family of [...families.keys()].sort()) {
    api[family] = families
      .get(family)
      .sort((a, b) => a.component.localeCompare(b.component));
  }
  return api;
}

function quoteString(value) {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
  return `'${escaped}'`;
}

function renderEntry(entry, indent) {
  const pad = " ".repeat(indent);
  const lines = [
    `${pad}{`,
    `${pad}  kind: ${quoteString(entry.kind)},`,
    `${pad}  name: ${quoteString(entry.name)},`,
    `${pad}  type: ${entry.type === null ? "null" : quoteString(entry.type)},`,
    `${pad}  defaultValue: ${
      entry.defaultValue === null ? "null" : quoteString(entry.defaultValue)
    },`,
    `${pad}  required: ${entry.required},`,
  ];
  if (entry.description !== undefined) {
    lines.push(`${pad}  description: ${quoteString(entry.description)},`);
  }
  lines.push(`${pad}},`);
  return lines.join("\n");
}

function renderMember(member, indent) {
  const pad = " ".repeat(indent);
  const lines = [
    `${pad}{`,
    `${pad}  component: ${quoteString(member.component)},`,
    `${pad}  selector: ${
      member.selector === null ? "null" : quoteString(member.selector)
    },`,
  ];
  if (member.entries.length) {
    lines.push(`${pad}  entries: [`);
    for (const entry of member.entries) {
      lines.push(renderEntry(entry, indent + 4));
    }
    lines.push(`${pad}  ],`);
  } else {
    lines.push(`${pad}  entries: [],`);
  }
  lines.push(`${pad}},`);
  return lines.join("\n");
}

/**
 * Emits one family's API reference module. Each family is its own file so the
 * generic documentation page can lazy-load exactly the API table it renders
 * instead of pulling every family's reference into one chunk. Objects are
 * always printed expanded (newline after the opening brace), which prettier
 * preserves, so the output is stable under `prettier --check` without a
 * formatting pass.
 */
export function renderFamilyModule(family, members) {
  const lines = [
    "// Generated by tools/docs/generate-component-api.mjs from docs/quality/inventory.json.",
    "// DO NOT EDIT BY HAND — run `npm run docs:generate-api` to regenerate.",
    "",
    "import type { ComponentApiMember } from '../../models/component-api.model';",
    "",
    "export const COMPONENT_API: Readonly<ComponentApiMember[]> = [",
  ];
  for (const member of members) {
    lines.push(renderMember(member, 2));
  }
  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

/**
 * Emits the lazy-loader registry consumed by the generic documentation page.
 * One dynamic import per family keeps each API reference out of the renderer
 * bundle and out of every other family's chunk.
 */
export function renderRegistryModule(families) {
  const lines = [
    "// Generated by tools/docs/generate-component-api.mjs from docs/quality/inventory.json.",
    "// DO NOT EDIT BY HAND — run `npm run docs:generate-api` to regenerate.",
    "",
    "import type { ComponentApiLoader } from '../models/component-api.model';",
    "",
    "export const COMPONENT_API_LOADERS: Readonly<",
    "  Record<string, ComponentApiLoader>",
    "> = {",
  ];
  for (const family of families) {
    // Prettier unquotes property names that are valid identifiers and keeps
    // quotes otherwise (kebab-case ids); mirror that rule to stay stable.
    const key = /^[A-Za-z_$][\w$]*$/.test(family)
      ? family
      : quoteString(family);
    lines.push(
      `  ${key}: () => import('./component-api/${family}.generated').then((m) => m.COMPONENT_API),`,
    );
  }
  lines.push("};");
  lines.push("");
  return lines.join("\n");
}
