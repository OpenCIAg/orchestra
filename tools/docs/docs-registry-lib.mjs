/**
 * Registro da documentação: a fonte única que alimenta o app de docs e os
 * geradores (llms.md, sitemap, cobertura).
 *
 * Duas origens convivem durante a transição da 22.4:
 *
 * - **content** (formato novo): `projects/docs/src/app/content/components/<id>/`
 *   com `<id>.doc.ts` (`export const DOC = { ... }`, literal puro) e
 *   `examples/<slug>.example.ts` (um componente standalone por exemplo).
 *   Renderizado pelo template único `pages/component-page/`.
 * - **legacy** (formato antigo): `catalog/<id>.catalog.ts`, páginas escritas
 *   à mão em `pages/components/<id>/` e exemplos da página genérica em
 *   `pages/components/component-doc/examples/<id>-example.component.ts`.
 *
 * Quando uma família ganha `content/`, os arquivos legacy dela devem ser
 * apagados; o registro acusa sobras como problema.
 *
 * Tudo aqui é leitura estática (AST do TypeScript): nada é executado.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const APP_DIR = 'projects/docs/src/app';
export const CONTENT_DIR = `${APP_DIR}/content/components`;
export const CATALOG_DIR = `${APP_DIR}/catalog`;
export const LEGACY_PAGES_DIR = `${APP_DIR}/pages/components`;
export const LEGACY_EXAMPLES_DIR = `${APP_DIR}/pages/components/component-doc/examples`;
export const GENERATED_DIR = `${APP_DIR}/generated/docs-registry`;

/** Ordem da navegação lateral e do catálogo. */
export const GROUP_ORDER = [
  'actions',
  'selection',
  'input',
  'overlays',
  'navigation',
  'layout',
  'data',
  'display',
  'utilities',
];

/**
 * Mapa final de DECISOES.md §1 (58 famílias de núcleo) mais as 12
 * experimentais, cada uma no grupo em que aparece na navegação.
 */
export const FAMILY_GROUPS = {
  actions: [
    'button',
    'button-group',
    'toggle-button',
    'segmented-control',
    'speed-dial',
  ],
  selection: ['select', 'autocomplete', 'listbox', 'tree-select', 'tags-input'],
  input: [
    'input',
    'form-field',
    'number-input',
    'otp-input',
    'date-picker',
    'calendar',
    'color-picker',
    'slider',
    'checkbox',
    'radio',
    'switch',
    'knob',
    'rating',
  ],
  overlays: ['modal', 'drawer', 'popover', 'tooltip', 'toast'],
  navigation: [
    'menu',
    'command-menu',
    'navigation',
    'breadcrumb',
    'tabs',
    'stepper',
    'paginator',
    'toolbar',
  ],
  layout: [
    'splitter',
    'scroll-area',
    'divider',
    'fieldset',
    'accordion',
    'collapsible',
    'card',
  ],
  data: ['table', 'tree', 'timeline', 'pick-list', 'organization-chart'],
  display: [
    'avatar',
    'badge',
    'chip',
    'alert',
    'empty-state',
    'progress',
    'skeleton',
    'spinner',
    'image',
    'image-compare',
    'galleria',
    'inplace',
  ],
  utilities: [
    'text',
    'kbd',
    'link',
    'code',
    'icon',
    'visually-hidden',
    'file-uploader',
    'terminal',
    'chart',
    'editor',
  ],
};

/** DECISOES.md §1: ficam no pacote com `status: 'experimental'`. */
export const EXPERIMENTAL_FAMILIES = [
  'speed-dial',
  'knob',
  'rating',
  'pick-list',
  'organization-chart',
  'image',
  'image-compare',
  'galleria',
  'inplace',
  'terminal',
  'chart',
  'editor',
];

/** Famílias legacy fora do mapa final caem no grupo da categoria antiga. */
const LEGACY_CATEGORY_GROUP = {
  Inputs: 'input',
  Navigation: 'navigation',
  Feedback: 'display',
  'Data Display': 'data',
  Overlay: 'overlays',
  Layout: 'layout',
  Typography: 'utilities',
  Utility: 'utilities',
};

const FAMILY_GROUP_BY_ID = new Map(
  Object.entries(FAMILY_GROUPS).flatMap(([group, ids]) =>
    ids.map((id) => [id, group]),
  ),
);

export function groupForFamily(id, legacyCategory) {
  return (
    FAMILY_GROUP_BY_ID.get(id) ??
    LEGACY_CATEGORY_GROUP[legacyCategory] ??
    'utilities'
  );
}

const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const pascalCase = (kebab) =>
  kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** Nome obrigatório da classe de um exemplo: evita colisões entre famílias. */
export const exampleClassName = (id, slug) =>
  `${pascalCase(id)}${pascalCase(slug)}ExampleComponent`;

/** Avalia um literal TS puro (sem identificadores, spreads ou chamadas). */
export function evaluateLiteral(node, source, where = 'literal') {
  while (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isTypeAssertionExpression?.(node)
  ) {
    node = node.expression;
  }
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((element) =>
      evaluateLiteral(element, source, where),
    );
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property))
        throw new Error(
          `${where}: só propriedades literais são aceitas (${property.getText(source)})`,
        );
      const name = property.name.getText(source).replace(/^['"]|['"]$/g, '');
      value[name] = evaluateLiteral(property.initializer, source, where);
    }
    return value;
  }
  throw new Error(
    `${where}: valor não literal não suportado: ${node.getText(source)}`,
  );
}

function parse(file) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
}

/** Classes exportadas decoradas com @Component em um arquivo. */
export function exportedComponentClasses(file) {
  const source = parse(file);
  const classes = [];
  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue;
    const exported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    const isComponent = ts
      .getDecorators(statement)
      ?.some(
        (decorator) =>
          ts.isCallExpression(decorator.expression) &&
          decorator.expression.expression.getText(source) === 'Component',
      );
    if (exported && isComponent) classes.push(statement.name.text);
  }
  return classes;
}

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/** Valida o conteúdo de um locale; devolve mensagens de problema. */
function validateLocaleContent(content, doc, locale, where) {
  const problems = [];
  const fail = (message) =>
    problems.push(`${where} i18n['${locale}']: ${message}`);
  if (!content || typeof content !== 'object') {
    fail('ausente');
    return problems;
  }
  if (!isNonEmptyString(content.description)) fail('`description` vazio');
  if (
    !Array.isArray(content.whenToUse) ||
    !content.whenToUse.length ||
    !content.whenToUse.every(isNonEmptyString)
  )
    fail('`whenToUse` precisa de ao menos um texto');
  if (
    !Array.isArray(content.whenNotToUse) ||
    !content.whenNotToUse.length ||
    !content.whenNotToUse.every((item) => isNonEmptyString(item?.text))
  )
    fail('`whenNotToUse` precisa de ao menos um `{ text, alternative? }`');
  if (
    !Array.isArray(content.anatomy) ||
    !content.anatomy.length ||
    !content.anatomy.every(
      (item) =>
        isNonEmptyString(item?.part) && isNonEmptyString(item?.description),
    )
  )
    fail('`anatomy` precisa de ao menos um `{ part, description }`');
  const a11y = content.accessibility;
  if (!a11y || typeof a11y !== 'object') fail('`accessibility` ausente');
  else {
    if (
      !Array.isArray(a11y.keyboard) ||
      !a11y.keyboard.every(
        (row) => isNonEmptyString(row?.keys) && isNonEmptyString(row?.action),
      )
    )
      fail('`accessibility.keyboard` deve ser uma lista de `{ keys, action }`');
    if (
      !Array.isArray(a11y.aria) ||
      !a11y.aria.length ||
      !a11y.aria.every(isNonEmptyString)
    )
      fail('`accessibility.aria` precisa de ao menos um texto');
    if (a11y.notes !== undefined && !Array.isArray(a11y.notes))
      fail('`accessibility.notes` deve ser uma lista');
  }
  if (
    !Array.isArray(content.migration) ||
    !content.migration.length ||
    !content.migration.every(
      (item) => isNonEmptyString(item?.before) && isNonEmptyString(item?.after),
    )
  )
    fail('`migration` precisa de ao menos um `{ before, after, note? }`');
  const exampleTexts = content.examples ?? {};
  for (const slug of doc.examples ?? []) {
    const text = exampleTexts[slug];
    if (!isNonEmptyString(text?.title) || !isNonEmptyString(text?.description))
      fail(`exemplo "${slug}" sem \`title\`/\`description\``);
  }
  for (const slug of Object.keys(exampleTexts)) {
    if (!(doc.examples ?? []).includes(slug))
      fail(
        `texto para exemplo inexistente "${slug}" (não está em DOC.examples)`,
      );
  }
  return problems;
}

/** Lê e valida uma família no formato novo. */
export function readContentFamily(root, id) {
  const dir = path.join(root, CONTENT_DIR, id);
  const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
  const problems = [];
  const docFile = path.join(dir, `${id}.doc.ts`);
  if (!KEBAB.test(id))
    problems.push(`${rel(dir)}: o nome do diretório deve ser kebab-case`);
  for (const name of fs.readdirSync(dir)) {
    if (name !== `${id}.doc.ts` && name !== 'examples')
      problems.push(
        `${rel(path.join(dir, name))}: arquivo inesperado (só \`${id}.doc.ts\` e \`examples/\`)`,
      );
  }
  if (!fs.existsSync(docFile)) {
    problems.push(`${rel(dir)}: falta ${id}.doc.ts`);
    return { id, problems };
  }

  const source = parse(docFile);
  let doc = null;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(source) !== 'DOC') continue;
      try {
        doc = evaluateLiteral(declaration.initializer, source, rel(docFile));
      } catch (error) {
        problems.push(error.message);
      }
    }
  }
  if (!doc) {
    if (!problems.length)
      problems.push(`${rel(docFile)}: falta \`export const DOC = { ... }\``);
    return { id, problems };
  }

  const where = rel(docFile);
  if (doc.id !== id) problems.push(`${where}: DOC.id deve ser "${id}"`);
  if (!isNonEmptyString(doc.name)) problems.push(`${where}: DOC.name vazio`);
  if (!GROUP_ORDER.includes(doc.group))
    problems.push(
      `${where}: DOC.group inválido "${doc.group}" (use ${GROUP_ORDER.join(', ')})`,
    );
  if (doc.status !== 'stable' && doc.status !== 'experimental')
    problems.push(`${where}: DOC.status deve ser 'stable' ou 'experimental'`);
  const experimental = EXPERIMENTAL_FAMILIES.includes(id);
  if (experimental && doc.status !== 'experimental')
    problems.push(
      `${where}: "${id}" é experimental em DECISOES.md; use status 'experimental'`,
    );
  if (!experimental && doc.status === 'experimental')
    problems.push(
      `${where}: "${id}" não está entre as experimentais de DECISOES.md`,
    );
  if (!isNonEmptyString(doc.icon)) problems.push(`${where}: DOC.icon vazio`);
  if (
    typeof doc.packagePath !== 'string' ||
    !doc.packagePath.startsWith('@ciag/orchestra/')
  )
    problems.push(
      `${where}: DOC.packagePath deve começar com '@ciag/orchestra/'`,
    );
  if (
    !Array.isArray(doc.tags) ||
    !doc.tags.length ||
    !doc.tags.every(isNonEmptyString)
  )
    problems.push(`${where}: DOC.tags precisa de ao menos uma tag`);
  if (!Array.isArray(doc.examples) || !doc.examples.length)
    problems.push(`${where}: DOC.examples precisa de ao menos um exemplo`);
  else {
    const seen = new Set();
    for (const slug of doc.examples) {
      if (!KEBAB.test(slug))
        problems.push(`${where}: slug de exemplo inválido "${slug}"`);
      if (seen.has(slug)) problems.push(`${where}: exemplo "${slug}" repetido`);
      seen.add(slug);
    }
  }
  const i18n = doc.i18n ?? {};
  if (!i18n['pt-BR']) problems.push(`${where}: falta i18n['pt-BR']`);
  for (const [locale, content] of Object.entries(i18n))
    problems.push(...validateLocaleContent(content, doc, locale, where));

  // Exemplos: um arquivo por slug, nada órfão, uma classe com nome padrão.
  const examplesDir = path.join(dir, 'examples');
  const files = fs.existsSync(examplesDir)
    ? fs.readdirSync(examplesDir).sort()
    : [];
  for (const file of files) {
    if (!file.endsWith('.example.ts'))
      problems.push(
        `${rel(path.join(examplesDir, file))}: só arquivos <slug>.example.ts`,
      );
    else if (!(doc.examples ?? []).includes(file.replace(/\.example\.ts$/, '')))
      problems.push(
        `${rel(path.join(examplesDir, file))}: exemplo órfão (adicione a slug em DOC.examples ou apague)`,
      );
  }
  const examples = [];
  for (const slug of Array.isArray(doc.examples) ? doc.examples : []) {
    const file = path.join(examplesDir, `${slug}.example.ts`);
    if (!fs.existsSync(file)) {
      problems.push(`${where}: falta examples/${slug}.example.ts`);
      continue;
    }
    const expected = exampleClassName(id, slug);
    const classes = exportedComponentClasses(file);
    if (classes.length !== 1 || classes[0] !== expected)
      problems.push(
        `${rel(file)}: deve exportar exatamente um @Component chamado ${expected} (encontrado: ${classes.join(', ') || 'nenhum'})`,
      );
    examples.push({
      slug,
      file: `examples/${slug}.example.ts`,
      className: expected,
      source: fs.readFileSync(file, 'utf8'),
    });
  }

  return { id, doc, examples, problems };
}

/** Lê os `<id>.catalog.ts` antigos (entradas e usage docs). */
export function readLegacyCatalog(root) {
  const dir = path.join(root, CATALOG_DIR);
  const entries = [];
  const problems = [];
  if (!fs.existsSync(dir)) return { entries, problems };
  for (const file of fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.catalog.ts'))
    .sort()) {
    const source = parse(path.join(dir, file));
    let entry = null;
    let entryConst = null;
    let usageDoc = null;
    let usageConst = null;
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!declaration.initializer) continue;
        const name = declaration.name.getText(source);
        if (name.endsWith('_CATALOG_ENTRY')) {
          entry = evaluateLiteral(declaration.initializer, source, file);
          entryConst = name;
        } else if (name.endsWith('_USAGE_DOC')) {
          usageDoc = evaluateLiteral(declaration.initializer, source, file);
          usageConst = name;
        }
      }
    }
    if (!entry) continue;
    if (file !== `${entry.id}.catalog.ts`)
      problems.push(
        `${CATALOG_DIR}/${file} must be named ${entry.id}.catalog.ts to match its entry id`,
      );
    entries.push({
      entry,
      entryConst,
      usageDoc,
      usageConst,
      file: `${CATALOG_DIR}/${file}`,
      module: file.replace(/\.ts$/, ''),
    });
  }
  return { entries, problems };
}

/** Páginas escritas à mão: `pages/components/<id>/<id>-page.component.ts`. */
export function readLegacyPages(root) {
  const dir = path.join(root, LEGACY_PAGES_DIR);
  if (!fs.existsSync(dir)) return [];
  const pages = [];
  for (const id of fs.readdirSync(dir).sort()) {
    if (id === 'component-doc') continue;
    const file = path.join(dir, id, `${id}-page.component.ts`);
    if (!fs.existsSync(file)) continue;
    const classes = exportedComponentClasses(file);
    const className =
      classes.find((name) => name.endsWith('PageComponent')) ?? classes[0];
    if (!className) continue;
    pages.push({ id, className, module: `${id}/${id}-page.component` });
  }
  return pages;
}

/** Exemplos da página genérica antiga: `<id>-example.component.ts`. */
export function readLegacyExamples(root) {
  const dir = path.join(root, LEGACY_EXAMPLES_DIR);
  if (!fs.existsSync(dir)) return [];
  const examples = [];
  for (const file of fs.readdirSync(dir).sort()) {
    const match = file.match(/^([a-z0-9-]+)-example\.component\.ts$/);
    if (!match) continue;
    const classes = exportedComponentClasses(path.join(dir, file));
    if (classes.length !== 1) continue;
    examples.push({
      id: match[1],
      className: classes[0],
      module: file.replace(/\.ts$/, ''),
    });
  }
  return examples;
}

/**
 * Monta o registro completo. `entries` é o catálogo final (formato novo +
 * legacy), ordenado por id; `problems` lista tudo o que impede gerar.
 */
export function loadDocsRegistry(root) {
  const problems = [];
  const contentDir = path.join(root, CONTENT_DIR);
  const contentIds = fs.existsSync(contentDir)
    ? fs
        .readdirSync(contentDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];
  const content = contentIds.map((id) => readContentFamily(root, id));
  for (const family of content) problems.push(...family.problems);
  const contentSet = new Set(contentIds);

  const legacyCatalog = readLegacyCatalog(root);
  problems.push(...legacyCatalog.problems);
  const legacyPages = readLegacyPages(root);
  const legacyExamples = readLegacyExamples(root);

  for (const legacy of legacyCatalog.entries)
    if (contentSet.has(legacy.entry.id))
      problems.push(
        `${legacy.file}: "${legacy.entry.id}" já tem content/; apague o catálogo antigo`,
      );
  for (const page of legacyPages)
    if (contentSet.has(page.id))
      problems.push(
        `${LEGACY_PAGES_DIR}/${page.id}/: "${page.id}" já tem content/; apague a página antiga`,
      );
  for (const example of legacyExamples)
    if (contentSet.has(example.id))
      problems.push(
        `${LEGACY_EXAMPLES_DIR}/${example.module}.ts: "${example.id}" já tem content/; apague o exemplo antigo`,
      );

  const entries = [];
  for (const family of content) {
    if (!family.doc) continue;
    entries.push({
      id: family.id,
      name: family.doc.name,
      description: family.doc.i18n?.['pt-BR']?.description ?? '',
      status: family.doc.status,
      tags: family.doc.tags ?? [],
      icon: family.doc.icon,
      route: `/components/${family.id}`,
      group: family.doc.group,
      source: 'content',
      packagePath: family.doc.packagePath,
    });
  }
  const legacy = legacyCatalog.entries.filter(
    (item) => !contentSet.has(item.entry.id),
  );
  for (const item of legacy) {
    const status = EXPERIMENTAL_FAMILIES.includes(item.entry.id)
      ? 'experimental'
      : item.entry.status;
    entries.push({
      ...item.entry,
      status,
      route: item.entry.route ?? `/components/${item.entry.id}`,
      group: groupForFamily(item.entry.id, item.entry.category),
      source: 'legacy',
      packagePath: item.usageDoc?.packagePath,
    });
  }
  entries.sort((a, b) => a.id.localeCompare(b.id));

  const ids = new Set(entries.map((entry) => entry.id));
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.id)) problems.push(`duplicate catalog id "${entry.id}"`);
    seen.add(entry.id);
  }
  // Alternativas de "Quando não usar" precisam apontar para páginas reais.
  for (const family of content) {
    for (const [locale, text] of Object.entries(family.doc?.i18n ?? {})) {
      for (const item of text?.whenNotToUse ?? []) {
        if (item?.alternative && !ids.has(item.alternative))
          problems.push(
            `${CONTENT_DIR}/${family.id}/${family.id}.doc.ts i18n['${locale}']: alternativa "${item.alternative}" não está no registro`,
          );
      }
    }
  }

  return {
    entries,
    content: content.filter((family) => family.doc),
    legacyCatalog: legacy,
    legacyPages: legacyPages.filter((page) => !contentSet.has(page.id)),
    legacyExamples: legacyExamples.filter(
      (example) => !contentSet.has(example.id),
    ),
    problems,
  };
}

// ── Renderização dos módulos gerados ────────────────────────────────────

export const GENERATED_BANNER = [
  '// GERADO — não edite. Fonte: projects/docs/src/app/content/components/',
  '// (formato novo) e os arquivos legacy de catalog/ e pages/components/.',
  '// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).',
].join('\n');

const str = (value) => JSON.stringify(value);

function renderEntryLiteral(entry) {
  return `{
    id: ${str(entry.id)},
    name: ${str(entry.name)},
    description: ${str(entry.description)},
    status: ${str(entry.status)},
    tags: ${str(entry.tags)},
    icon: ${str(entry.icon)},
    route: ${str(entry.route)},
    group: ${str(entry.group)},
    source: 'content',
  }`;
}

/** `catalog.generated.ts`: catálogo final + usage docs legacy. */
export function renderCatalogModule(registry) {
  const imports = registry.legacyCatalog.map((item) => {
    const names = [item.entryConst, item.usageConst].filter(Boolean).join(', ');
    return `import { ${names} } from '../../catalog/${item.module}';`;
  });
  const legacyById = new Map(
    registry.legacyCatalog.map((item) => [item.entry.id, item]),
  );
  const items = registry.entries.map((entry) => {
    if (entry.source === 'content') return renderEntryLiteral(entry);
    const item = legacyById.get(entry.id);
    const overrides = [
      `route: ${str(entry.route)}`,
      `group: ${str(entry.group)}`,
      `source: 'legacy'`,
    ];
    if (entry.status !== item.entry.status)
      overrides.push(`status: ${str(entry.status)}`);
    return `{ ...${item.entryConst}, ${overrides.join(', ')} }`;
  });
  const usage = registry.legacyCatalog
    .filter((item) => item.usageConst)
    .map((item) => `${str(item.entry.id)}: ${item.usageConst},`);
  return `${GENERATED_BANNER}

import type { RegistryEntry } from '../../models/component-entry.model';
import type { ComponentUsageDoc } from '../../models/component-doc.model';
${imports.join('\n')}

/** Catálogo completo (formato novo + legacy), ordenado por id. */
export const CATALOG_ENTRIES: readonly RegistryEntry[] = [
  ${items.join(',\n  ')}
];

/** Guias de uso das páginas legacy (página genérica antiga). */
export const COMPONENT_USAGE_DOCS: Readonly<Record<string, ComponentUsageDoc>> = {
  ${usage.join('\n  ')}
};
`;
}

/** `pages/<id>.page.generated.ts`: DOC + exemplos com o código embutido. */
export function renderFamilyPageModule(family) {
  const base = `../../../content/components/${family.id}`;
  const imports = family.examples.map(
    (example) =>
      `import { ${example.className} } from '${base}/examples/${example.slug}.example';`,
  );
  const examples = family.examples.map(
    (example) => `{
    slug: ${str(example.slug)},
    file: ${str(example.file)},
    component: ${example.className},
    source: ${str(example.source)},
  }`,
  );
  return `${GENERATED_BANNER}

import type { ComponentPageData } from '../../../models/component-page.model';
import { DOC } from '${base}/${family.id}.doc';
${imports.join('\n')}

export const PAGE: ComponentPageData = {
  doc: DOC,
  examples: [
    ${examples.join(',\n    ')}
  ],
};
`;
}

/** `pages.generated.ts`: loaders lazy de cada página no formato novo. */
export function renderPagesRegistryModule(registry) {
  const loaders = registry.content.map(
    (family) =>
      `${str(family.id)}: () => import('./pages/${family.id}.page.generated').then((m) => m.PAGE),`,
  );
  return `${GENERATED_BANNER}

import type { ComponentPageLoader } from '../../models/component-page.model';

/** Uma entrada por diretório em content/components/. */
export const COMPONENT_PAGE_LOADERS: Readonly<Record<string, ComponentPageLoader>> = {
  ${loaders.join('\n  ')}
};
`;
}

/** `routes.generated.ts`: rotas lazy de todas as famílias com página própria. */
export function renderRoutesModule(registry) {
  const byId = new Map(registry.entries.map((entry) => [entry.id, entry]));
  const contentRoutes = registry.content.map((family) => {
    const entry = byId.get(family.id);
    return `{
    path: ${str(`components/${family.id}`)},
    title: ${str(`${entry.name} — Orchestra`)},
    data: { componentId: ${str(family.id)}, description: ${str(entry.description)} },
    loadComponent: loadComponentPage,
    resolve: {
      page: () => import('./pages/${family.id}.page.generated').then((m) => m.PAGE),
      api: resolveComponentApi,
    },
  }`;
  });
  const legacyRoutes = registry.legacyPages.map((page) => {
    const entry = byId.get(page.id);
    const title = entry
      ? `${entry.name} — Orchestra`
      : `${page.id} — Orchestra`;
    return `{
    path: ${str(`components/${page.id}`)},
    title: ${str(title)},
    loadComponent: () =>
      import('../../pages/components/${page.module}').then((m) => m.${page.className}),
  }`;
  });
  return `${GENERATED_BANNER}

import type { Routes } from '@angular/router';
import {
  loadComponentPage,
  resolveComponentApi,
} from '../../pages/component-page/component-page.route';

/**
 * Rotas de componentes. Famílias com content/ usam o template único; as
 * páginas antigas escritas à mão continuam até a onda B migrá-las. As
 * demais caem em \`components/:componentId\` (página genérica antiga).
 */
export const COMPONENT_ROUTES: Routes = [
  ${[...contentRoutes, ...legacyRoutes].join(',\n  ')}
];
`;
}

/** `legacy-examples.generated.ts`: exemplos da página genérica antiga. */
export function renderLegacyExamplesModule(registry) {
  const loaders = registry.legacyExamples.map(
    (example) =>
      `${str(example.id)}: () =>
    import('../../pages/components/component-doc/examples/${example.module}').then((m) => ({ type: m.${example.className} })),`,
  );
  return `${GENERATED_BANNER}

import type { ComponentExampleLoader } from '../../models/component-doc.model';

/** Exemplo ao vivo da página genérica antiga, por id de família. */
export const COMPONENT_EXAMPLES: Readonly<Record<string, ComponentExampleLoader>> = {
  ${loaders.join('\n  ')}
};
`;
}

/** Mapa caminho → conteúdo de todos os arquivos gerados. */
export function renderRegistryOutputs(root, registry) {
  const dir = path.join(root, GENERATED_DIR);
  const outputs = new Map();
  outputs.set(
    path.join(dir, 'catalog.generated.ts'),
    renderCatalogModule(registry),
  );
  outputs.set(
    path.join(dir, 'routes.generated.ts'),
    renderRoutesModule(registry),
  );
  outputs.set(
    path.join(dir, 'pages.generated.ts'),
    renderPagesRegistryModule(registry),
  );
  outputs.set(
    path.join(dir, 'legacy-examples.generated.ts'),
    renderLegacyExamplesModule(registry),
  );
  for (const family of registry.content)
    outputs.set(
      path.join(dir, 'pages', `${family.id}.page.generated.ts`),
      renderFamilyPageModule(family),
    );
  return outputs;
}
