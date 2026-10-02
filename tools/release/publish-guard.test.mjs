import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  resolveEventContext,
  resolveReleasePlan,
} from './publish-guard-lib.mjs';
import { resolveBranchForTag } from './topology-lib.mjs';
// Fixtures — shaped after compatibility/versions.json (ticket #6 topology).
const topology = {
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
};

const registry = {
  versions: { '22.2.0': {}, '22.2.1': {}, '21.1.1': {} },
  distTags: { latest: '22.2.0', angular22: '22.2.1', angular21: '21.1.1' },
};

test('a governed Version-PR merge on the current line publishes as latest', () => {
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.3.0',
    previousVersion: '22.2.0',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'publish');
  assert.equal(plan.distTag, 'latest');
});

test('a push that leaves the package version unchanged attempts no publish', () => {
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.2.0',
    previousVersion: '22.2.0',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'skip');
  assert.equal(plan.distTag, null);
});

test('a version that already exists on the registry is a collision failure', () => {
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.2.0',
    previousVersion: '22.1.0',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /already published/);
});

test('a version older than the published latest is refused on the current line', () => {
  // Regression guard for the 22.1.0 -> 22.0.2 backwards move of 2026-08-24.
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.0.2',
    previousVersion: '22.1.0',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /latest/);
});

test('an ungoverned version change with pending changesets is not published', () => {
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.3.0',
    previousVersion: '22.2.0',
    pendingChangesets: 2,
    registry,
    topology,
  });
  assert.equal(plan.action, 'skip');
  assert.match(plan.reason, /changeset/);
});

test('an unreachable registry fails the publish path closed', () => {
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.3.0',
    previousVersion: '22.2.0',
    pendingChangesets: 0,
    registry: null,
    topology,
  });
  assert.equal(plan.action, 'fail');
});

test('a publish verdict never renders a null previous version (probe or first release)', () => {
  const branchPlan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'main',
    version: '22.3.0',
    previousVersion: null,
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(branchPlan.action, 'publish');
  assert.ok(!branchPlan.reason.includes('null'), branchPlan.reason);

  const tagPlan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v21',
    tagName: 'v21.1.2',
    version: '21.1.2',
    previousVersion: null,
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(tagPlan.action, 'publish');
  assert.ok(!tagPlan.reason.includes('null'), tagPlan.reason);
});

test('a frozen backport line with no previous version fails closed', () => {
  // The patch-only invariant of a patch-tag line cannot be verified without
  // the previous version; the guard must refuse rather than guess.
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.2.2',
    version: '22.2.2',
    previousVersion: null,
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /patch|previous/i);
});

test('a plain push to a backport line attempts no publish', () => {
  const plan = resolveReleasePlan({
    event: 'branch-push',
    branch: 'v22',
    version: '22.2.2',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'skip');
  assert.match(plan.reason, /tags/);
});

test('a release tag routes to the branch that claims its glob', () => {
  assert.equal(resolveBranchForTag(topology, 'v22.2.2'), 'v22');
  assert.equal(resolveBranchForTag(topology, 'v19.3.0'), null);
  assert.equal(resolveBranchForTag(topology, 'not-a-tag'), null);
});

test('a patch tag on the frozen backport line publishes to its dist-tag', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.2.2',
    version: '22.2.2',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'publish');
  assert.equal(plan.distTag, 'angular22');
});

test('a minor bump tag on the frozen backport line is refused', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.3.0',
    version: '22.3.0',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /patch/);
});

test('a tag-push event without a tag name fails with a clear reason', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: null,
    version: '22.2.2',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /tag name/i);
});

test('a tag that no branch claims fails the release', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: null,
    tagName: 'v18.0.1',
    version: '18.0.1',
    previousVersion: '18.0.0',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /tag/);
});

test('a tag that disagrees with the package version fails the release', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.2.2',
    version: '22.2.3',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /mismatch|disagree/i);
});

test('a tag on a commit that does not change the version attempts no publish', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.2.1',
    version: '22.2.1',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'skip');
});

test('a tag marking a current-line release commit skips the old-line path (ticket #8)', () => {
  // tag-release.yml tags the governed main release; during the package-major
  // 22 era that tag (v22.3.0) falls inside the v22 backport glob but must not
  // be judged by the frozen line's patch-only invariant.
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: null,
    tagName: 'v22.3.0',
    version: '22.3.0',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
    taggedCommitOnCurrentLine: true,
  });
  assert.equal(plan.action, 'skip');
  assert.match(plan.reason, /current line/);
  assert.equal(plan.distTag, null);
});

test('a current-line release tag whose version disagrees still fails', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: null,
    tagName: 'v22.9.9',
    version: '22.2.0',
    previousVersion: '22.1.1',
    pendingChangesets: 0,
    registry,
    topology,
    taggedCommitOnCurrentLine: true,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /disagree/);
});

test('an undeterminable current-line fact keeps the old-line behavior', () => {
  // Fail closed toward the backport checks: when the caller cannot resolve
  // the current branch, a backport tag must still be judged as one.
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: null,
    tagName: 'v22.3.0',
    version: '22.3.0',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
    taggedCommitOnCurrentLine: null,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /patch/);
});

test('a backport tag colliding with a published version fails', () => {
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.2.1',
    version: '22.2.1',
    previousVersion: '22.2.0',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'fail');
  assert.match(plan.reason, /already published/);
});

test('a backport publish ahead of latest proceeds with a reconciliation warning', () => {
  // Mirrors the live state: angular22=22.2.1 sits ahead of latest=22.2.0.
  const plan = resolveReleasePlan({
    event: 'tag-push',
    branch: 'v22',
    tagName: 'v22.2.2',
    version: '22.2.2',
    previousVersion: '22.2.1',
    pendingChangesets: 0,
    registry,
    topology,
  });
  assert.equal(plan.action, 'publish');
  assert.ok(plan.warnings.some((warning) => /latest/.test(warning)));
});

test('event resolution maps a CI tag ref to a tag-push event', () => {
  const context = resolveEventContext({
    ref: 'refs/tags/v22.2.2',
    eventName: 'push',
    branch: '',
    tag: null,
  });
  assert.equal(context.event, 'tag-push');
  assert.equal(context.tagName, 'v22.2.2');
  assert.equal(context.branch, null);
});

test('event resolution lets an explicit tag drive a local tag simulation', () => {
  // Local dry runs have no GITHUB_REF; --tag must still produce a tag push.
  const context = resolveEventContext({
    ref: null,
    eventName: 'push',
    branch: 'wt/6-release-guards',
    tag: 'v22.2.2',
  });
  assert.equal(context.event, 'tag-push');
  assert.equal(context.tagName, 'v22.2.2');
  assert.equal(context.branch, null);
});

test('event resolution defaults to a branch push on the given branch', () => {
  const context = resolveEventContext({
    ref: 'refs/heads/main',
    eventName: 'push',
    branch: 'main',
    tag: null,
  });
  assert.equal(context.event, 'branch-push');
  assert.equal(context.tagName, null);
  assert.equal(context.branch, 'main');
});
