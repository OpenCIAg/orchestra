#!/usr/bin/env node
/** Rebuild the auditable source/component inventory; no runtime metadata assumptions. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import prettier from 'prettier';

const root = fileURLToPath(new URL('../../', import.meta.url));
const library = path.join(root, 'projects/orc-ds');
const output = path.join(root, 'docs/quality');
const checkOnly = process.argv.includes('--check');
const staleGeneratedArtifacts = [];
const writeArtifact = (file, contents) => {
  if (checkOnly) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== contents)
      staleGeneratedArtifacts.push(relative(file));
    return;
  }
  fs.writeFileSync(file, contents);
};
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(file) : [file];
    })
    .sort();
const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const files = walk(library);
const specs = files
  .filter((file) => file.endsWith('.spec.ts'))
  .map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }));
const declarations = [];

function objectOption(object, optionName, source) {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
  return object.properties.find(
    (item) =>
      item.name?.getText(source).replace(/^['"]|['"]$/g, '') === optionName,
  )?.initializer;
}

function inputAlias(options, fallback, source) {
  const alias = objectOption(options, 'alias', source);
  return alias && ts.isStringLiteralLike(alias) ? alias.text : fallback;
}

function decoratedInput(member, source) {
  const decorator = ts
    .getDecorators(member)
    ?.find(
      (item) =>
        ts.isCallExpression(item.expression) &&
        item.expression.expression.getText(source) === 'Input',
    );
  if (!decorator || !ts.isCallExpression(decorator.expression))
    return undefined;

  const [argument] = decorator.expression.arguments;
  const publicName = ts.isStringLiteralLike(argument)
    ? argument.text
    : inputAlias(argument, member.name.getText(source), source);
  const required =
    objectOption(argument, 'required', source)?.kind ===
    ts.SyntaxKind.TrueKeyword;
  return { publicName, required };
}

function memberDocs(member) {
  const comment = ts
    .getJSDocCommentsAndTags(member)
    .map((tag) => (typeof tag.comment === 'string' ? tag.comment.trim() : ''))
    .filter(Boolean)
    .join(' ');
  const deprecated = ts
    .getJSDocTags(member)
    .find((tag) => tag.tagName.text === 'deprecated');
  const docs = {};
  if (comment) docs.description = comment;
  if (deprecated) {
    docs.deprecated = true;
    if (!comment && typeof deprecated.comment === 'string')
      docs.description = deprecated.comment.trim();
  }
  return docs;
}

for (const file of files.filter(
  (file) =>
    file.endsWith('.ts') &&
    !file.endsWith('.d.ts') &&
    !file.endsWith('.spec.ts') &&
    !file.endsWith('icon-catalog.ts'),
)) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const node of source.statements.filter(ts.isClassDeclaration)) {
    const decorator = ts
      .getDecorators(node)
      ?.find(
        (item) =>
          ts.isCallExpression(item.expression) &&
          ['Component', 'Directive', 'Injectable'].includes(
            item.expression.expression.getText(source),
          ),
      );
    if (!decorator || !node.name) continue;
    const name = node.name.text;
    const call = decorator.expression;
    const metadata = call.arguments[0];
    const properties =
      metadata && ts.isObjectLiteralExpression(metadata)
        ? metadata.properties
        : [];
    const selector =
      properties.find((item) => item.name?.getText(source) === 'selector')
        ?.initializer?.text ?? '';
    const inputs = [];
    const outputs = [];
    const publicInputNames = new Map();
    for (const member of node.members) {
      if (
        !ts.isPropertyDeclaration(member) &&
        !ts.isSetAccessorDeclaration(member) &&
        !ts.isGetAccessorDeclaration(member)
      )
        continue;

      const name = member.name.getText(source).replace(/^['"]|['"]$/g, '');
      const initializer = ts.isPropertyDeclaration(member)
        ? member.initializer
        : undefined;
      const signalInput =
        initializer &&
        ts.isCallExpression(initializer) &&
        /^(input|model)(\.required)?$/.test(
          initializer.expression.getText(source),
        )
          ? initializer
          : undefined;
      const signalOutput =
        initializer &&
        ts.isCallExpression(initializer) &&
        /^(output|outputFromObservable)$/.test(
          initializer.expression.getText(source),
        )
          ? initializer
          : undefined;
      const decoratorInput = decoratedInput(member, source);
      if (!signalInput && !signalOutput && !decoratorInput) continue;

      const docs = memberDocs(member);

      if (signalOutput) {
        outputs.push({
          name,
          kind: 'output',
          declaration: member.getText(source),
          ...docs,
        });
        continue;
      }

      const signalOptions = signalInput?.arguments[1];
      const publicName = signalInput
        ? inputAlias(signalOptions, name, source)
        : decoratorInput.publicName;
      const existingMember = publicInputNames.get(publicName);
      if (existingMember && existingMember !== name) {
        throw new Error(
          `${name} in ${relative(file)} duplicates the public input binding "${publicName}" from ${existingMember}.`,
        );
      }
      if (existingMember) continue;
      publicInputNames.set(publicName, name);

      inputs.push({
        name,
        publicName,
        kind: signalInput
          ? signalInput.expression.getText(source).startsWith('model')
            ? 'model'
            : 'signal'
          : 'decorator',
        required: signalInput
          ? signalInput.expression.getText(source).endsWith('.required')
          : decoratorInput.required,
        declaration: member.getText(source),
        ...docs,
      });
    }
    const baseClass = node.heritageClauses
      ?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
      ?.types[0]?.expression.getText(source);
    declarations.push({
      name,
      baseClass,
      kind: call.expression.getText(source),
      selector,
      file: relative(file),
      line:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      inputs,
      outputs,
      testReferences: specs
        .filter((spec) => new RegExp(`\\b${name}\\b`).test(spec.text))
        .map((spec) => relative(spec.file)),
    });
  }
}

// Include inherited signal inputs so extracted bases do not disappear from the
// public-surface inventory. Ambiguous/external bases are explicitly recorded.
const resolved = new Set();
function inheritInputs(declaration, ancestors = new Set()) {
  if (resolved.has(declaration)) return;
  if (ancestors.has(declaration))
    throw new Error(`Cyclic component inheritance: ${declaration.name}`);
  if (declaration.baseClass) {
    const parents = declarations.filter(
      (candidate) => candidate.name === declaration.baseClass,
    );
    if (parents.length === 1) {
      const parent = parents[0];
      inheritInputs(parent, new Set([...ancestors, declaration]));
      const ownPublicNames = new Set(
        declaration.inputs.map((input) => input.publicName),
      );
      declaration.inputs = [
        ...parent.inputs
          .filter((input) => !ownPublicNames.has(input.publicName))
          .map((input) => ({
            ...input,
            inheritedFrom: input.inheritedFrom ?? parent.file,
          })),
        ...declaration.inputs,
      ];
    } else declaration.unresolvedBase = declaration.baseClass;
  }
  resolved.add(declaration);
}
declarations.forEach((declaration) => inheritInputs(declaration));

const entryPoints = files
  .filter(
    (file) =>
      path.basename(file) === 'ng-package.json' &&
      file !== path.join(library, 'ng-package.json'),
  )
  .map((file) => {
    const directory = path.dirname(file);
    const config = JSON.parse(fs.readFileSync(file, 'utf8'));
    const entry = path.join(directory, config.lib?.entryFile ?? 'index.ts');
    return {
      name: `@ciag/orchestra/${path.relative(library, directory)}`,
      file: relative(entry),
      exports: fs.readFileSync(entry, 'utf8').trim(),
    };
  });
const sources = [
  'projects/orc-ds',
  'projects/docs/src',
  'projects/template/src',
  'orchestra-demo/src',
  'tools',
  'compatibility',
]
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter(
    (file) =>
      /\.(ts|html|scss|json|mjs|md)$/.test(file) &&
      !file.endsWith('icon-catalog.ts') &&
      !file.endsWith('manifest.json'),
  );
const inventory = {
  declarations,
  entryPoints,
  sourceFiles: sources.map(relative),
  generatedCatalogs: [
    'projects/docs/src/app/data/icon-catalog.ts',
    'projects/docs/src/app/data/material-symbols.manifest.json',
  ],
  staleDeclarations: files
    .filter((file) => file.endsWith('.d.ts'))
    .map(relative),
};
if (!checkOnly) fs.mkdirSync(output, { recursive: true });
const inventoryJsonPath = path.join(output, 'inventory.json');
const formattedInventoryJson = await prettier.format(
  `${JSON.stringify(inventory, null, 2)}\n`,
  { filepath: inventoryJsonPath },
);
writeArtifact(inventoryJsonPath, formattedInventoryJson);

const components = declarations.filter((item) => item.kind === 'Component');
const directives = declarations.filter((item) => item.kind === 'Directive');
const services = declarations.filter((item) => item.kind === 'Injectable');
const inputKinds = declarations
  .flatMap((item) => item.inputs)
  .reduce((counts, input) => {
    counts[input.kind] = (counts[input.kind] ?? 0) + 1;
    return counts;
  }, {});
const outputCount = declarations.reduce(
  (total, item) => total + (item.outputs?.length ?? 0),
  0,
);
const markdown = [
  '# Component and source inventory',
  '',
  'Generated with `node tools/quality/inventory.mjs`. Update it after adding or moving components. The machine-readable inventory records public input names separately from source property names, including aliases and inherited bindings. A test reference is evidence of a source reference, not proof of functional coverage; the audit and test results record that separately.',
  '',
  `${components.length} component classes, ${directives.length} directives, ${services.length} services, and ${entryPoints.length} secondary entry points. ${sources.length} authored source/configuration/documentation files in the inventoried source trees. The JSON inventory contains ${Object.values(inputKinds).reduce((sum, count) => sum + count, 0)} public input bindings (${inputKinds.signal ?? 0} signal inputs, ${inputKinds.model ?? 0} models, and ${inputKinds.decorator ?? 0} decorated inputs) and ${outputCount} outputs, including inherited bindings. Generated icon metadata is checked as data rather than hand-written implementation.`,
  '',
  '| Declaration | Kind | Selector | Implementation | Referenced by specs |',
  '| --- | --- | --- | --- | --- |',
  ...declarations.map(
    (item) =>
      `| ${item.name} | ${item.kind} | \`${item.selector}\` | [source](../../${item.file}#L${item.line}) | ${item.testReferences.length ? item.testReferences.map((file) => path.basename(file)).join(', ') : 'None'} |`,
  ),
  '',
  '## Secondary entry points',
  '',
  'One secondary entry point per family; the root `@ciag/orchestra` entry exports only `core`.',
  '',
  '| Entry point | Exports |',
  '| --- | --- |',
  ...entryPoints.map(
    (item) =>
      `| \`${item.name}\` | \`${item.exports.replaceAll('\n', ' ').replaceAll('|', '\\|')}\` |`,
  ),
  '',
  '## Declaration files within source',
  '',
  ...inventory.staleDeclarations.map((file) => `- \`${file}\``),
  '',
];
const markdownPath = path.join(output, 'component-inventory.md');
const formattedMarkdown = await prettier.format(markdown.join('\n'), {
  filepath: markdownPath,
});
writeArtifact(markdownPath, formattedMarkdown);

// The behavior ledger repeats component source anchors for audit readers. Keep
// those links synchronized with the AST-derived inventory so moving a class or
// formatter-driven line changes cannot silently leave stale anchors behind.
const ledgerPath = path.join(output, 'behavior-coverage-ledger.md');
if (fs.existsSync(ledgerPath)) {
  const ledger = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/);
  const componentByName = new Map(components.map((item) => [item.name, item]));
  for (let index = 0; index < ledger.length; index++) {
    const line = ledger[index];
    if (!line.startsWith('| ')) continue;
    const declaration = [...componentByName.values()].find((item) =>
      new RegExp(
        `^\\| ${item.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s+\\|`,
      ).test(line),
    );
    if (!declaration) continue;
    const firstDelimiter = line.indexOf('|', 1);
    const secondDelimiter = line.indexOf('|', firstDelimiter + 1);
    if (firstDelimiter < 0 || secondDelimiter < 0) continue;
    const sourceCell = ` [${declaration.file}:${declaration.line}](../../${declaration.file}#L${declaration.line}) `;
    ledger[index] =
      line.slice(0, firstDelimiter + 1) +
      sourceCell +
      line.slice(secondDelimiter);
  }
  const ledgerFormatted = await prettier.format(ledger.join('\n'), {
    filepath: ledgerPath,
  });
  writeArtifact(ledgerPath, ledgerFormatted);
}

const directiveServiceLedgerPath = path.join(
  output,
  'directive-service-contract-ledger.md',
);
if (fs.existsSync(directiveServiceLedgerPath)) {
  const declarationsByName = new Map(
    declarations
      .filter((item) => item.kind === 'Directive' || item.kind === 'Injectable')
      .map((item) => [item.name, item]),
  );
  const ledger = fs
    .readFileSync(directiveServiceLedgerPath, 'utf8')
    .split(/\r?\n/);
  for (let index = 0; index < ledger.length; index++) {
    const line = ledger[index];
    const reference = line.match(/^\|\s+\[([^\]]+)\]\(([^)#]+)#L\d+\)/);
    const declaration = reference
      ? declarationsByName.get(reference[1])
      : undefined;
    if (!reference || !declaration) continue;
    const sourceCell = ` [${declaration.name}](../../${declaration.file}#L${declaration.line})`;
    ledger[index] = line.replace(reference[0], `|${sourceCell}`);
  }
  const ledgerFormatted = await prettier.format(ledger.join('\n'), {
    filepath: directiveServiceLedgerPath,
  });
  writeArtifact(directiveServiceLedgerPath, ledgerFormatted);
}

if (checkOnly && staleGeneratedArtifacts.length) {
  console.error(
    `Generated inventory artifacts are stale: ${staleGeneratedArtifacts.join(', ')}. Run node tools/quality/inventory.mjs to update them.`,
  );
  process.exitCode = 1;
}
console.log(
  `${checkOnly ? 'Verified' : 'Generated'} ${components.length} components, ${directives.length} directives, ${services.length} services, and ${entryPoints.length} entry points. Inventory: docs/quality/component-inventory.md`,
);
