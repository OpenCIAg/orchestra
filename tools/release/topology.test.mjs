import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDistTagPlan, validateTopology } from './topology-lib.mjs';

// The shipping topology: main owns Angular 22, v19–v21 are tag-published
// backport lines, v22 is the frozen 22.x backport stream (patch tags only).
const shippingTopology = {
  main: {
    angular: '22',
    angularRange: '^22.0.0',
    primeNg: '22.0.0',
    packageMajor: 22,
    node: '22',
    role: 'current',
    publish: 'version-pr',
    distTag: 'latest',
  },
  v19: {
    angular: '19',
    angularRange: '^19.0.0',
    primeNg: '19.1.4',
    packageMajor: 19,
    node: '20',
    role: 'backport',
    publish: 'tag',
    tagGlob: 'v19.*',
    distTag: 'angular19',
  },
  v20: {
    angular: '20',
    angularRange: '^20.0.0',
    primeNg: '20.4.0',
    packageMajor: 20,
    node: '20',
    role: 'backport',
    publish: 'tag',
    tagGlob: 'v20.*',
    distTag: 'angular20',
  },
  v21: {
    angular: '21',
    angularRange: '^21.0.0',
    primeNg: '21.1.9',
    packageMajor: 21,
    node: '22',
    role: 'backport',
    publish: 'tag',
    tagGlob: 'v21.*',
    distTag: 'angular21',
  },
  v22: {
    angular: '22',
    angularRange: '^22.0.0',
    primeNg: '22.0.0',
    packageMajor: 22,
    node: '22',
    role: 'backport',
    publish: 'patch-tag',
    tagGlob: 'v22.*',
    distTag: 'angular22',
  },
};

test('the shipping topology is sound', () => {
  assert.deepEqual(validateTopology(shippingTopology), []);
});

test('two current owners of the same package major are rejected', () => {
  const topology = {
    ...shippingTopology,
    v22: { ...shippingTopology.v22, role: 'current', publish: 'version-pr' },
  };
  delete topology.v22.tagGlob;
  const errors = validateTopology(topology);
  assert.ok(
    errors.some((error) =>
      /only one branch per package major may own publishing/.test(error),
    ),
    errors.join('\n'),
  );
});

test('a package major served only by backport lines needs no current owner', () => {
  // v19–v21 are the sole publishers of their majors while remaining backport
  // lines; the single-owner rule forbids two currents, not zero.
  const topology = { ...shippingTopology };
  delete topology.main;
  assert.deepEqual(validateTopology(topology), []);
});

test('a current owner may not claim release tags', () => {
  const topology = {
    ...shippingTopology,
    main: { ...shippingTopology.main, tagGlob: 'v22.*' },
  };
  assert.ok(
    validateTopology(topology).some((error) =>
      /must not claim release tags/.test(error),
    ),
  );
});

test('a backport line must declare its tag glob and dist-tag', () => {
  const noGlob = {
    ...shippingTopology,
    v22: { ...shippingTopology.v22, tagGlob: undefined },
  };
  assert.ok(validateTopology(noGlob).some((error) => /tagGlob/.test(error)));

  const badTag = {
    ...shippingTopology,
    v22: { ...shippingTopology.v22, distTag: 'latest' },
  };
  assert.ok(
    validateTopology(badTag).some((error) =>
      /dist-tag must be 'angular22'/.test(error),
    ),
  );
});

test('overlapping tag globs are rejected', () => {
  const topology = {
    ...shippingTopology,
    v21: { ...shippingTopology.v21, tagGlob: 'v2*' },
  };
  const errors = validateTopology(topology);
  assert.ok(
    errors.some((error) => /overlap/.test(error)),
    errors.join('\n'),
  );
});

test('unknown roles and publish modes are rejected', () => {
  const topology = {
    ...shippingTopology,
    v19: { ...shippingTopology.v19, role: 'owner', publish: 'whenever' },
  };
  const errors = validateTopology(topology);
  assert.ok(errors.some((error) => /role must be/.test(error)));
});

test('the plan maps each branch to its dist-tag with registry state', () => {
  const registry = {
    versions: { '22.1.0': {}, '22.2.0': {}, '22.2.1': {}, '19.3.0': {} },
    distTags: { latest: '22.1.0', angular22: '22.2.1', angular19: '19.3.0' },
  };
  const plan = buildDistTagPlan({
    topology: shippingTopology,
    branchVersions: { main: '22.2.0', v22: '22.2.1', v19: '19.3.0' },
    registry,
  });
  const mainRow = plan.rows.find((row) => row.branch === 'main');
  assert.equal(mainRow.distTag, 'latest');
  assert.equal(mainRow.status, 'published-untagged');
  assert.ok(mainRow.warnings.some((warning) => /collision/.test(warning)));
  assert.ok(
    mainRow.warnings.some((warning) => /repoint it at 22\.2\.0/.test(warning)),
    mainRow.warnings.join('\n'),
  );

  const v22Row = plan.rows.find((row) => row.branch === 'v22');
  assert.equal(v22Row.distTag, 'angular22');
  assert.equal(v22Row.status, 'current');

  const v20Row = plan.rows.find((row) => row.branch === 'v20');
  assert.equal(v20Row.status, 'unresolved');
});

test('the plan reports latest trailing the newest published version', () => {
  const registry = {
    versions: { '22.2.0': {}, '22.2.1': {} },
    distTags: { latest: '22.2.0', angular22: '22.2.1' },
  };
  const plan = buildDistTagPlan({
    topology: shippingTopology,
    branchVersions: { main: '22.2.0', v22: '22.2.1' },
    registry,
  });
  assert.ok(
    plan.reconciliation.some((warning) =>
      /latest=22\.2\.0.*22\.2\.1/.test(warning),
    ),
    plan.reconciliation.join('\n'),
  );
});

test('a reconciled latest produces no reconciliation warning', () => {
  const registry = {
    versions: { '22.2.1': {} },
    distTags: { latest: '22.2.1', angular22: '22.2.1' },
  };
  const plan = buildDistTagPlan({
    topology: shippingTopology,
    branchVersions: { main: '22.2.0' },
    registry,
  });
  assert.deepEqual(plan.reconciliation, []);
});
