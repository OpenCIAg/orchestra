/**
 * Builds the coding-agent reference (`projects/docs/public/llms.md`) and the
 * llms manifest (`projects/docs/public/llms.txt`) from committed data instead
 * of hand-maintained lists:
 *
 * - catalog entries (`projects/docs/src/app/catalog/<id>.catalog.ts`) supply
 *   the documented families, routes, and usage guidance anchors;
 * - `docs/quality/inventory.json` supplies every secondary entry point with
 *   its export statements and every component declaration with its selector;
 * - the same family grouping as the docs renderer
 *   (`tools/docs/component-api-lib.mjs`) supplies inputs, models, and outputs.
 *
 * Hand-written narrative stays in `tools/docs/agent-reference/`:
 * `header.md` (operating rules, installation, API grammar), `footer.md`
 * (recipes, anti-patterns, verification checklist), and `notes/<family>.md`
 * (per-family guidance prose rendered above the generated API summary).
 * The output is committed; drift fails CI through `--check` in verify:docs.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { buildComponentApi } from './component-api-lib.mjs';
import {
  CATALOG_ID_FAMILY_ALIASES,
  deriveFamilyId,
} from '../quality/docs-coverage-lib.mjs';

/** Reads the colocated `<id>.catalog.ts` entries the same way the CI gate does. */
export function loadCatalogEntries(catalogDir) {
  const entries = [];
  const usageDocs = {};
  for (const file of fs
    .readdirSync(catalogDir)
    .filter((name) => name.endsWith('.catalog.ts'))
    .sort()) {
    const text = fs.readFileSync(path.join(catalogDir, file), 'utf8');
    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
    );
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isObjectLiteralExpression(declaration.initializer)) continue;
        const name = declaration.name.getText(source);
        if (name.endsWith('_CATALOG_ENTRY')) {
          entries.push(evaluateLiteral(declaration.initializer, source));
        } else if (name.endsWith('_USAGE_DOC')) {
          const doc = evaluateLiteral(declaration.initializer, source);
          usageDocs[doc.packagePath.split('/').pop()] = doc;
        }
      }
    }
  }
  entries.sort((a, b) => a.id.localeCompare(b.id));
  return { entries, usageDocs };
}

function evaluateLiteral(node, source) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => evaluateLiteral(element, source));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = property.name.getText(source).replace(/^['"]|['"]$/g, '');
      value[name] = evaluateLiteral(property.initializer, source);
    }
    return value;
  }
  throw new Error(
    `Unsupported literal in catalog entry: ${node.getText(source)}`,
  );
}

/** `projects/orc-ds/<dir>/index.ts` → `<dir>`. */
export function entryPointDir(entryPoint) {
  const file = entryPoint.file.replace(/\\/g, '/');
  const marker = 'projects/orc-ds/';
  const start = file.indexOf(marker);
  if (start < 0) return null;
  const segments = file
    .slice(start + marker.length)
    .split('/')
    .filter(Boolean);
  segments.pop(); // index.ts
  return segments.join('/');
}

/**
 * Resolves the documentation route id for an entry point: the catalog id when
 * one matches directly, otherwise the family id of the entry point's own
 * component declarations.
 */
export function resolveEntryPointFamily(entryPoint, context) {
  const name = entryPoint.name.replace(/^@ciag\/orchestra\//, '');
  if (context.catalogIds.has(name)) return name;
  const dir = entryPointDir(entryPoint);
  const declarations = dir ? (context.declarationsByDir.get(dir) ?? []) : [];
  const component = declarations.find((d) => d.kind === 'Component');
  return component ? deriveFamilyId(component) : null;
}

/** Resolves the documentation route id for a re-exported symbol name. */
export function resolveSymbolFamily(symbolName, context) {
  const declaration = context.declarationsByName.get(symbolName);
  if (!declaration) return null;
  try {
    return deriveFamilyId(declaration);
  } catch {
    // Services and selector-less declarations have no docs page.
    return null;
  }
}

export function docsUrl(context, familyId) {
  if (!familyId) return null;
  const id = CATALOG_ID_FAMILY_ALIASES[familyId] ?? familyId;
  return context.catalogIds.has(id)
    ? `${context.canonicalBase}/components/${id}`
    : null;
}

/**
 * Indexes the inventory for the reference renderer: family API (shared with
 * the docs app), declaration lookups by directory and by class name, and the
 * catalog id set.
 */
export function buildReferenceContext(
  inventory,
  catalogEntries,
  canonicalBase,
  usageDocs = {},
) {
  const declarations = inventory.declarations;
  const declarationsByDir = new Map();
  const declarationsByName = new Map();
  for (const declaration of declarations) {
    const segments = declaration.file.replace(/\\/g, '/').split('/');
    const orcDs = segments.indexOf('orc-ds');
    const dir = segments[orcDs + 1] ?? null;
    if (dir) {
      const list = declarationsByDir.get(dir) ?? [];
      list.push(declaration);
      declarationsByDir.set(dir, list);
    }
    declarationsByName.set(declaration.name, declaration);
  }
  return {
    canonicalBase,
    catalogIds: new Set(catalogEntries.map((entry) => entry.id)),
    catalogById: new Map(catalogEntries.map((entry) => [entry.id, entry])),
    catalogOrder: catalogEntries,
    usageDocs,
    declarationsByDir,
    declarationsByName,
    familyApi: buildComponentApi(inventory),
  };
}

function renderApiSummary(members) {
  const lines = [];
  for (const member of members) {
    const heading = [member.component];
    if (member.selector) heading.push(`(${member.selector})`);
    lines.push(`- **${heading.join(' ')}**`);
    for (const kind of ['input', 'model', 'output']) {
      const entries = member.entries.filter((entry) => entry.kind === kind);
      if (!entries.length) continue;
      const rendered = entries.map((entry) => {
        const parts = [`\`${entry.name}\``];
        if (entry.type) parts.push(`(${entry.type})`);
        if (entry.defaultValue !== null)
          parts.push(`default \`${entry.defaultValue}\``);
        if (entry.required) parts.push('required');
        return parts.join(' ');
      });
      const label =
        kind === 'input' ? 'Inputs' : kind === 'model' ? 'Models' : 'Outputs';
      lines.push(`  - ${label}: ${rendered.join(', ')}`);
    }
  }
  return lines;
}

function renderEntryPointRow(entryPoint, context) {
  const name = entryPoint.name.replace(/^@ciag\/orchestra\//, '');
  const dir = entryPointDir(entryPoint);
  const declarations = dir ? (context.declarationsByDir.get(dir) ?? []) : [];
  const selectors = declarations
    .filter(
      (declaration) => declaration.kind === 'Component' && declaration.selector,
    )
    .map((declaration) => declaration.selector.split(',')[0].trim())
    .filter(Boolean);
  const exports = selectors.length
    ? selectors.map((selector) => `\`${selector}\``)
    : declarations
        .filter((declaration) => declaration.kind !== 'Component')
        .map((declaration) => `\`${declaration.name}\``);
  const familyId = resolveEntryPointFamily(entryPoint, context);
  return {
    name,
    detail: exports.join(', ') || '—',
    docs: docsUrl(context, familyId),
  };
}

const P2_OPTION_SHAPE = `The shared generic option shape is:

\`\`\`ts
export interface OrcOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}
\`\`\`
`;

/**
 * Renders the full agent reference: hand-written header, generated package
 * map and component reference, hand-written footer.
 */
export function renderAgentReference({
  header,
  footer,
  notes,
  context,
  entryPoints,
  version,
}) {
  const lines = [];
  lines.push(header.replace(/\{\{VERSION\}\}/g, version).trimEnd());
  lines.push('');

  const sortedEntryPoints = [...entryPoints].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const rows = sortedEntryPoints.map((entryPoint) =>
    renderEntryPointRow(entryPoint, context),
  );
  lines.push('## 4. Complete package and entry-point map');
  lines.push('');
  lines.push(
    `The root public API exposes ${rows.length} secondary entry points, generated from the component inventory. Alias entry points intentionally point at the canonical implementation so applications can migrate terminology without duplicating behavior.`,
  );
  lines.push('');
  lines.push('| Entry point | Primary selectors or export | Docs |');
  lines.push('| ----------- | --------------------------- | ---- |');
  for (const row of rows) {
    lines.push(
      `| \`${row.name}\` | ${row.detail} | ${row.docs ? `[interactive docs](${row.docs})` : '—'} |`,
    );
  }
  lines.push('');

  lines.push('## 5. Component reference');
  lines.push('');
  lines.push(
    'The following sections list every documented component family with its public inputs, models, and outputs, generated from the component inventory. Defaults are the source defaults; a value such as `boolean` means the input is transformed from a bare HTML attribute. Guidance notes between families are maintained by hand.',
  );
  lines.push('');
  lines.push(P2_OPTION_SHAPE.trimEnd());
  lines.push('');

  for (const entry of context.catalogOrder) {
    const usagePackage = context.usageDocs[entry.id]?.packagePath;
    const packagePath =
      usagePackage ??
      `@ciag/orchestra/${CATALOG_ID_FAMILY_ALIASES[entry.id] ?? entry.id}`;
    lines.push(`### ${entry.name} — \`${packagePath}\``);
    lines.push('');
    const note = notes[entry.id];
    if (note) {
      lines.push(note.trimEnd());
      lines.push('');
    }
    const members =
      context.familyApi[CATALOG_ID_FAMILY_ALIASES[entry.id] ?? entry.id] ?? [];
    if (members.length) {
      lines.push(...renderApiSummary(members));
    } else {
      lines.push(
        `- No separate public bindings are inventoried for this id; it documents the \`${packagePath}\` surface.`,
      );
    }
    lines.push(
      `- Interactive docs: ${context.canonicalBase}/components/${entry.id}`,
    );
    lines.push('');
  }

  lines.push(footer.trimStart());
  return `${lines.join('\n').trimEnd()}\n`;
}

/** Renders the llms manifest linked from the site header and robots.txt. */
export function renderLlmsTxt({ canonicalBase }) {
  return `# Orchestra Design System

> Orchestra is an Angular component framework and design system with standalone components, native Signals, strict TypeScript APIs, tree-shakeable secondary entry points, design tokens, and WCAG 2.1 AA behavior.

Use the links below as the canonical reading order for coding agents. Prefer the component API reference over inventing a replacement control.

## Reference

- [Complete coding-agent reference](${canonicalBase}/llms.md): installation, imports, composition rules, accessibility behavior, all secondary entry points, components, properties, models, outputs, variants, and examples.
- [Interactive component catalog](${canonicalBase}/): live playgrounds and searchable component inventory.
- [Design documentation](${canonicalBase}/docs): brand principles, tokens, typography, spacing, assets, and usage guidance.
- [Source package entry points](https://github.com/OpenCIAg/orchestra): Angular library source and tests.

## Agent instructions

- Use standalone Angular imports from the narrowest \`@ciag/orchestra/<entry-point>\` package.
- Render Orchestra components with their \`orc-*\` selectors; do not replace them with generic buttons, inputs, cards, alerts, tabs, or layout primitives when an Orchestra component exists.
- Treat \`input()\` as a one-way input, \`model()\` as a two-way signal (\`[value]\`/\`(valueChange)\` or \`[(value)]\`), and \`output()\` as an event (\`(eventName)\`).
- Preserve labels, helper/error text, keyboard behavior, focus rings, and ARIA properties when composing controls.
- Load the token stylesheet before application styles: \`@use '@ciag/orchestra/styles/index';\`.
`;
}
