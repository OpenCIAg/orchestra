/**
 * Prerelease (release candidate) publishing for `release/*` branches.
 *
 * The governed stream (main → `latest`, v* tags → angularNN) is untouched.
 * A `release/<major>.<minor>.<patch>-rc` branch publishes the package version
 * `<major>.<minor>.<patch>-rc.<n>` under the `next` dist-tag, so consumers opt
 * in with `npm install @ciag/orchestra@next` (or the exact version) while
 * `latest` keeps pointing at the stable release.
 *
 * Pure verdict logic; the CLI (prerelease-guard.mjs) feeds it the event and
 * the registry state. Unit-tested in prerelease-guard.test.mjs.
 */

export const PRERELEASE_DIST_TAG = 'next';

const RC_VERSION = /^(\d+)\.(\d+)\.(\d+)-rc\.(\d+)$/;
const RC_BRANCH = /^release\/(\d+\.\d+\.\d+)-rc$/;

/**
 * @param {object} input
 * @param {string} input.refName   branch name (GITHUB_REF_NAME)
 * @param {string} input.version   projects/orc-ds/package.json version
 * @param {number} input.currentMajor  versions.json → main.packageMajor
 * @param {string[]} input.published   versions already on the registry
 * @returns {{ publish: boolean, distTag: string, reason: string }}
 * @throws when the branch/version pair is inconsistent (the run must fail).
 */
export function resolvePrereleasePlan({
  refName,
  version,
  currentMajor,
  published,
}) {
  const branch = RC_BRANCH.exec(refName ?? '');
  if (!branch)
    throw new Error(
      `prerelease: branch "${refName}" is not release/<major>.<minor>.<patch>-rc`,
    );
  const rc = RC_VERSION.exec(version ?? '');
  if (!rc)
    throw new Error(
      `prerelease: version "${version}" is not <major>.<minor>.<patch>-rc.<n>`,
    );
  const base = `${rc[1]}.${rc[2]}.${rc[3]}`;
  if (base !== branch[1])
    throw new Error(
      `prerelease: version ${version} does not belong to branch ${refName} (expected ${branch[1]}-rc.<n>)`,
    );
  if (Number(rc[1]) !== currentMajor)
    throw new Error(
      `prerelease: major ${rc[1]} is not the current line (${currentMajor}, compatibility/versions.json)`,
    );
  if (published.includes(version))
    return {
      publish: false,
      distTag: PRERELEASE_DIST_TAG,
      reason: `${version} is already on the registry; bump the -rc.<n> suffix to publish again`,
    };
  return {
    publish: true,
    distTag: PRERELEASE_DIST_TAG,
    reason: `publishing ${version} under the ${PRERELEASE_DIST_TAG} dist-tag`,
  };
}
