// Publish guard — verdict logic (ticket #6).
//
// Pure seam shared by the CLI (tools/release/publish-guard.mjs) and the unit
// tests. The CLI supplies git/registry reality; this module decides whether a
// release may publish, must skip, or has hit a guard failure.
import {
  compareVersions,
  parseVersion,
  resolveBranchForTag,
} from './topology-lib.mjs';

export { compareVersions, parseVersion };

/**
 * Map CI/local reality onto a release event. Pure: the CLI supplies git/env
 * facts; this decides which event shape the plan resolution receives.
 *
 * @param {object} input
 * @param {string|null} [input.ref] full GITHUB_REF-style ref, when available
 * @param {string} [input.eventName] GITHUB_EVENT_NAME-style event name
 * @param {string|null} [input.branch] resolved branch name (explicit override,
 *   RELEASE_BRANCH, or the checked-out git branch)
 * @param {string|null} [input.tag] explicit tag override for local simulations
 *   of old-line tag releases (no GITHUB_REF exists outside CI)
 * @returns {{ event: 'branch-push'|'tag-push', tagName: string|null, branch: string|null }}
 */
export function resolveEventContext({
  ref = null,
  eventName = 'push',
  branch = null,
  tag = null,
} = {}) {
  if (tag) {
    return { event: 'tag-push', tagName: tag, branch: null };
  }
  if (eventName === 'push' && ref?.startsWith('refs/tags/')) {
    return {
      event: 'tag-push',
      tagName: ref.replace('refs/tags/', ''),
      branch: null,
    };
  }
  return { event: 'branch-push', tagName: null, branch };
}

/**
 * Decide the release action for one CI run.
 *
 * @param {object} input
 * @param {'branch-push'|'tag-push'} input.event
 * @param {string} input.branch resolved branch name present in the topology
 * @param {string} [input.tagName] tag name for tag-push events (e.g. 'v22.2.2')
 * @param {string} input.version package version at HEAD
 * @param {string} input.previousVersion package version at HEAD~1
 * @param {number} input.pendingChangesets unconsumed .changeset/*.md count
 * @param {{ versions: Record<string, unknown>, distTags: Record<string, string> } | null} input.registry
 *   npm packument snapshot, or null when the registry could not be reached
 * @param {Record<string, object>} input.topology parsed compatibility/versions.json
 * @param {boolean|null} [input.taggedCommitOnCurrentLine] whether the tagged
 *   commit is reachable from the current line's branch (ticket #8). Null when
 *   the caller could not determine it; the old-line checks then apply as
 *   before. True + a matching package version means the tag marks the current
 *   line's governed release (created by tag-release.yml), not a backport tag.
 * @returns {{ action: 'publish'|'skip'|'fail', reason: string, distTag: string|null, warnings: string[] }}
 */
export function resolveReleasePlan(input) {
  const {
    event,
    branch,
    tagName = null,
    version,
    previousVersion,
    pendingChangesets = 0,
    registry,
    topology,
    taggedCommitOnCurrentLine = null,
  } = input;
  const skip = (reason) => ({
    action: 'skip',
    reason,
    distTag: null,
    warnings: [],
  });
  const fail = (reason) => ({
    action: 'fail',
    reason,
    distTag: null,
    warnings: [],
  });

  // Tag pushes route to a branch through the tag globs; an unclaimed tag is
  // reported by the tag-push path below, not as an unknown branch.
  const entry = branch == null ? undefined : topology[branch];
  if (!entry && event !== 'tag-push') {
    return fail(
      `Branch '${branch}' is not part of the release topology (compatibility/versions.json).`,
    );
  }

  if (event === 'branch-push') {
    if (version === previousVersion) {
      return skip(
        `Package version ${version} is unchanged since the previous commit; nothing to publish.`,
      );
    }
    if (entry.role !== 'current') {
      return skip(
        `Branch '${branch}' is a ${entry.role} line; it publishes only from tags.`,
      );
    }
    if (pendingChangesets > 0) {
      return skip(
        `Version changed to ${version} but ${pendingChangesets} changeset proposal(s) are pending; ` +
          'a hand bump is not a governed release. Merge the changesets Version PR instead.',
      );
    }
    if (!registry) {
      return fail(
        'The npm registry could not be reached; refusing to publish unverified.',
      );
    }
    if (registry.versions[version]) {
      return fail(`Version ${version} is already published to npm; collision.`);
    }
    const latest = registry.distTags?.latest;
    if (latest && compareVersions(version, latest) < 0) {
      return fail(
        `Version ${version} is older than the published latest (${latest}); ` +
          'the current line must not move latest backwards.',
      );
    }
    return {
      action: 'publish',
      reason: previousVersion
        ? `Governed release: version moved ${previousVersion} -> ${version} with all changesets consumed.`
        : `Governed release: version ${version} with all changesets consumed (no previous version to compare).`,
      distTag: entry.distTag,
      warnings: [],
    };
  }

  if (event === 'tag-push') {
    if (!tagName) {
      return fail('Tag push event arrived without a tag name.');
    }
    const tagBranch = resolveBranchForTag(topology, tagName);
    if (!tagBranch) {
      return fail(
        `Tag '${tagName}' does not match any branch tag glob in compatibility/versions.json; ` +
          'release tags must be claimed by exactly one release line.',
      );
    }
    if (branch != null && branch !== tagBranch) {
      return fail(
        `Tag '${tagName}' routes to '${tagBranch}', not '${branch}'.`,
      );
    }
    const tagEntry = topology[tagBranch];
    const tagVersion = tagName.replace(/^v/, '');
    if (tagVersion !== version) {
      return fail(
        `Tag '${tagName}' disagrees with the package version ${version} at the tagged commit.`,
      );
    }
    if (taggedCommitOnCurrentLine) {
      // Ticket #8: the current line's release tags are created by
      // tag-release.yml on the governed main push; the publish already ran
      // (or runs concurrently) on the branch-push path. Without this skip, a
      // main release tag inside the vNN.* tagGlob space (e.g. v22.* while the
      // package major is 22) would be judged as a backport tag and fail the
      // frozen-line invariants on every current-line release.
      const currentBranch = Object.entries(topology).find(
        ([, entry]) => entry.role === 'current',
      )?.[0];
      return skip(
        `Tag '${tagName}' marks a release commit on the current line ('${currentBranch ?? 'main'}'); ` +
          'the tag/Release workflow owns its artifacts and the old-line publish path does not apply.',
      );
    }
    if (version === previousVersion) {
      return skip(
        `Tagged commit does not change the package version (${version}); nothing to publish.`,
      );
    }
    if (tagEntry.publish === 'patch-tag') {
      if (!previousVersion) {
        return fail(
          `Branch '${tagBranch}' is a frozen backport line and the previous version is ` +
            'unknown; the patch-only invariant cannot be verified, so the release is refused.',
        );
      }
      const [currentMajor, currentMinor, currentPatch] = parseVersion(version);
      const [previousMajor, previousMinor, previousPatch] =
        parseVersion(previousVersion);
      const sameStream =
        currentMajor === previousMajor &&
        currentMinor === previousMinor &&
        currentPatch > previousPatch;
      if (!sameStream) {
        return fail(
          `Branch '${tagBranch}' is a frozen backport line: only patch releases of the ` +
            `${previousMajor}.${previousMinor}.x stream may publish (got ${previousVersion} -> ${version}).`,
        );
      }
    }
    if (!registry) {
      return fail(
        'The npm registry could not be reached; refusing to publish unverified.',
      );
    }
    if (registry.versions[version]) {
      return fail(`Version ${version} is already published to npm; collision.`);
    }
    const warnings = [];
    const latest = registry.distTags?.latest;
    if (latest && compareVersions(version, latest) > 0) {
      warnings.push(
        `Version ${version} is newer than the registry latest (${latest}); ` +
          'reconcile the latest dist-tag after publishing.',
      );
    }
    return {
      action: 'publish',
      reason: previousVersion
        ? `Governed tag release: ${tagName} on ${tagBranch} (${previousVersion} -> ${version}).`
        : `Governed tag release: ${tagName} on ${tagBranch} (version ${version}).`,
      distTag: tagEntry.distTag,
      warnings,
    };
  }

  return fail(`Unsupported release event '${event}'.`);
}
