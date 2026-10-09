// Gate manifest library (ticket #19).
//
// Pure seam shared by the CLI (tools/release/generate-gate-manifest.mjs), the
// deprecation guard (tools/release/deprecation-guard-lib.mjs), and the unit
// tests. The caller supplies the library source as a file map (path ->
// contents, POSIX separators); this module enumerates everything scheduled
// for removal at the 23.0.0 gate and renders the human migration guide.
//
// Everything enumerated here is scanned from source on every run — there is
// no hand-maintained list of members. The only declared data is semantic:
// (a) the old->new pairs whose legacy name is not syntactically marked in
// source (table's value/dataKey/..., modal visible, select searchable),
// (b) the consumer's production-used symbols (the notes/06-consumer-scan
// knowledge). Both are verified against the scanned source on every
// generation, so they fail loudly when the source moves under them.
import ts from 'typescript';

export const GATE_VERSION = '23.0.0';
export const LIBRARY_ROOT = 'projects/orc-ds';

const MANIFEST_JSON_PATH = 'docs/quality/gate-23-manifest.json';
const MIGRATION_GUIDE_PATH = 'docs/quality/gate-23-migration.md';

export const MANIFEST_PATHS = {
  json: MANIFEST_JSON_PATH,
  guide: MIGRATION_GUIDE_PATH,
};

/**
 * The legacy names the changesets schedule for gate removal whose marking is
 * semantic, not syntactic: no AST rule derives "value is the legacy name of
 * data" from `readonly value = input(...)`. Every entry is verified against
 * the scanned class members on each generation (a rename or removal without
 * a manifest update fails generation), so this table cannot go stale.
 *
 * canonicalName null means the replacement decision belongs to the human
 * gate review; the entry is flagged replacement-TBD.
 */
export const DECLARED_DUAL_NAMES = [
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'value',
    canonicalName: 'data',
    note: 'Table consolidation: PrimeNG-era data alias; canonical `data` input.',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'dataKey',
    canonicalName: 'rowKey',
    note: 'Table consolidation: PrimeNG-era row-identity name; canonical `rowKey` input.',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'rowsPerPageOptions',
    canonicalName: 'pageSizeOptions',
    note: 'Table consolidation: PrimeNG-era paging name; canonical `pageSizeOptions` input.',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'globalFilterFields',
    canonicalName: null,
    note: 'Filtering already follows the declared `orc-column` keys when unset; keep or drop is a gate decision.',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'tableStyle',
    canonicalName: 'tableStyleClass',
    note: 'Table consolidation: inline style object; canonical `tableStyleClass` input or component styles.',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'filterable',
    canonicalName: null,
    note: 'No other name on this component; removal-or-replacement is a gate decision (table consolidation changeset).',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'scrollable',
    canonicalName: null,
    note: 'No other name on this component (with `scrollHeight`); removal-or-replacement is a gate decision (table consolidation changeset).',
  },
  {
    component: 'TableComponent',
    kind: 'input',
    name: 'scrollHeight',
    canonicalName: null,
    note: 'Companion of `scrollable`; removal-or-replacement is a gate decision (table consolidation changeset).',
  },
  {
    component: 'ModalComponent',
    kind: 'model',
    name: 'visible',
    canonicalName: 'isOpen',
    note: 'PrimeNG Dialog-compatible visibility model; Orchestra callers use `isOpen`.',
  },
  {
    component: 'DatePickerComponent',
    kind: 'output',
    name: 'onSelect',
    canonicalName: null,
    replacementText:
      'the `value` model (`valueChange`) plus `dateSelected` on `orc-calendar`',
    note: 'PrimeNG-era selection output; canonical replacement recorded by the calendar consolidation changeset (production-used).',
  },
  {
    component: 'SelectComponent',
    kind: 'input',
    name: 'searchable',
    canonicalName: 'filter',
    note: 'PrimeNG-era enable-filter boolean; canonical `filter` input (select reads `filter ?? searchable`).',
  },
  {
    component: 'SelectComponent',
    kind: 'input',
    name: 'showClear',
    canonicalName: null,
    note: 'PrimeNG-era clear affordance input; replacement is a gate decision (production-used).',
  },
  {
    component: 'DatePickerComponent',
    kind: 'input',
    name: 'dateFormat',
    canonicalName: null,
    replacementText:
      'the canonical ISO `yyyy-MM-dd` model with locale-driven input presentation',
    note: 'PrimeNG-era format string; canonical replacement recorded by the calendar consolidation changeset (production-used).',
  },
  {
    component: 'DatePickerComponent',
    kind: 'input',
    name: 'selectionMode',
    canonicalName: null,
    note: 'PrimeNG-era selection-shape input; no other name on this component — removal-or-rename stays with the gate manifest (production-used).',
  },
  {
    component: 'DatePickerComponent',
    kind: 'input',
    name: 'readonlyInput',
    canonicalName: null,
    replacementText: "the native input's `readonly` attribute",
    note: 'PrimeNG-era editable-input toggle; canonical replacement recorded by the calendar consolidation changeset (production-used).',
  },
  {
    component: 'DatePickerComponent',
    kind: 'input',
    name: 'dataType',
    canonicalName: null,
    note: 'PrimeNG-era value-type input; bind the model type you want — no other input name exists on this component, removal-or-rename stays with the gate manifest (production-used).',
  },
  {
    component: 'DatePickerComponent',
    kind: 'input',
    name: 'styleClass',
    canonicalName: null,
    note: 'PrimeNG-era styling hook; replacement is a gate decision (production-used, with `switch` too).',
  },
  {
    component: 'SwitchComponent',
    kind: 'input',
    name: 'styleClass',
    canonicalName: null,
    note: 'PrimeNG-era styling hook; replacement is a gate decision (production-used).',
  },
  {
    component: 'FileUploaderComponent',
    kind: 'input',
    name: 'mode',
    canonicalName: null,
    note: 'PrimeNG-era uploader mode; replacement is a gate decision (production-used).',
  },
  {
    component: 'FileUploaderComponent',
    kind: 'input',
    name: 'customUpload',
    canonicalName: null,
    note: 'PrimeNG-era upload handling flag; replacement is a gate decision (production-used).',
  },
  {
    component: 'FileUploaderComponent',
    kind: 'input',
    name: 'chooseLabel',
    canonicalName: null,
    note: 'PrimeNG-era button label; replacement is a gate decision (production-used).',
  },
  {
    component: 'FileUploaderComponent',
    kind: 'input',
    name: 'maxFiles',
    canonicalName: null,
    note: 'PrimeNG-era file-count limit; replacement is a gate decision (production-used).',
  },
];

/**
 * The sole known consumer's live compat dependencies (2026-10-01 scan of
 * gestao-de-projetos, notes/06-consumer-scan.md). Entries matching this list
 * are flagged `productionUse: true` — removal requires the migration guide,
 * not just a release note. Rows are verified against the scanned source on
 * every generation so the list fails loudly once the consumer migrates and
 * the names disappear.
 */
export const PRODUCTION_USE = [
  { component: 'TableComponent', name: 'value' },
  { component: 'TableComponent', name: 'dataKey' },
  { component: 'TableComponent', name: 'rowsPerPageOptions' },
  { component: 'TableComponent', name: 'globalFilterFields' },
  { component: 'TableComponent', name: 'tableStyle' },
  { component: 'TableComponent', name: 'filterable' },
  { component: 'TableComponent', name: 'scrollable' },
  { component: 'SelectComponent', name: 'onChange' },
  { component: 'SelectComponent', name: 'showClear' },
  { component: 'DatePickerComponent', name: 'onSelect' },
  { component: 'DatePickerComponent', name: 'dateFormat' },
  { component: 'DatePickerComponent', name: 'selectionMode' },
  { component: 'DatePickerComponent', name: 'readonlyInput' },
  { component: 'DatePickerComponent', name: 'dataType' },
  { component: 'DatePickerComponent', name: 'styleClass' },
  { component: 'MultiSelectComponent', name: 'onFilter' },
  { component: 'FileUploaderComponent', name: 'onSelect' },
  { component: 'FileUploaderComponent', name: 'onRemove' },
  { component: 'FileUploaderComponent', name: 'onClear' },
  { component: 'FileUploaderComponent', name: 'onError' },
  { component: 'FileUploaderComponent', name: 'mode' },
  { component: 'FileUploaderComponent', name: 'customUpload' },
  { component: 'FileUploaderComponent', name: 'chooseLabel' },
  { component: 'FileUploaderComponent', name: 'maxFiles' },
  { component: 'SwitchComponent', name: 'styleClass' },
];

export const PRODUCTION_SCAN_REF =
  'notes/06-consumer-scan.md (gestao-de-projetos scan, 2026-10-01)';

import fs from 'node:fs';
import path from 'node:path';

const walkRepo = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walkRepo(file) : [file];
    })
    .sort();

/** Selectable source files for the scans (posix-relative to the repo root). */
/** Selectable source files for the scans (posix-relative to the repo root).
 * Includes ng-package.json (the alias scan's entry-point discovery); the AST
 * scans only read .ts/.html/.scss sources. */
export function librarySourceFiles(repoRoot) {
  const libraryDir = path.join(repoRoot, LIBRARY_ROOT);
  return walkRepo(libraryDir)
    .filter(
      (file) =>
        (/\.(ts|html|scss)$/.test(file) &&
          !file.endsWith('.d.ts') &&
          !file.endsWith('.spec.ts') &&
          !file.endsWith('icon-catalog.ts')) ||
        file.replace(/\\/g, '/').endsWith('/ng-package.json'),
    )
    .reduce((map, file) => {
      const key = path.relative(repoRoot, file).split(path.sep).join('/');
      map[key] = fs.readFileSync(file, 'utf8');
      return map;
    }, {});
}

// ── source model ───────────────────────────────────────────────────────────

const parse = (source) =>
  ts.createSourceFile('x.ts', source, ts.ScriptTarget.Latest, true);

/** class declarations with their @Component selector, keyed by class name. */
export function classModel(files) {
  const classes = new Map();
  for (const [file, source] of Object.entries(files)) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue;
    const parsed = parse(source);
    for (const statement of parsed.statements) {
      if (!ts.isClassDeclaration(statement) || !statement.name) continue;
      const decorator = ts
        .getDecorators(statement)
        ?.find(
          (item) =>
            ts.isCallExpression(item.expression) &&
            ['Component', 'Directive'].includes(
              item.expression.expression.getText(parsed),
            ),
        );
      let selector;
      if (decorator) {
        const metadata = decorator.expression.arguments[0];
        if (metadata && ts.isObjectLiteralExpression(metadata)) {
          const property = metadata.properties.find(
            (item) => item.name?.getText(parsed) === 'selector',
          );
          selector = property?.initializer?.text;
        }
      }
      classes.set(statement.name.text, {
        name: statement.name.text,
        file,
        selector,
        node: statement,
        source: parsed,
      });
    }
  }
  return classes;
}

const entryPointForFile = (file) => {
  // projects/orc-ds/<entry>/<file>.ts → @ciag/orchestra/<entry>
  const segments = file.split('/');
  return `@ciag/orchestra/${segments[2]}`;
};

/** JSDoc text + @deprecated tag for a member/declaration node. */
function jsdocOf(node) {
  const tags = ts.getJSDocTags(node);
  const deprecatedTag = tags.find((tag) => tag.tagName.text === 'deprecated');
  const flatten = (text) =>
    typeof text === 'string' ? normalizeJSDoc(text) : '';
  const comments = ts
    .getJSDocCommentsAndTags(node)
    .map((tag) => flatten(tag.comment))
    .filter(Boolean);
  return {
    deprecated: Boolean(deprecatedTag),
    comment: comments.join(' '),
    deprecatedComment: flatten(deprecatedTag?.comment),
  };
}

/** JSDoc text arrives with raw newlines and ` * ` continuations; flatten it so
 * phrase matching ("removed at the 23.0.0 gate") spans wrapped lines. */
export function normalizeJSDoc(text) {
  return text
    .replace(/[\r\n]+\s*\*\s?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const signalKindOf = (member, source) => {
  const initializer = member.initializer;
  if (!initializer || !ts.isCallExpression(initializer)) return null;
  const call = initializer.expression.getText(source);
  if (/^input(\.required)?$/.test(call)) return 'input';
  if (/^model(\.required)?$/.test(call)) return 'model';
  if (/^(output|outputFromObservable)$/.test(call)) return 'output';
  return null;
};

/** first replacement name the JSDoc suggests. A backticked name after "use"
 * is always an API reference; a bare capture must not follow an article
 * ("use the fixed renderer" is prose, "use size and caller CSS" names the
 * canonical input). */
export function parseReplacement(text) {
  const backticked = text.match(
    /\buse (?:the )?(?:supported |documented |canonical )?`([A-Za-z][\w-]*)`/i,
  );
  if (backticked) return backticked[1];
  const bare = text.match(/\buse (?!the\s|a\s|an\s)([A-Za-z][\w$]*)\b/i);
  return bare ? bare[1] : null;
}

const LEGACY_VALUE_GATE_PHRASE = 'removed at the 23.0.0 gate';
const LEGACY_VALUE_PAIRS = /`([a-z0-9]+)`\s*→\s*`([a-z0-9]+)`/g;
/** The one size vocabulary every widened control normalizes onto. */
export const CANONICAL_SIZE_SCALE = 'sm | md | lg';

/** legacy value mappings declared in a member JSDoc (small→sm, large→lg). */
export function parseLegacyValues(text) {
  if (!text.includes(LEGACY_VALUE_GATE_PHRASE)) return null;
  const pairs = [...text.matchAll(LEGACY_VALUE_PAIRS)].map((match) => ({
    from: match[1],
    to: match[2],
  }));
  return pairs.length ? pairs : null;
}

const baseEntry = (category) => ({
  category,
  kind: null,
  component: null,
  selector: null,
  entryPoint: null,
  file: null,
  line: null,
  name: null,
  canonical: null,
  canonicalEntryPoint: null,
  renamed: false,
  legacyValues: null,
  occurrenceCount: null,
  replacement: null,
  replacementTbd: false,
  productionUse: false,
  note: '',
});

const lineOf = (node, source) =>
  source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

// ── scans ──────────────────────────────────────────────────────────────────

/** All @deprecated declarations and members. One entry each; never duplicated
 * into the other categories (a deprecated onXxx output stays here only). */
export function scanDeprecatedMembers(files) {
  const entries = [];
  for (const [file, source] of Object.entries(files)) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue;
    const parsed = parse(source);
    const visit = (node, container) => {
      // class members (properties, methods, accessors), interface members,
      // and top-level declarations; a class or interface sets the container
      // for its own members.
      const isTopLevel = parsed.statements.includes(node);
      if (
        (ts.isClassElement(node) ||
          ts.isPropertySignature(node) ||
          ts.isMethodSignature(node) ||
          isTopLevel) &&
        node.name !== undefined
      ) {
        const name = ts.isIdentifier(node.name) ? node.name.text : null;
        const docs = jsdocOf(node);
        if (docs.deprecated && name) {
          const entry = baseEntry('deprecated-member');
          entry.kind = isTopLevel
            ? ts.isClassDeclaration(node)
              ? 'class'
              : ts.isInterfaceDeclaration(node)
                ? 'interface'
                : ts.isTypeAliasDeclaration(node)
                  ? 'type'
                  : ts.isEnumDeclaration(node)
                    ? 'enum'
                    : ts.isFunctionDeclaration(node)
                      ? 'function'
                      : 'const'
            : ts.isPropertySignature(node)
              ? 'interface-member'
              : ts.isMethodSignature(node)
                ? 'interface-method'
                : (signalKindOf(node, parsed) ??
                  (ts.isMethodDeclaration(node) ? 'method' : 'member'));
          entry.name = name;
          entry.component = container?.name ?? null;
          entry.selector = container?.selector ?? null;
          entry.entryPoint = entryPointForFile(file);
          entry.file = file;
          entry.line = lineOf(node, parsed);
          entry.replacement = parseReplacement(
            `${docs.deprecatedComment} ${docs.comment}`,
          );
          entry.replacementTbd = entry.replacement === null;
          entry.note =
            docs.deprecatedComment ||
            docs.comment ||
            'Deprecated compatibility surface; removed at the gate.';
          entries.push(entry);
        }
      }
      if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        const next = {
          name: node.name?.text ?? null,
          selector: classSelector(node, parsed),
        };
        node.members.forEach((member) => visit(member, next));
        return; // members are visited explicitly; don't double-descend
      }
      node.forEachChild((child) => visit(child, container));
    };
    parsed.statements.forEach((statement) => visit(statement, null));
  }
  return entries.sort(
    (a, b) =>
      (a.component ?? a.file).localeCompare(b.component ?? b.file) ||
      a.name.localeCompare(b.name),
  );
}

function classSelector(node, source) {
  const decorator = ts
    .getDecorators(node)
    ?.find(
      (item) =>
        ts.isCallExpression(item.expression) &&
        item.expression.expression.getText(source) === 'Component',
    );
  if (!decorator) return null;
  const metadata = decorator.expression.arguments[0];
  if (!metadata || !ts.isObjectLiteralExpression(metadata)) return null;
  const property = metadata.properties.find(
    (item) => item.name?.getText(source) === 'selector',
  );
  return property?.initializer?.text ?? null;
}

/** Size-style inputs whose JSDoc declares the gate mapping (small→sm, large→lg). */
export function scanLegacySizeValues(files) {
  const entries = [];
  for (const [file, source] of Object.entries(files)) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue;
    const parsed = parse(source);
    const visit = (node, container) => {
      if (ts.isClassDeclaration(node)) {
        const next = {
          name: node.name?.text ?? null,
          selector: classSelector(node, parsed),
        };
        node.members.forEach((member) => visit(member, next));
        return; // members are visited explicitly; don't double-descend
      }
      if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
        const docs = jsdocOf(node);
        const legacyValues = parseLegacyValues(docs.comment);
        if (legacyValues) {
          const entry = baseEntry('legacy-size-value');
          entry.kind = signalKindOf(node, parsed) ?? 'input';
          entry.name = node.name.text;
          entry.component = container?.name ?? null;
          entry.selector = container?.selector ?? null;
          entry.entryPoint = entryPointForFile(file);
          entry.file = file;
          entry.line = lineOf(node, parsed);
          entry.legacyValues = legacyValues;
          entry.replacement = CANONICAL_SIZE_SCALE;
          entry.replacementTbd = false;
          entry.note = `Size input accepts the legacy ${legacyValues
            .map(({ from }) => `\`${from}\``)
            .join('/')} values; normalized to the canonical scale.`;
          entries.push(entry);
        }
      }
      node.forEachChild((child) => visit(child, container));
    };
    parsed.statements.forEach((statement) => visit(statement, null));
  }
  return entries.sort(
    (a, b) =>
      a.component.localeCompare(b.component) || a.name.localeCompare(b.name),
  );
}

/**
 * Class members declared in DECLARED_DUAL_NAMES, verified against source,
 * plus same-class blur/onBlur-style output pairs detected from the AST.
 */
export function scanFunctionalDualNames(files, declaredDualNames, errors) {
  const classes = classModel(files);
  const entries = [];
  for (const declared of declaredDualNames) {
    const klass = classes.get(declared.component);
    if (!klass) {
      errors.push(
        `declared dual name ${declared.component}.${declared.name}: class not found in library source`,
      );
      continue;
    }
    let member;
    for (const candidate of klass.node.members) {
      if (
        ts.isPropertyDeclaration(candidate) &&
        ts.isIdentifier(candidate.name) &&
        candidate.name.text === declared.name
      ) {
        member = candidate;
        break;
      }
    }
    if (!member) {
      errors.push(
        `declared dual name ${declared.component}.${declared.name}: member no longer declared in ${klass.file} — update the manifest declarations`,
      );
      continue;
    }
    const docs = jsdocOf(member);
    if (docs.deprecated) {
      errors.push(
        `declared dual name ${declared.component}.${declared.name}: member is now @deprecated; it must appear exactly once (in the deprecated surface), so remove it from the declared dual names`,
      );
      continue;
    }
    const entry = baseEntry('functional-dual-name');
    entry.kind = signalKindOf(member, klass.source) ?? declared.kind;
    entry.name = declared.name;
    entry.component = declared.component;
    entry.selector = klass.selector;
    entry.entryPoint = entryPointForFile(klass.file);
    entry.file = klass.file;
    entry.line = lineOf(member, klass.source);
    entry.canonical = declared.canonicalName;
    entry.replacement = declared.replacementText
      ? declared.replacementText
      : declared.canonicalName
        ? `\`${declared.canonicalName}\``
        : null;
    entry.replacementTbd = !declared.canonicalName && !declared.replacementText;
    entry.note = declared.note;
    entries.push(entry);
  }

  // Same-class onXxx/canonical output pairs (blur/onBlur, focus/onFocus).
  const pairEntries = [];
  for (const klass of classes.values()) {
    const outputs = new Map();
    for (const member of klass.node.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name))
        continue;
      if (signalKindOf(member, klass.source) !== 'output') continue;
      const docs = jsdocOf(member);
      if (docs.deprecated) continue; // already in the deprecated surface
      outputs.set(member.name.text, member);
    }
    for (const [name, member] of outputs) {
      if (!/^on[A-Z]/.test(name)) continue;
      const canonicalName = name.slice(2, 3).toLowerCase() + name.slice(3);
      if (!outputs.has(canonicalName)) continue;
      const entry = baseEntry('functional-dual-name');
      entry.kind = 'output';
      entry.name = name;
      entry.component = klass.name;
      entry.selector = klass.selector;
      entry.entryPoint = entryPointForFile(klass.file);
      entry.file = klass.file;
      entry.line = lineOf(member, klass.source);
      entry.canonical = canonicalName;
      entry.replacement = `\`${canonicalName}\``;
      entry.replacementTbd = false;
      entry.note = `PrimeNG-era output duplicated by the canonical \`${canonicalName}\` output on the same class; emits alongside it.`;
      pairEntries.push(entry);
    }
  }
  return [...entries, ...pairEntries].sort(
    (a, b) =>
      a.component.localeCompare(b.component) || a.name.localeCompare(b.name),
  );
}

/** Non-deprecated onXxx outputs with no same-class canonical pair and not
 * already declared as functional dual names (exactly-once invariant). */
export function scanPrimengEraOutputs(files, declaredKeys = new Set()) {
  const classes = classModel(files);
  const entries = [];
  for (const klass of classes.values()) {
    const outputs = new Set();
    for (const member of klass.node.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name))
        continue;
      if (signalKindOf(member, klass.source) !== 'output') continue;
      const docs = jsdocOf(member);
      if (docs.deprecated) continue;
      outputs.add(member.name.text);
    }
    for (const name of outputs) {
      if (!/^on[A-Z]/.test(name)) continue;
      const canonicalName = name.slice(2, 3).toLowerCase() + name.slice(3);
      if (outputs.has(canonicalName)) continue; // dual pair, handled above
      if (declaredKeys.has(`${klass.name}::${name}`)) continue; // declared above
      const entry = baseEntry('primeng-era-output');
      entry.kind = 'output';
      entry.name = name;
      entry.component = klass.name;
      entry.selector = klass.selector;
      entry.entryPoint = entryPointForFile(klass.file);
      entry.file = klass.file;
      entry.line = lineOf(klass.node, klass.source);
      entry.replacementTbd = true;
      entry.note =
        'PrimeNG-era output name; rename-or-remove is a gate decision (spec: onXxx outputs removed with migration notes).';
      entries.push(entry);
    }
  }
  return entries.sort(
    (a, b) =>
      a.component.localeCompare(b.component) || a.name.localeCompare(b.name),
  );
}

const TIER_ENTRY_POINT_DIR = 'p2';
const TIER_HOOK_PATTERN = /orc-p2-[a-z0-9-]+/g;

/** The p2 tier entry point (kept as a re-export until the gate). */
export function scanTierEntryPoint(files) {
  const entryFile = `${LIBRARY_ROOT}/${TIER_ENTRY_POINT_DIR}/index.ts`;
  if (!files[entryFile]) return [];
  const entry = baseEntry('tier-entry-point');
  entry.kind = 'entry-point';
  entry.name = `@ciag/orchestra/${TIER_ENTRY_POINT_DIR}`;
  entry.entryPoint = `@ciag/orchestra/${TIER_ENTRY_POINT_DIR}`;
  entry.file = entryFile;
  entry.replacement = 'the canonical kebab-case entry points';
  entry.replacementTbd = false;
  entry.note =
    'Tier-system re-export surface (P2 generation milestone). Every symbol resolves to a canonical entry point; import those instead.';
  return [entry];
}

/** Distinct orc-p2-* class hooks across ts/html/scss with occurrence counts. */
export function scanTierArtifacts(files) {
  const occurrences = new Map();
  for (const [file, source] of Object.entries(files)) {
    for (const match of source.matchAll(TIER_HOOK_PATTERN)) {
      // A capture ending in '-' is a string-concatenation prefix
      // (`'orc-p2-close-button--' + size`), not a literal class; its
      // concrete variants are captured separately.
      if (match[0].endsWith('-')) continue;
      const record = occurrences.get(match[0]) ?? {
        name: match[0],
        files: new Set(),
        count: 0,
      };
      record.files.add(file);
      record.count += 1;
      occurrences.set(match[0], record);
    }
  }
  return [...occurrences.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, files: hookFiles, count }) => {
      const entry = baseEntry('tier-artifact');
      entry.kind = 'class-hook';
      entry.name = name;
      entry.entryPoint = `@ciag/orchestra/${[...hookFiles][0].split('/')[1]}`;
      entry.file = [...hookFiles].sort()[0];
      entry.occurrenceCount = count;
      entry.replacementTbd = true;
      entry.note = `Tier-era state/styling hook used ${count}× in ${hookFiles.size} file(s); rename-or-remove is a gate decision.`;
      return entry;
    });
}

// ── alias entry points ─────────────────────────────────────────────────────

const PACKAGE_SPECIFIER = /^@ciag\/orchestra(?:\/(.*))?$/;

/** Parse one entry file's export statements into re-export edges. */
export function parseEntryExports(source) {
  const parsed = parse(source);
  const edges = [];
  let localDeclarations = false;
  for (const statement of parsed.statements) {
    if (ts.isExportDeclaration(statement)) {
      const specifier = ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : null;
      const names = [];
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          names.push({
            source: (element.propertyName ?? element.name).text,
            exported: element.name.text,
          });
        }
      }
      edges.push({ specifier, names, star: !statement.exportClause });
      continue;
    }
    const exported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (exported) localDeclarations = true;
  }
  return { edges, localDeclarations };
}

/** exported symbol names of a library module, following local re-exports. */
export function exportedNamesOf(files, file, seen = new Set()) {
  if (seen.has(file) || !files[file]) return [];
  seen.add(file);
  const parsed = parse(files[file]);
  const names = new Set();
  for (const statement of parsed.statements) {
    // `export * from` / `export { x } from` keep the keyword outside
    // `modifiers`; the declaration itself is the export.
    const exported =
      ts.isExportDeclaration(statement) ||
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );
    if (!exported) continue;
    if (
      ts.isClassDeclaration(statement) ||
      ts.isFunctionDeclaration(statement)
    ) {
      if (statement.name) names.add(statement.name.text);
    } else if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement)
    ) {
      if (statement.name) names.add(statement.name.text);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    } else if (ts.isExportDeclaration(statement)) {
      const specifier = ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : null;
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements)
          names.add(element.name.text);
      } else if (specifier && !specifier.startsWith('@ciag/')) {
        const target = specifier.startsWith('.')
          ? resolveRelative(file, specifier, files)
          : null;
        if (target)
          for (const name of exportedNamesOf(files, target, seen))
            names.add(name);
      }
    }
  }
  return [...names];
}

function resolveRelative(fromFile, specifier, files) {
  const base = fromFile.split('/').slice(0, -1);
  for (const part of specifier.split('/')) {
    if (part === '.') continue;
    else if (part === '..') base.pop();
    else base.push(part);
  }
  const joined = base.join('/');
  for (const candidate of [joined, `${joined}.ts`, `${joined}/index.ts`]) {
    if (files[candidate]) return candidate;
  }
  return null;
}

/** Alias entry points: secondary entries whose index only re-exports other
 * package entry points (the PrimeNG-compat fan-out). Renamed classes
 * (DialogComponent → modal's ModalComponent) are recorded per export. */
export function scanAliasEntryPoints(files) {
  const entries = [];
  const entryDirs = Object.keys(files)
    .filter(
      (file) =>
        file.endsWith('/ng-package.json') &&
        file.startsWith(`${LIBRARY_ROOT}/`) &&
        file !== `${LIBRARY_ROOT}/ng-package.json`,
    )
    .map((file) => file.slice(0, -'/ng-package.json'.length))
    .sort();
  for (const dir of entryDirs) {
    if (dir.endsWith(`/${TIER_ENTRY_POINT_DIR}`)) continue; // tier entry point
    const entryFile = `${dir}/index.ts`;
    const source = files[entryFile];
    if (!source) continue;
    const { edges, localDeclarations } = parseEntryExports(source);
    if (localDeclarations || edges.length === 0) continue;
    if (
      !edges.every(
        (edge) => edge.specifier && PACKAGE_SPECIFIER.test(edge.specifier),
      )
    )
      continue;
    const aliasEntryPoint = `@ciag/orchestra/${dir.slice(LIBRARY_ROOT.length + 1)}`;
    for (const edge of edges) {
      const canonicalEntryPoint = `@ciag/orchestra/${
        PACKAGE_SPECIFIER.exec(edge.specifier)[1] ?? ''
      }`.replace(/\/$/, '');
      const targetDir = `${LIBRARY_ROOT}/${
        PACKAGE_SPECIFIER.exec(edge.specifier)[1] ?? ''
      }`;
      const targetEntry = `${targetDir}/${
        files[`${targetDir}/public-api.ts`] && targetDir === LIBRARY_ROOT
          ? 'public-api.ts'
          : 'index.ts'
      }`;
      if (edge.star) {
        for (const name of exportedNamesOf(files, targetEntry)) {
          const entry = baseEntry('alias-entry-point');
          entry.kind = 're-export';
          entry.name = name;
          entry.canonical = name;
          entry.canonicalEntryPoint = canonicalEntryPoint;
          entry.renamed = false;
          entry.entryPoint = aliasEntryPoint;
          entry.file = entryFile;
          entry.replacement = `\`${canonicalEntryPoint}\``;
          entry.replacementTbd = false;
          entry.note = `Star re-export of \`${canonicalEntryPoint}\`; import the canonical entry point directly.`;
          entries.push(entry);
        }
        continue;
      }
      for (const { source: sourceName, exported } of edge.names) {
        const entry = baseEntry('alias-entry-point');
        entry.kind = 're-export';
        entry.name = exported;
        entry.canonical = sourceName;
        entry.canonicalEntryPoint = canonicalEntryPoint;
        entry.renamed = sourceName !== exported;
        entry.entryPoint = aliasEntryPoint;
        entry.file = entryFile;
        entry.replacement = `\`${canonicalEntryPoint}\` (\`${sourceName}\`)`;
        entry.replacementTbd = false;
        entry.note = renamedNote(sourceName, exported, canonicalEntryPoint);
        entries.push(entry);
      }
    }
  }
  return entries;
}

function renamedNote(sourceName, exported, canonicalEntryPoint) {
  return renamedEntryNote(sourceName, exported, canonicalEntryPoint);
}

function renamedEntryNote(sourceName, exported, canonicalEntryPoint) {
  return sourceName !== exported
    ? `Renamed-class alias: \`${exported}\` is \`${canonicalEntryPoint}\`'s \`${sourceName}\`.`
    : `Identity re-export of \`${canonicalEntryPoint}\`'s \`${sourceName}\`.`;
}

/**
 * Cross-check the alias classification against the committed alias-parity
 * spec header so the manifest and the identity spec can never disagree.
 */
export function checkAliasParityCount(
  aliasEntries,
  aliasParitySpecSource,
  errors,
) {
  const match = /Alias entry points: (\d+)\./.exec(aliasParitySpecSource ?? '');
  if (!match) {
    errors.push(
      'alias-parity generated spec header does not declare an alias entry point count',
    );
    return;
  }
  const declared = Number(match[1]);
  const distinct = new Set(aliasEntries.map((entry) => entry.entryPoint)).size;
  if (declared !== distinct) {
    errors.push(
      `manifest enumerates ${distinct} alias entry points but alias-parity.generated.spec.ts declares ${declared} — regenerate both (npm run generate:alias-parity)`,
    );
  }
}

// ── production-use flags ───────────────────────────────────────────────────

function markProductionUse(entries, productionUse, errors) {
  const lookup = new Set();
  for (const entry of entries) {
    if (entry.component) lookup.add(`${entry.component}::${entry.name}`);
  }
  for (const row of productionUse) {
    if (!lookup.has(`${row.component}::${row.name}`)) {
      errors.push(
        `production-use row ${row.component}.${row.name} no longer exists in the library source — update the consumer-scan data (gate manifest)`,
      );
      continue;
    }
    for (const entry of entries) {
      if (entry.component === row.component && entry.name === row.name)
        entry.productionUse = true;
    }
  }
}

// ── assembly ───────────────────────────────────────────────────────────────

/**
 * Build the gate manifest from library source.
 *
 * @param {{
 *   files: Record<string, string>,
 *   declaredDualNames?: Array<object>,
 *   productionUse?: Array<{ component: string, name: string }>,
 *   productionScanRef?: string,
 *   aliasParitySpecSource?: string,
 * }} input
 * @returns {{ manifest: object, errors: string[], warnings: string[] }}
 */
export function buildGateManifest({
  files,
  declaredDualNames = DECLARED_DUAL_NAMES,
  productionUse = PRODUCTION_USE,
  productionScanRef = PRODUCTION_SCAN_REF,
  aliasParitySpecSource = null,
}) {
  const errors = [];
  const warnings = [];

  const deprecated = scanDeprecatedMembers(files);
  const sizes = scanLegacySizeValues(files);
  const dual = scanFunctionalDualNames(files, declaredDualNames, errors);
  // Exactly-once: an output declared as a functional dual name never also
  // appears in the PrimeNG-era scan.
  const declaredKeys = new Set(
    dual.map((entry) => `${entry.component}::${entry.name}`),
  );
  const primengOutputs = scanPrimengEraOutputs(files, declaredKeys);
  const tierEntryPoint = scanTierEntryPoint(files);
  const tierArtifacts = scanTierArtifacts(files);
  const aliases = scanAliasEntryPoints(files);

  if (aliasParitySpecSource)
    checkAliasParityCount(aliases, aliasParitySpecSource, errors);

  const entries = [
    ...deprecated,
    ...sizes,
    ...dual,
    ...primengOutputs,
    ...tierEntryPoint,
    ...tierArtifacts,
    ...aliases,
  ];
  markProductionUse(entries, productionUse, errors);

  // Exactly-once invariant across categories.
  const seen = new Set();
  for (const entry of entries) {
    const key = `${entry.category}::${entry.entryPoint}::${entry.component ?? ''}::${entry.name}`;
    if (seen.has(key)) errors.push(`duplicate gate-manifest entry: ${key}`);
    seen.add(key);
  }

  const byCategory = {};
  for (const entry of entries)
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;

  const manifest = {
    gate: {
      version: GATE_VERSION,
      angularMajor: 23,
      description:
        'The compatibility window ends: deprecated no-op inputs/outputs, the tier entry point and tier artifacts, the alias fan-out, and the functional dual/PrimeNG-era names are removed with migration notes.',
    },
    generatedBy: 'tools/release/generate-gate-manifest.mjs',
    generatedFrom: 'library source scan — do not edit by hand',
    productionScanRef,
    stats: {
      totalEntries: entries.length,
      gate: GATE_VERSION,
      byCategory,
      replacementTbd: entries.filter((entry) => entry.replacementTbd).length,
      productionUsed: entries.filter((entry) => entry.productionUse).length,
    },
    entries,
  };
  return { manifest, errors, warnings };
}

// ── migration guide rendering ──────────────────────────────────────────────

const groupBy = (items, key) => {
  const groups = new Map();
  for (const item of items) {
    const group = key(item);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  }
  return groups;
};

const flagCell = (entry) =>
  [
    entry.productionUse ? '**In production use — migration required**' : null,
    entry.replacementTbd ? '_replacement TBD at the gate review_' : null,
  ]
    .filter(Boolean)
    .join(' · ');

const legacyValuesCell = (entry) =>
  entry.legacyValues
    ? entry.legacyValues
        .map(({ from, to }) => `\`${from}\` → \`${to}\``)
        .join(', ')
    : null;

/**
 * Render the human migration guide from the manifest. Pure: same manifest in,
 * same markdown out.
 */
export function renderMigrationGuide(manifest) {
  const { entries, stats, gate, productionScanRef } = manifest;
  const lines = [];
  lines.push(`# ${GATE_VERSION} gate migration guide`);
  lines.push('');
  lines.push(
    `Generated by \`${manifest.generatedBy}\` from a source scan — **do not edit by hand**. ` +
      `Regenerate with \`npm run generate:gate-manifest\`; drift fails CI through \`${'verify:docs'}\`.`,
  );
  lines.push('');
  lines.push(
    `The compatibility window ends at the **${GATE_VERSION} release (Angular ${gate.angularMajor})**: ` +
      `${stats.totalEntries} removals are scheduled, enumerated machine-readably in ` +
      `[gate-23-manifest.json](./gate-23-manifest.json). ` +
      `${stats.productionUsed} entries are flagged **in production use** (from ${productionScanRef}) — ` +
      `for those, this guide is the migration contract for the consumer app; the removal still happens at the gate.`,
  );
  lines.push('');
  lines.push(
    '| Category | Entries | Of which in production use | Replacement TBD |',
  );
  lines.push('| --- | ---: | ---: | ---: |');
  const categoryOrder = [
    'functional-dual-name',
    'primeng-era-output',
    'deprecated-member',
    'legacy-size-value',
    'alias-entry-point',
    'tier-entry-point',
    'tier-artifact',
  ];
  for (const category of categoryOrder) {
    const count = stats.byCategory[category] ?? 0;
    if (!count) continue;
    const categoryEntries = entries.filter(
      (entry) => entry.category === category,
    );
    lines.push(
      `| ${categoryTitle(category)} | ${count} | ${categoryEntries.filter((entry) => entry.productionUse).length} | ${categoryEntries.filter((entry) => entry.replacementTbd).length} |`,
    );
  }
  lines.push(
    `| **Total** | ${stats.totalEntries} | ${stats.productionUsed} | ${stats.replacementTbd} |`,
  );
  lines.push('');

  // ── functional dual names ──
  const dual = entries.filter(
    (entry) => entry.category === 'functional-dual-name',
  );
  if (dual.length) {
    lines.push('## Functional dual names');
    lines.push('');
    lines.push(
      'Two names for one feature. Both keep working through the compatibility window; ' +
        'the legacy name is removed at the gate. Production-used rows are the migration contract.',
    );
    lines.push('');
    for (const [component, group] of groupBy(
      dual,
      (entry) => entry.component,
    )) {
      lines.push(
        `### ${component} (\`${group[0].selector ?? group[0].entryPoint}\`)`,
      );
      lines.push('');
      lines.push('| Kind | Legacy name | Canonical replacement | Notes |');
      lines.push('| --- | --- | --- | --- |');
      for (const entry of group) {
        const legacy =
          entry.kind === 'output'
            ? `\`(${entry.name})\``
            : `\`[${entry.name}]\``;
        const canonical =
          entry.canonical !== null
            ? entry.kind === 'output'
              ? `\`(${entry.canonical})\``
              : `\`[${entry.canonical}]\``
            : entry.replacementTbd
              ? '—'
              : entry.replacement;
        lines.push(
          `| ${entry.kind} | ${legacy} | ${canonical} | ${entry.note}${flagCell(entry) ? ' ' + flagCell(entry) : ''} |`,
        );
      }
      lines.push('');
    }
  }

  // ── PrimeNG-era outputs ──
  const primeng = entries.filter(
    (entry) => entry.category === 'primeng-era-output',
  );
  if (primeng.length) {
    lines.push('## PrimeNG-era outputs');
    lines.push('');
    lines.push(
      'onXxx-style outputs scheduled for removal with migration notes (spec decision). ' +
        'Pairs that already have a same-class canonical output are listed under functional dual names; ' +
        'these have no pair yet — the rename-or-remove decision belongs to the gate review.',
    );
    lines.push('');
    lines.push('| Component | Entry point | Outputs |');
    lines.push('| --- | --- | --- |');
    for (const [component, group] of groupBy(
      primeng,
      (entry) => entry.component,
    )) {
      const productionFlag = group.some((entry) => entry.productionUse)
        ? ' — **in production use**'
        : '';
      lines.push(
        `| ${component} | \`${group[0].entryPoint}\` | ${group.map((entry) => `\`(${entry.name})\``).join(', ')}${productionFlag} |`,
      );
    }
    lines.push('');
  }

  // ── deprecated surface ──
  const deprecated = entries.filter(
    (entry) => entry.category === 'deprecated-member',
  );
  if (deprecated.length) {
    lines.push('## Deprecated no-op surface');
    lines.push('');
    lines.push(
      'Members marked `@deprecated` in source — compatibility no-ops the implementation never honored. ' +
        'At the gate they are deleted; consumers must stop binding them. Where the JSDoc names a replacement it is listed; ' +
        'otherwise there is no replacement (the binding does nothing today).',
    );
    lines.push('');
    lines.push(
      '| Component / declaration | Entry point | Kind | Member | Replacement |',
    );
    lines.push('| --- | --- | --- | --- | --- |');
    for (const entry of deprecated) {
      lines.push(
        `| ${entry.component ?? entry.file.replace(/^projects\/orc-ds\//, '')} | \`${entry.entryPoint}\` | ${entry.kind} | \`${entry.name}\` | ${entry.replacement ? `\`${entry.replacement}\`` : 'none (no-op)'} |`,
      );
    }
    lines.push('');
  }

  // ── legacy size values ──
  const sizes = entries.filter(
    (entry) => entry.category === 'legacy-size-value',
  );
  if (sizes.length) {
    lines.push('## Legacy size values');
    lines.push('');
    lines.push(
      'The PrimeNG-era `small | large` size values render identically today (normalized internally); ' +
        'at the gate only the canonical scale is accepted. Pass `sm`/`md`/`lg` instead.',
    );
    lines.push('');
    lines.push('| Component | Entry point | Input | Legacy → canonical |');
    lines.push('| --- | --- | --- | --- |');
    for (const entry of sizes) {
      lines.push(
        `| ${entry.component} | \`${entry.entryPoint}\` | \`[${entry.name}]\` | ${legacyValuesCell(entry)} |`,
      );
    }
    lines.push('');
  }

  // ── alias fan-out ──
  const aliases = entries.filter(
    (entry) => entry.category === 'alias-entry-point',
  );
  if (aliases.length) {
    lines.push('## Alias entry points');
    lines.push('');
    lines.push(
      'The PrimeNG-compat import fan-out. Production is confirmed to never import these ' +
        `(see ${productionScanRef}); at the gate every alias entry point is removed and ` +
        'imports move to the canonical kebab-case entry point.',
    );
    lines.push('');
    lines.push(
      '| Alias entry point | Canonical entry point | Exports | Renamed classes |',
    );
    lines.push('| --- | --- | --- | --- |');
    const grouped = groupBy(aliases, (entry) => entry.entryPoint);
    for (const [entryPoint, group] of grouped) {
      const canonicals = [
        ...new Set(group.map((entry) => entry.canonicalEntryPoint)),
      ];
      const renamed = group.filter((entry) => entry.renamed);
      lines.push(
        `| \`${entryPoint}\` | ${canonicals.map((canonical) => `\`${canonical}\``).join(', ')} | ${group.length} | ${renamed.length ? renamed.map((entry) => `\`${entry.name}\` → \`${entry.canonicalEntryPoint}\`'s \`${entry.canonical}\``).join(', ') : '—'} |`,
      );
    }
    lines.push('');
  }

  // ── tier entry point + artifacts ──
  const tierEntry = entries.filter(
    (entry) => entry.category === 'tier-entry-point',
  );
  if (tierEntry.length) {
    lines.push('## Tier entry point and tier artifacts');
    lines.push('');
    lines.push(
      "The `@ciag/orchestra/p2` entry point is the P2 generation milestone's re-export surface; " +
        'every symbol resolves to a canonical entry point today. At the gate the entry point is removed — ' +
        'import the canonical kebab-case entries.',
    );
    lines.push('');
  }
  const hooks = entries.filter((entry) => entry.category === 'tier-artifact');
  if (hooks.length) {
    lines.push(
      `The components extracted from the p2 monolith keep ${hooks.length} distinct ` +
        '`orc-p2-*` state/styling hooks in their templates and styles. They are tier artifacts, ' +
        'kept until the gate; the rename-or-remove decision for each belongs to the gate review ' +
        '(no formal frozen CSS contract — class changes are listed in release notes):',
    );
    lines.push('');
    lines.push(hooks.map((hook) => `\`${hook.name}\``).join(' · '));
    lines.push('');
  }

  // ── gate decisions needed ──
  const tbd = entries.filter((entry) => entry.replacementTbd);
  if (tbd.length) {
    lines.push('## Open gate decisions (replacement TBD)');
    lines.push('');
    lines.push(
      `${tbd.length} entries have no confirmed canonical replacement; the human gate review decides ` +
        'remove-vs-rename for each before the 23.0.0 release cuts:',
    );
    lines.push('');
    for (const [category, group] of groupBy(tbd, (entry) => entry.category)) {
      lines.push(
        `- **${categoryTitle(category)}** (${group.length}): ${group
          .slice(0, 12)
          .map(
            (entry) =>
              `\`${entry.component ? `${entry.component}.${entry.name}` : entry.name}\``,
          )
          .join(
            ', ',
          )}${group.length > 12 ? `, … ${group.length - 12} more` : ''}`,
      );
    }
    lines.push('');
  }

  lines.push('## Migrating');
  lines.push('');
  lines.push(
    "1. Replace every flagged **in production use** binding first (the sole known consumer's live list " +
      `is recorded in ${productionScanRef}).`,
  );
  lines.push('2. Swap legacy size values to `sm | md | lg`.');
  lines.push(
    '3. Move alias and `p2` imports to the canonical kebab-case entry points.',
  );
  lines.push('4. Delete the remaining no-op bindings — they do nothing today.');
  lines.push('');
  lines.push(
    'The removal lands as one breaking release at the Angular 23 boundary, with these notes as the contract.',
  );
  lines.push('');
  return lines.join('\n');
}

function categoryTitle(category) {
  return (
    {
      'functional-dual-name': 'Functional dual names',
      'primeng-era-output': 'PrimeNG-era outputs',
      'deprecated-member': 'Deprecated no-op surface',
      'legacy-size-value': 'Legacy size values',
      'alias-entry-point': 'Alias entry points',
      'tier-entry-point': 'Tier entry point',
      'tier-artifact': 'Tier artifacts (orc-p2 class hooks)',
    }[category] ?? category
  );
}
