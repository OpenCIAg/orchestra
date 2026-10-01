import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
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
const ledgerPath = path.join(root, "docs/quality/behavior-coverage-ledger.md");
const ledgerLines = fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/);
const ledgerRows = [];
for (const line of ledgerLines) {
  if (!line.startsWith("|")) continue;
  const columns = line.split("|");
  if (columns.length < 4) continue;
  const name = columns[1].trim();
  const reference = columns[2].match(
    /\[[^\]]+:([0-9]+)\]\(([^)#]+)#L([0-9]+)\)/,
  );
  if (reference)
    ledgerRows.push({
      name,
      line: Number(reference[1]),
      href: reference[2],
      anchor: Number(reference[3]),
    });
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

const result = {
  qualityMarkdown: qualityFiles.length,
  localMarkdownLinks: qualityLocalLinks,
  publicLlmsLocalLinks: publicGuideLocalLinks,
  sourceAnchors,
  p2SourceAnchors,
  ledgerRows: ledgerRows.length,
  inventoryComponents: components.length,
  ledgerMissing,
  ledgerExtra,
  bad,
  unresolved,
};
console.log(JSON.stringify(result, null, 2));
if (
  unresolved.length ||
  ledgerMissing.length ||
  ledgerExtra.length ||
  bad.length ||
  ledgerRows.length !== components.length
) {
  process.exitCode = 1;
}
