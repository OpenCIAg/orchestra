// Release topology — shared parsing/validation of compatibility/versions.json.
//
// versions.json is the machine-readable contract for the single-owner stream
// topology (ticket #6): each branch declares what it is (`role`) and how it may
// publish (`publish`), backport lines claim their release tags via `tagGlob`,
// and exactly one branch per package major may publish as `current`.

const TAG_NAME_PATTERN = /^v(\d+)\.\d+\.\d+(?:-.*)?$/;

/**
 * Parse a plain `major.minor.patch` version. Throws on anything else so the
 * guard fails closed on malformed versions instead of silently comparing wrong.
 */
export function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-.*)?$/.exec(version ?? '');
  if (!match) throw new Error(`Unparseable package version '${version}'.`);
  return match.slice(1).map(Number);
}

/** Compare two plain versions: -1 when a < b, 0 when equal, 1 when a > b. */
export function compareVersions(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}

/** Translate a tag glob like `v22.*` into an anchored RegExp. */
export function globToRegExp(glob) {
  const source = glob
    .split('*')
    .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${source}$`);
}

/**
 * Find the branch whose tagGlob claims a release tag name.
 * Returns the branch name, or null when no branch claims the tag.
 * Throws when several branches claim it (an invalid topology — see
 * validateTopology — must never reach a publish decision).
 */
export function resolveBranchForTag(topology, tagName) {
  if (!TAG_NAME_PATTERN.test(tagName ?? '')) return null;
  const claimants = Object.entries(topology)
    .filter(
      ([, entry]) => entry.tagGlob && globToRegExp(entry.tagGlob).test(tagName),
    )
    .map(([branch]) => branch);
  if (claimants.length > 1) {
    throw new Error(
      `Tag '${tagName}' is claimed by several branches (${claimants.join(', ')}); ` +
        'tag globs in compatibility/versions.json must be mutually exclusive.',
    );
  }
  return claimants[0] ?? null;
}

/**
 * Validate the publishing topology. Returns a list of human-readable errors
 * (empty when the topology is sound):
 * - every branch declares a role (current | backport) and a publish mode
 *   (version-pr | tag | patch-tag) consistent with that role,
 * - exactly one branch per package major has the current role (single owner),
 * - only backport lines claim tag globs, and the globs are mutually exclusive,
 * - dist-tags follow the latest/angularNN convention.
 */
export function validateTopology(topology) {
  const errors = [];
  const currentsPerMajor = new Map();
  const globOwners = [];

  const roles = new Set(['current', 'backport']);
  const publishModes = new Set(['version-pr', 'tag', 'patch-tag']);

  for (const [branch, entry] of Object.entries(topology)) {
    const label = `versions.json[${branch}]`;
    if (!roles.has(entry.role)) {
      errors.push(
        `${label}: role must be 'current' or 'backport', got '${entry.role}'.`,
      );
      continue;
    }
    if (!publishModes.has(entry.publish)) {
      errors.push(
        `${label}: publish must be 'version-pr', 'tag' or 'patch-tag', got '${entry.publish}'.`,
      );
      continue;
    }
    if (entry.role === 'current') {
      if (entry.publish !== 'version-pr') {
        errors.push(
          `${label}: the current owner publishes via Version-PR merges, not '${entry.publish}'.`,
        );
      }
      if (entry.distTag !== 'latest') {
        errors.push(
          `${label}: the current owner must publish under dist-tag 'latest'.`,
        );
      }
      if (entry.tagGlob) {
        errors.push(`${label}: the current owner must not claim release tags.`);
      }
      const owners = currentsPerMajor.get(entry.packageMajor) ?? [];
      owners.push(branch);
      currentsPerMajor.set(entry.packageMajor, owners);
    } else {
      if (entry.publish === 'version-pr') {
        errors.push(
          `${label}: a backport line cannot publish via Version-PR merges.`,
        );
      }
      if (!entry.tagGlob) {
        errors.push(
          `${label}: a backport line must declare the tagGlob it publishes from.`,
        );
      } else {
        globOwners.push([branch, entry.tagGlob]);
      }
      const expected = `angular${entry.angular}`;
      if (entry.distTag !== expected) {
        errors.push(
          `${label}: dist-tag must be '${expected}', got '${entry.distTag}'.`,
        );
      }
    }
  }

  for (const [packageMajor, owners] of currentsPerMajor) {
    if (owners.length > 1) {
      errors.push(
        `packageMajor ${packageMajor} has ${owners.length} 'current' publishing owners ` +
          `(${owners.join(', ')}); only one branch per package major may own publishing.`,
      );
    }
  }

  for (let i = 0; i < globOwners.length; i += 1) {
    const [branchA, globA] = globOwners[i];
    const regexA = globToRegExp(globA);
    for (let j = i + 1; j < globOwners.length; j += 1) {
      const [branchB, globB] = globOwners[j];
      if (regexA.test(globB) || globToRegExp(globB).test(globA)) {
        errors.push(
          `Tag globs of ${branchA} ('${globA}') and ${branchB} ('${globB}') overlap; ` +
            'each release tag must route to exactly one branch.',
        );
      }
    }
  }

  return errors;
}

/**
 * Reconciliation plan for the dist-tags a governed topology would maintain.
 *
 * Read-only: this is what the publish guard's `--dry-run` prints. It never
 * applies anything — changing dist-tags on the registry is a REMOTE ACTION.
 *
 * @param {object} input
 * @param {Record<string, object>} input.topology parsed compatibility/versions.json
 * @param {Record<string, string | undefined>} input.branchVersions
 *   current package version per branch (missing entries render as unresolved)
 * @param {{ versions: Record<string, unknown>, distTags: Record<string, string> } | null} input.registry
 * @returns {{
 *   rows: Array<{ branch: string, role: string, publish: string, version: string | null,
 *                 distTag: string, registryTagValue: string | null | undefined,
 *                 status: string, warnings: string[] }>,
 *   reconciliation: string[],
 * }}
 */
export function buildDistTagPlan({ topology, branchVersions, registry }) {
  const rows = Object.entries(topology).map(([branch, entry]) => {
    const version = branchVersions[branch] ?? null;
    const registryTagValue = registry
      ? (registry.distTags?.[entry.distTag] ?? null)
      : undefined;
    const warnings = [];

    let status;
    if (version == null) {
      status = 'unresolved';
      warnings.push(`Could not read the package version of '${branch}'.`);
    } else if (!registry) {
      status = 'registry-unreachable';
    } else if (registry.versions?.[version]) {
      status = registryTagValue === version ? 'current' : 'published-untagged';
      warnings.push(
        `Version ${version} is already published; a publish attempt would fail the collision guard.`,
      );
      if (registryTagValue !== version) {
        warnings.push(
          `${entry.distTag} currently points at ${registryTagValue ?? '<none>'}; ` +
            `a governed ${branch} release would repoint it at ${version}.`,
        );
      }
    } else {
      status = 'publishable';
      warnings.push(
        `${entry.distTag} currently points at ${registryTagValue ?? '<none>'}; ` +
          `publishing ${branch} would move it to ${version}.`,
      );
    }

    return {
      branch,
      role: entry.role,
      publish: entry.publish,
      version,
      distTag: entry.distTag,
      registryTagValue,
      status,
      warnings,
    };
  });

  const reconciliation = [];
  if (registry?.distTags?.latest) {
    const newestPublished = Object.keys(registry.versions ?? {})
      .filter((version) => {
        try {
          parseVersion(version);
          return true;
        } catch {
          return false;
        }
      })
      .sort(compareVersions)
      .at(-1);
    if (
      newestPublished &&
      compareVersions(registry.distTags.latest, newestPublished) < 0
    ) {
      reconciliation.push(
        `Registry latest=${registry.distTags.latest} trails the newest published version ` +
          `${newestPublished}; the latest dist-tag should be reconciled (REMOTE ACTION).`,
      );
    }
  }

  return { rows, reconciliation };
}
