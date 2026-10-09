import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

const distribution = path.resolve('dist/orc-ds');
const manifest = JSON.parse(
  readFileSync(path.join(distribution, 'package.json'), 'utf8'),
);
const entries = [];
for (const [entry, conditions] of Object.entries(manifest.exports)) {
  if (entry.includes('*')) continue;
  const targets =
    typeof conditions === 'string' ? [conditions] : Object.values(conditions);
  for (const target of targets) {
    if (
      typeof target !== 'string' ||
      !existsSync(path.resolve(distribution, target))
    )
      throw new Error(`Missing packed export target: ${entry} -> ${target}`);
  }
  if (typeof conditions === 'object' && conditions.default?.endsWith('.mjs'))
    entries.push(
      entry === '.' ? manifest.name : manifest.name + entry.slice(1),
    );
}
if (!entries.includes(manifest.name))
  throw new Error('Package has no JavaScript root export');

const work = mkdtempSync(path.join(tmpdir(), 'orchestra-package-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let passed = false;
try {
  const packed = JSON.parse(
    execFileSync(
      npm,
      [
        'pack',
        distribution,
        '--ignore-scripts',
        '--pack-destination',
        work,
        '--json',
      ],
      { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
    ),
  );
  const archive = path.join(work, packed[0].filename);
  // The published package ships its README (ticket #8): ng-packagr copies it
  // via ng-package assets; npm packs it from the distribution root.
  const archiveFiles = new Set(
    execFileSync('tar', ['-tf', archive], { encoding: 'utf8' }).split('\n'),
  );
  if (!archiveFiles.has('package/README.md'))
    throw new Error(
      'Packed package is missing README.md; check projects/orc-ds/ng-package.json assets.',
    );
  const consumer = path.join(work, 'consumer');
  mkdirSync(consumer);
  const rootLockfilePath = path.resolve('package-lock.json');
  const rootLockfile = existsSync(rootLockfilePath)
    ? JSON.parse(readFileSync(rootLockfilePath, 'utf8'))
    : null;
  const lockedAngularVersion =
    rootLockfile?.packages?.['node_modules/@angular/core']?.version;
  const minimumAngularVersion =
    manifest.peerDependencies['@angular/core'].match(/\d+\.\d+\.\d+/)?.[0];
  const minimumAngular = process.argv.includes('--minimum-angular');
  const overrideAngularVersion = process.env.ORC_CONSUMER_ANGULAR_VERSION;
  if (minimumAngular && !minimumAngularVersion && !overrideAngularVersion)
    throw new Error(
      'Cannot determine the minimum Angular version from the peer range',
    );
  const angularPeerNames = Object.keys(manifest.peerDependencies).filter(
    (name) => name.startsWith('@angular/'),
  );
  const lockedAngularVersions = Object.fromEntries(
    angularPeerNames.map((name) => [
      name,
      rootLockfile?.packages?.[`node_modules/${name}`]?.version,
    ]),
  );
  // Keep current-mode consumers on the repository's locked Angular patch set.
  // Each peer uses its own lock entry because Angular packages can require
  // exact matching patches; the core version is only the fallback for a
  // package absent from the lockfile. Explicit overrides and minimum mode
  // intentionally apply one version to every Angular package.
  const angularPeers = Object.fromEntries(
    angularPeerNames
      .map((name) => [
        name,
        overrideAngularVersion ??
          (minimumAngular
            ? minimumAngularVersion
            : (lockedAngularVersions[name] ?? lockedAngularVersion)),
      ])
      .filter(([, version]) => version),
  );
  const compilerVersion =
    overrideAngularVersion ??
    (minimumAngular
      ? minimumAngularVersion
      : (rootLockfile?.packages?.['node_modules/@angular/compiler']?.version ??
        lockedAngularVersion));
  writeFileSync(
    path.join(consumer, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies: { [manifest.name]: `file:${archive}`, ...angularPeers },
        // Angular's partial compilation requires the compiler when imported directly in Node.
        devDependencies: {
          '@angular/compiler':
            compilerVersion ?? manifest.peerDependencies['@angular/core'],
        },
      },
      null,
      2,
    ),
  );
  // Normal peer resolution matters: an incomplete library manifest must fail here.
  execFileSync(
    npm,
    ['install', '--ignore-scripts', '--no-fund', '--no-audit'],
    { cwd: consumer, stdio: 'inherit' },
  );
  writeFileSync(
    path.join(consumer, 'imports.mjs'),
    `
    import '@angular/compiler';
    const entries = ${JSON.stringify(entries)};
    for (const entry of entries) await import(entry);
    const root = await import(${JSON.stringify(manifest.name)});
    for (const [alias, canonical, name] of [
      ['tag', 'p2', 'TagComponent'], ['empty-state', 'p2', 'EmptyStateComponent'],
      ['segmented-control', 'p2', 'SegmentedControlComponent'], ['popover', 'p2', 'PopoverComponent'],
      ['overlay-panel', 'overlaypanel', 'OverlayPanelComponent'], ['multi-select', 'p2', 'MultiSelectComponent'],
      ['tree-select', 'p2', 'TreeSelectComponent'], ['data-table', 'p2', 'DataTableComponent'],
      ['splitter', 'p2', 'SplitterComponent'], ['portal', 'p2', 'PortalComponent']
    ]) {
      const first = await import(${JSON.stringify(manifest.name)} + '/' + alias);
      const second = await import(${JSON.stringify(manifest.name)} + '/' + canonical);
      if (!first[name] || first[name] !== second[name]) throw new Error('Alias identity mismatch: ' + name);
    }
    if (!root.ButtonComponent || !root.DatePickerComponent || !root.ModalComponent)
      throw new Error('Expected primary component exports are missing');
    console.log('Validated ' + entries.length + ' JavaScript entry points and consolidated aliases in an isolated npm consumer.');
  `,
  );
  execFileSync(process.execPath, ['imports.mjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
  writeFileSync(
    path.join(consumer, 'imports.ts'),
    entries
      .map(
        (entry, index) =>
          `import * as entry${index} from ${JSON.stringify(entry)};\nvoid entry${index};`,
      )
      .join('\n'),
  );
  writeFileSync(
    path.join(consumer, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          types: [],
          lib: ['ES2022', 'DOM'],
        },
        files: ['imports.ts'],
      },
      null,
      2,
    ),
  );
  execFileSync(
    process.execPath,
    [path.resolve('node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'],
    { cwd: consumer, stdio: 'inherit' },
  );
  console.log('Validated public type declarations without skipLibCheck.');
  // The stylesheet entries are plain CSS: resolve them through the installed
  // package's export map and reject anything a CSS-only consumer cannot load.
  const cssEntries = Object.keys(manifest.exports).filter((entry) =>
    entry.endsWith('.css'),
  );
  for (const entry of ['./styles.css', './reset.css'])
    if (!cssEntries.includes(entry))
      throw new Error(`Package does not export ${entry}`);
  const require = createRequire(path.join(consumer, 'package.json'));
  for (const entry of cssEntries) {
    const specifier = manifest.name + entry.slice(1);
    const css = readFileSync(require.resolve(specifier), 'utf8');
    if (/(^|\s)@(use|forward|mixin|include)\b|#\{/.test(css))
      throw new Error(`Sass syntax leaked into ${specifier}`);
    if (!css.includes('@layer orc.reset, orc.tokens, orc.base, orc.components'))
      throw new Error(`Missing Orchestra layer order in ${specifier}`);
  }
  const stylesCss = readFileSync(
    require.resolve(`${manifest.name}/styles.css`),
    'utf8',
  );
  if (!stylesCss.includes('--orc-primary:'))
    throw new Error('styles.css is missing the semantic tokens');
  console.log(`Validated ${cssEntries.length} packed CSS entry points.`);
  passed = true;
} finally {
  if (passed) rmSync(work, { recursive: true, force: true });
  else console.error(`Package verification fixture retained at ${work}`);
}
