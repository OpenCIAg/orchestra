import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolvePrereleasePlan } from './prerelease-guard-lib.mjs';

const base = {
  refName: 'release/22.4.0-rc',
  version: '22.4.0-rc.0',
  currentMajor: 22,
  published: ['22.3.0'],
};

test('publishes a new rc of the branch under the next dist-tag', () => {
  assert.deepEqual(resolvePrereleasePlan(base), {
    publish: true,
    distTag: 'next',
    reason: 'publishing 22.4.0-rc.0 under the next dist-tag',
  });
});

test('skips (without failing) an rc that is already published', () => {
  const plan = resolvePrereleasePlan({
    ...base,
    published: ['22.3.0', '22.4.0-rc.0'],
  });
  assert.equal(plan.publish, false);
  assert.match(plan.reason, /bump the -rc/);
});

test('rejects stable versions, foreign branches and other majors', () => {
  assert.throws(
    () => resolvePrereleasePlan({ ...base, version: '22.4.0' }),
    /not <major>/,
  );
  assert.throws(
    () => resolvePrereleasePlan({ ...base, version: '22.5.0-rc.0' }),
    /does not belong/,
  );
  assert.throws(
    () => resolvePrereleasePlan({ ...base, refName: 'main' }),
    /is not release/,
  );
  assert.throws(
    () =>
      resolvePrereleasePlan({
        ...base,
        refName: 'release/23.0.0-rc',
        version: '23.0.0-rc.0',
      }),
    /not the current line/,
  );
});
