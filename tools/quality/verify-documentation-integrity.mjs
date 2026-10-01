import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
}

const qualityFiles = walk(path.join(root, "docs/quality")).filter((file) =>
  file.endsWith(".md"),
);
const publicGuide = path.join(root, "projects/docs/public/llms.md");
const unresolved = [];
let qualityLocalLinks = 0;
let publicGuideLocalLinks = 0;
let sourceAnchors = 0;
let p2SourceAnchors = 0;
const linkPattern = /\[[^\]]*\]\((<[^>]+>|[^)]+)\)/g;

for (const file of [...qualityFiles, publicGuide]) {
  const source = fs.readFileSync(file, "utf8");
  let match;
  while ((match = linkPattern.exec(source))) {
    let raw = match[1].trim();
    if (raw.startsWith("<") && raw.endsWith(">")) raw = raw.slice(1, -1);
    raw = raw.replace(/\s+["'][^"']*["']\s*$/, "").trim();
    if (!raw || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw))
      continue;

    const hashIndex = raw.indexOf("#");
    const pathname = hashIndex < 0 ? raw : raw.slice(0, hashIndex);
    const fragment = hashIndex < 0 ? "" : raw.slice(hashIndex + 1);
    if (!pathname) continue;

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      decodedPath = pathname;
    }
    const target = path.resolve(path.dirname(file), decodedPath);
    if (file === publicGuide) publicGuideLocalLinks++;
    else qualityLocalLinks++;
    if (!fs.existsSync(target)) {
      unresolved.push(`${path.relative(root, file)} -> ${raw}`);
      continue;
    }

    const lineAnchor = fragment.match(/^L(\d+)$/);
    if (!lineAnchor) continue;
    sourceAnchors++;
    const line = Number(lineAnchor[1]);
    const isFile = fs.statSync(target).isFile();
    const lineCount = isFile
      ? fs.readFileSync(target, "utf8").split(/\r?\n/).length
      : 0;
    if (!isFile || line < 1 || line > lineCount) {
      unresolved.push(
        `${path.relative(root, file)} -> ${raw} (line out of range)`,
      );
    }
    if (decodedPath.includes("/p2/")) p2SourceAnchors++;
  }
}

const inventory = JSON.parse(
  fs.readFileSync(path.join(root, "docs/quality/inventory.json"), "utf8"),
);
const components = inventory.declarations.filter(
  (declaration) => declaration.kind === "Component",
);
const directiveAndServiceDeclarations = inventory.declarations.filter(
  (declaration) =>
    declaration.kind === "Directive" || declaration.kind === "Injectable",
);
const sourceAnchorsOutOfDate = [];
const parsedSources = new Map();
for (const declaration of components) {
  const sourcePath = path.resolve(root, declaration.file);
  let source = parsedSources.get(sourcePath);
  if (!source) {
    source = ts.createSourceFile(
      sourcePath,
      fs.readFileSync(sourcePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    parsedSources.set(sourcePath, source);
  }
  const node = source.statements.find(
    (statement) =>
      ts.isClassDeclaration(statement) &&
      statement.name?.text === declaration.name &&
      ts
        .getDecorators(statement)
        ?.some(
          (decorator) =>
            ts.isCallExpression(decorator.expression) &&
            decorator.expression.expression.getText(source) === "Component",
        ),
  );
  if (!node) {
    sourceAnchorsOutOfDate.push({
      name: declaration.name,
      file: declaration.file,
      inventoryLine: declaration.line,
      sourceLine: null,
    });
    continue;
  }
  const sourceLine =
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  if (sourceLine !== declaration.line) {
    sourceAnchorsOutOfDate.push({
      name: declaration.name,
      file: declaration.file,
      inventoryLine: declaration.line,
      sourceLine,
    });
  }
}
const ledgerPath = path.join(root, "docs/quality/behavior-coverage-ledger.md");
const ledgerLines = fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/);
const ledgerRows = [];
const coverageSpecMismatches = [];
for (const line of ledgerLines) {
  if (!line.startsWith("|")) continue;
  const columns = line.split("|");
  if (columns.length < 4) continue;
  const name = columns[1].trim();
  const reference = columns[2].match(
    /\[[^\]]+:([0-9]+)\]\(([^)#]+)#L([0-9]+)\)/,
  );
  if (reference) {
    const delimiters = [...line.matchAll(/\|/g)].map((match) => match.index);
    const evidence = line.slice(delimiters[3] + 1, delimiters[4]);
    const coverage = line.slice(delimiters[4] + 1, delimiters.at(-1));
    const evidenceSpecs = new Set(
      [...evidence.matchAll(/[\w./-]+\.spec\.ts/g)].map((item) =>
        path.basename(item[0]),
      ),
    );
    const coverageSpecs = [
      ...new Set(
        [...coverage.matchAll(/[\w./-]+\.spec\.ts/g)].map((item) =>
          path.basename(item[0]),
        ),
      ),
    ];
    for (const spec of coverageSpecs)
      if (!evidenceSpecs.has(spec)) coverageSpecMismatches.push({ name, spec });
    ledgerRows.push({
      name,
      line: Number(reference[1]),
      href: reference[2],
      anchor: Number(reference[3]),
    });
  }
}

const ledgerNames = new Set(ledgerRows.map((row) => row.name));
const componentNames = new Set(
  components.map((declaration) => declaration.name),
);
const ledgerMissing = components
  .filter((declaration) => !ledgerNames.has(declaration.name))
  .map((declaration) => declaration.name);
const ledgerExtra = ledgerRows
  .filter((row) => !componentNames.has(row.name))
  .map((row) => row.name);
const bad = [];
for (const declaration of components) {
  const row = ledgerRows.find(
    (candidate) => candidate.name === declaration.name,
  );
  if (
    row &&
    (!row.href.endsWith(declaration.file) ||
      row.line !== declaration.line ||
      row.anchor !== declaration.line)
  ) {
    bad.push({
      name: declaration.name,
      ledger: row,
      inventory: { file: declaration.file, line: declaration.line },
    });
  }
}

const directiveServiceLedgerPath = path.join(
  root,
  "docs/quality/directive-service-contract-ledger.md",
);
const directiveServiceLedgerRows = fs
  .readFileSync(directiveServiceLedgerPath, "utf8")
  .split(/\r?\n/)
  .flatMap((line) => {
    const match = line.match(/^\|\s+\[([^\]]+)\]\(([^)#]+)#L(\d+)\)/);
    return match
      ? [{ name: match[1], href: match[2], anchor: Number(match[3]) }]
      : [];
  });
const directiveServiceNames = new Set(
  directiveServiceLedgerRows.map((row) => row.name),
);
const declarationNames = new Set(
  directiveAndServiceDeclarations.map((declaration) => declaration.name),
);
const directiveServiceLedgerMissing = directiveAndServiceDeclarations
  .filter((declaration) => !directiveServiceNames.has(declaration.name))
  .map((declaration) => declaration.name);
const directiveServiceLedgerExtra = directiveServiceLedgerRows
  .filter((row) => !declarationNames.has(row.name))
  .map((row) => row.name);
const directiveServiceAnchorsOutOfDate = [];
for (const row of directiveServiceLedgerRows) {
  const declaration = directiveAndServiceDeclarations.find(
    (candidate) => candidate.name === row.name,
  );
  if (!declaration) continue;
  const linkedSource = path.resolve(
    path.dirname(directiveServiceLedgerPath),
    row.href,
  );
  const inventorySource = path.resolve(root, declaration.file);
  if (linkedSource !== inventorySource || row.anchor !== declaration.line) {
    directiveServiceAnchorsOutOfDate.push({
      name: row.name,
      ledger: { href: row.href, anchor: row.anchor },
      inventory: { file: declaration.file, line: declaration.line },
    });
  }
}

const result = {
  qualityMarkdown: qualityFiles.length,
  localMarkdownLinks: qualityLocalLinks,
  publicLlmsLocalLinks: publicGuideLocalLinks,
  sourceAnchors,
  p2SourceAnchors,
  ledgerRows: ledgerRows.length,
  inventoryComponents: components.length,
  directiveServiceLedgerRows: directiveServiceLedgerRows.length,
  inventoryDirectivesAndServices: directiveAndServiceDeclarations.length,
  sourceAnchorsOutOfDate,
  ledgerMissing,
  ledgerExtra,
  coverageSpecMismatches,
  directiveServiceLedgerMissing,
  directiveServiceLedgerExtra,
  directiveServiceAnchorsOutOfDate,
  bad,
  unresolved,
};
console.log(JSON.stringify(result, null, 2));
if (
  unresolved.length ||
  sourceAnchorsOutOfDate.length ||
  ledgerMissing.length ||
  ledgerExtra.length ||
  coverageSpecMismatches.length ||
  directiveServiceLedgerMissing.length ||
  directiveServiceLedgerExtra.length ||
  directiveServiceAnchorsOutOfDate.length ||
  bad.length ||
  ledgerRows.length !== components.length ||
  directiveServiceLedgerRows.length !== directiveAndServiceDeclarations.length
) {
  process.exitCode = 1;
}
