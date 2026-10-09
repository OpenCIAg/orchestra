#!/usr/bin/env node
/**
 * CI gate: every inventoried component family must have an entry in the docs
 * registry (content/components/<id>/ or, during the 22.4 transition, a legacy
 * catalog/<id>.catalog.ts) and a resolvable documentation route. Usage:
 *   node tools/quality/check-docs-coverage.mjs
 * Exits non-zero when the catalog does not cover the inventory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { evaluateCoverage } from './docs-coverage-lib.mjs';
import { loadDocsRegistry } from '../docs/docs-registry-lib.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

function readRoutePaths(routesFile) {
  const text = fs.readFileSync(routesFile, 'utf8');
  const source = ts.createSourceFile(
    routesFile,
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  const paths = [];
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === 'path' &&
      ts.isStringLiteralLike(node.initializer)
    )
      paths.push(node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return paths;
}

const registry = loadDocsRegistry(root);
const entries = registry.entries;
const problems = registry.problems;
const inventory = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/quality/inventory.json'), 'utf8'),
);
const declarations = inventory.declarations.filter(
  (declaration) => declaration.kind === 'Component',
);
const routePaths = [
  ...readRoutePaths(path.join(root, 'projects/docs/src/app/app.routes.ts')),
  ...readRoutePaths(
    path.join(
      root,
      'projects/docs/src/app/generated/docs-registry/routes.generated.ts',
    ),
  ),
];
const coverage = evaluateCoverage({
  declarations,
  catalogEntries: entries,
  routePaths,
});

const problemsAll = [
  ...problems,
  ...coverage.missingCatalog.map(
    (family) =>
      `no catalog entry for component family "${family}" (${coverage.familyIndex.get(family).join(', ')})`,
  ),
  ...coverage.duplicateCatalogIds.map((id) => `duplicate catalog id "${id}"`),
  ...coverage.catalogIdsWithoutFamily.map(
    (id) =>
      `catalog id "${id}" does not match any inventoried component family`,
  ),
  ...coverage.unresolvedRoutes.map(
    ({ id, route }) =>
      `catalog entry "${id}" route ${route} does not resolve to a documentation page`,
  ),
];

const report = {
  totalComponents: coverage.totalComponents,
  coveredComponents: coverage.coveredComponents,
  catalogEntries: entries.length,
  contentFamilies: registry.content.length,
  families: coverage.families.length,
  problems: problemsAll,
};
console.log(JSON.stringify(report, null, 2));
if (problemsAll.length) {
  console.error(
    '\nDocumentation coverage gate failed. Add content/components/<id>/ for each missing family (docs/overhaul/GUIA-DOCS.md) and run npm run docs:generate-registry.',
  );
  process.exit(1);
}
