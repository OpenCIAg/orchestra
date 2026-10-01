#!/usr/bin/env node
/**
 * CI gate: every inventoried component family must have a colocated catalog
 * entry and a resolvable documentation page route. Usage:
 *   node tools/quality/check-docs-coverage.mjs
 * Exits non-zero when the catalog does not cover the inventory.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { evaluateCoverage } from "./docs-coverage-lib.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function evaluateLiteral(node, source) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((element) => evaluateLiteral(element, source));
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = property.name.getText(source).replace(/^['"]|['"]$/g, "");
      value[name] = evaluateLiteral(property.initializer, source);
    }
    return value;
  }
  throw new Error(`Unsupported literal in catalog entry: ${node.getText(source)}`);
}

function readCatalogEntries(catalogDir) {
  const entries = [];
  const problems = [];
  for (const file of fs
    .readdirSync(catalogDir)
    .filter((name) => name.endsWith(".catalog.ts"))
    .sort()) {
    const text = fs.readFileSync(path.join(catalogDir, file), "utf8");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isObjectLiteralExpression(declaration.initializer)) continue;
        if (!declaration.name.getText(source).endsWith("_CATALOG_ENTRY")) continue;
        const entry = evaluateLiteral(declaration.initializer, source);
        const expectedFile = `${entry.id}.catalog.ts`;
        if (file !== expectedFile)
          problems.push(
            `${file} must be named ${expectedFile} to match its entry id`,
          );
        entries.push(entry);
      }
    }
  }
  return { entries, problems };
}

function readRoutePaths(routesFile) {
  const text = fs.readFileSync(routesFile, "utf8");
  const source = ts.createSourceFile(routesFile, text, ts.ScriptTarget.Latest, true);
  const paths = [];
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === "path" &&
      ts.isStringLiteralLike(node.initializer)
    )
      paths.push(node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return paths;
}

const catalogDir = path.join(root, "projects/docs/src/app/catalog");
if (!fs.existsSync(catalogDir)) {
  console.error(`Catalog directory not found: ${path.relative(root, catalogDir)}`);
  process.exit(1);
}
const { entries, problems } = readCatalogEntries(catalogDir);
const inventory = JSON.parse(
  fs.readFileSync(path.join(root, "docs/quality/inventory.json"), "utf8"),
);
const declarations = inventory.declarations.filter(
  (declaration) => declaration.kind === "Component",
);
const routePaths = readRoutePaths(
  path.join(root, "projects/docs/src/app/app.routes.ts"),
);
const coverage = evaluateCoverage({ declarations, catalogEntries: entries, routePaths });

const problemsAll = [
  ...problems,
  ...coverage.missingCatalog.map(
    (family) =>
      `no catalog entry for component family "${family}" (${coverage.familyIndex.get(family).join(", ")})`,
  ),
  ...coverage.duplicateCatalogIds.map((id) => `duplicate catalog id "${id}"`),
  ...coverage.catalogIdsWithoutFamily.map(
    (id) => `catalog id "${id}" does not match any inventoried component family`,
  ),
  ...coverage.unresolvedRoutes.map(
    ({ id, route }) => `catalog entry "${id}" route ${route} does not resolve to a documentation page`,
  ),
];

const report = {
  totalComponents: coverage.totalComponents,
  coveredComponents: coverage.coveredComponents,
  catalogEntries: entries.length,
  families: coverage.families.length,
  problems: problemsAll,
};
console.log(JSON.stringify(report, null, 2));
if (problemsAll.length) {
  console.error(
    "\nDocumentation coverage gate failed. Add a catalog/<id>.catalog.ts entry for each missing family.",
  );
  process.exit(1);
}
