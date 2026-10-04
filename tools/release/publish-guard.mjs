#!/usr/bin/env node
// Publish guard CLI (ticket #6).
//
// Guard mode (CI): decides whether this run may publish and exports the
// verdict + dist-tag for the workflow (ORCHESTRA_PUBLISH / ORCHESTRA_DIST_TAG).
//   exit 0 + ORCHESTRA_PUBLISH=publish  governed release — publish steps may run
//   exit 0 + ORCHESTRA_PUBLISH=skip     nothing to publish (unchanged version,
//                                       ungoverned hand bump, non-owner push)
//   exit 1                              guard failure (collision, tag mismatch,
//                                       registry unreachable, bad topology)
//
// Dry-run mode (--dry-run): prints the verdict for the current checkout, a
// what-if probe (--probe-version X.Y.Z simulates a governed bump), and the
// dist-tag reconciliation plan for every branch. Never publishes and never
// writes outputs; exit code is always 0. Reconciliation itself is a REMOTE
// ACTION on the npm registry.
//
// Registry access is read-only (a single packument GET). No publish, no
// dist-tag write, no git mutation happens here.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  buildDistTagPlan,
  resolveBranchForTag,
  validateTopology,
} from './topology-lib.mjs';
import {
  resolveEventContext,
  resolveReleasePlan,
} from './publish-guard-lib.mjs';

const ROOT = process.cwd();
const PACKAGE_JSON = 'projects/orc-ds/package.json';
const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
const PACKAGE_SPEC = '@ciag%2Forchestra';

function parseArgs(argv) {
  const args = {
    dryRun: false,
    event: null,
    branch: null,
    tag: null,
    registry: DEFAULT_REGISTRY,
    probeVersion: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i + 1];
    switch (argv[i]) {
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--event':
        args.event = value;
        i += 1;
        break;
      case '--branch':
        args.branch = value;
        i += 1;
        break;
      case '--tag':
        args.tag = value;
        i += 1;
        break;
      case '--registry':
        args.registry = value;
        i += 1;
        break;
      case '--probe-version':
        args.probeVersion = value;
        i += 1;
        break;
      default:
        console.error(`Unknown argument '${argv[i]}'.`);
        process.exit(2);
    }
  }
  return args;
}

function readJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Could not parse ${label}: ${error.message}`);
  }
}

function packageJsonAt(ref) {
  try {
    return execFileSync('git', ['show', `${ref}:${PACKAGE_JSON}`], {
      encoding: 'utf8',
    });
  } catch {
    return null;
  }
}

function countPendingChangesets() {
  const dir = path.join(ROOT, '.changeset');
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md') && name !== 'README.md').length;
}

/**
 * Whether the tag-push commit sits on the current release line (ticket #8).
 * On a tag-push checkout HEAD is the tagged commit; the current line is the
 * single branch whose topology role is 'current'. Null when no such branch is
 * declared or none of its refs can be resolved locally — the guard then keeps
 * the previous behavior instead of guessing.
 */
function taggedCommitOnCurrentLine(topology) {
  const currentBranch = Object.entries(topology).find(
    ([, entry]) => entry.role === 'current',
  )?.[0];
  if (!currentBranch) return null;
  let sha;
  try {
    sha = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
  for (const ref of [`origin/${currentBranch}`, currentBranch]) {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', sha, ref]);
      return true;
    } catch (error) {
      // merge-base exits 1 for "not an ancestor"; anything else means the ref
      // itself could not be resolved and the next candidate is tried.
      if (error.status !== 1) continue;
    }
  }
  return false;
}

async function fetchRegistryPackument(registryUrl) {
  try {
    const response = await fetch(`${registryUrl}/${PACKAGE_SPEC}`, {
      headers: { accept: 'application/vnd.npm.install-v1+json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      console.error(
        `publish-guard: registry responded ${response.status}; treating as unreachable.`,
      );
      return null;
    }
    const doc = await response.json();
    return { versions: doc.versions ?? {}, distTags: doc['dist-tags'] ?? {} };
  } catch (error) {
    console.error(
      `publish-guard: registry fetch failed (${error.message}); treating as unreachable.`,
    );
    return null;
  }
}

function writeWorkflowOutputs(plan) {
  const envFile = process.env.GITHUB_ENV;
  if (!envFile || plan.action === 'fail') return;
  const lines = [`ORCHESTRA_PUBLISH=${plan.action}`];
  if (plan.action === 'publish')
    lines.push(`ORCHESTRA_DIST_TAG=${plan.distTag}`);
  fs.appendFileSync(envFile, `${lines.join('\n')}\n`);
}

function printPlan(plan) {
  console.log(`publish-guard: verdict = ${plan.action.toUpperCase()}`);
  console.log(`publish-guard: ${plan.reason}`);
  if (plan.distTag) console.log(`publish-guard: dist-tag = ${plan.distTag}`);
  for (const warning of plan.warnings)
    console.log(`publish-guard: warning: ${warning}`);
  if (process.env.GITHUB_ACTIONS && plan.action === 'fail') {
    console.log(`::error title=Publish guard::${plan.reason}`);
  }
}

function printDistTagPlan(topology, registry) {
  const branchVersions = {};
  for (const branch of Object.keys(topology)) {
    for (const ref of [`github/${branch}`, `origin/${branch}`, branch]) {
      const source = packageJsonAt(ref);
      if (source) {
        branchVersions[branch] = readJson(
          source,
          `${ref}:${PACKAGE_JSON}`,
        ).version;
        break;
      }
    }
  }
  const plan = buildDistTagPlan({ topology, branchVersions, registry });
  console.log(
    'publish-guard: dist-tag reconciliation plan (dry run — nothing is applied):',
  );
  for (const row of plan.rows) {
    const registryValue =
      row.registryTagValue === undefined
        ? '<registry unreachable>'
        : (row.registryTagValue ?? '<unset>');
    console.log(
      `  ${row.branch.padEnd(5)} role=${row.role.padEnd(8)} publish=${row.publish.padEnd(10)} ` +
        `source=${row.version ?? '?'} dist-tag=${row.distTag} registry=${registryValue} → ${row.status}`,
    );
    for (const warning of row.warnings) console.log(`    ! ${warning}`);
  }
  for (const warning of plan.reconciliation) console.log(`  ! ${warning}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const topology = readJson(
    fs.readFileSync(path.join(ROOT, 'compatibility/versions.json'), 'utf8'),
    'compatibility/versions.json',
  );
  const topologyErrors = validateTopology(topology);
  if (topologyErrors.length) {
    console.error(
      'publish-guard: invalid release topology (compatibility/versions.json):',
    );
    for (const error of topologyErrors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const library = readJson(
    fs.readFileSync(path.join(ROOT, PACKAGE_JSON), 'utf8'),
    PACKAGE_JSON,
  );
  const pendingChangesets = countPendingChangesets();
  const registry = await fetchRegistryPackument(args.registry);

  const context = resolveEventContext({
    ref: process.env.GITHUB_REF ?? null,
    eventName: args.event ?? process.env.GITHUB_EVENT_NAME ?? 'push',
    branch:
      args.branch ??
      process.env.RELEASE_BRANCH ??
      execFileSync('git', ['branch', '--show-current'], {
        encoding: 'utf8',
      }).trim(),
    tag: args.tag,
  });

  // The release baseline depends on the event. A governed main push compares
  // against HEAD~1 (the Version-PR shape). A backport tag compares against
  // the registry state of its own line: the tagged commit may follow
  // tooling-only commits that never touch the package version, and the tag
  // itself is the release instruction.
  let previousVersion = null;
  if (!args.probeVersion) {
    if (context.event === 'tag-push') {
      const tagBranch = resolveBranchForTag(topology, context.tagName);
      const lineDistTag = tagBranch
        ? topology[tagBranch]?.distTag ?? null
        : null;
      previousVersion = lineDistTag
        ? registry?.distTags?.[lineDistTag] ?? null
        : null;
    } else {
      const previousPackage = packageJsonAt('HEAD~1');
      previousVersion = previousPackage
        ? readJson(previousPackage, `HEAD~1:${PACKAGE_JSON}`).version
        : null;
    }
  }
  const version = args.probeVersion ?? library.version;

  const plan = resolveReleasePlan({
    event: context.event,
    branch:
      context.event === 'tag-push'
        ? resolveBranchForTag(topology, context.tagName)
        : context.branch,
    tagName: context.tagName,
    version,
    previousVersion: args.probeVersion ? null : previousVersion,
    pendingChangesets,
    registry,
    topology,
    taggedCommitOnCurrentLine:
      context.event === 'tag-push' ? taggedCommitOnCurrentLine(topology) : null,
  });

  if (args.probeVersion) {
    const subject = context.branch ?? `tag ${context.tagName}`;
    console.log(
      `publish-guard: probe — what if ${subject} were governed-bumped ${library.version} -> ${args.probeVersion}?`,
    );
  }
  printPlan(plan);
  printDistTagPlan(topology, registry);

  if (args.dryRun) {
    console.log(
      'publish-guard: dry run complete; no publish, dist-tag, or output file was touched.',
    );
    return;
  }

  writeWorkflowOutputs(plan);
  process.exit(plan.action === 'fail' ? 1 : 0);
}

try {
  await main();
} catch (error) {
  console.error(`publish-guard: ${error.message}`);
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::error title=Publish guard::${error.message}`);
  }
  process.exit(1);
}
