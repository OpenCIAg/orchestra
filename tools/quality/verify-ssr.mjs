import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(".");
const distribution = path.join(root, "dist/orc-ds");
const inventoryPath = path.join(root, "docs/quality/inventory.json");
// Evidence is written outside the tracked tree; CI uploads it as a workflow
// artifact instead of committing it (ORC_SSR_OUTPUT_DIR can override).
const outputDir =
  process.env.ORC_SSR_OUTPUT_DIR ?? path.join(root, "verify-output");
const helperPath = path.join(root, "tools/quality/ssr-render-one.mjs");
const selfCheckHelperPath = path.join(
  root,
  "tools/quality/ssr-worker-self-check.mjs",
);

if (!existsSync(helperPath))
  throw new Error(`Missing SSR helper: ${helperPath}`);

function parseResult(output) {
  const line = output
    .trim()
    .split("\n")
    .reverse()
    .find((candidate) => candidate.startsWith("SSR_RESULT "));
  return line ? JSON.parse(line.slice("SSR_RESULT ".length)) : null;
}

function readProgress(progressPath) {
  if (!existsSync(progressPath)) return [];
  return readFileSync(progressPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { phase: "invalid-progress", error: line };
      }
    });
}

function observedState(progress) {
  const last = progress.at(-1);
  return {
    imported: progress.some((entry) => entry.imported === true) ? true : null,
    instantiated: progress.some((entry) => entry.instantiated === true)
      ? true
      : null,
    matchedSelector: progress.some((entry) => entry.matchedSelector === true)
      ? true
      : null,
    defaultLifecycle: progress.some((entry) => entry.defaultLifecycle === true),
    lastObservedPhase: last?.phase ?? null,
  };
}

function classifyCrash(error, progress) {
  const observed = observedState(progress);
  if (error?.code === "ETIMEDOUT") {
    return {
      status: "failed",
      phase: "timeout",
      ...observed,
      error: `SSR worker exceeded the 5000 ms per-component timeout at phase ${observed.lastObservedPhase ?? "unknown"}.`,
    };
  }
  const text = `${error?.stderr ?? ""}\n${error?.stdout ?? ""}`;
  const lifecycle = /ngOnDestroy|removeEventListener/.test(text);
  return {
    status: "failed",
    phase: lifecycle ? "lifecycle" : "render",
    ...observed,
    error: text.trim() || String(error?.message || error),
  };
}

function workerOutcome(error, output, progress) {
  const reported = parseResult(output);
  if (!error) {
    return reported
      ? { ...reported, abnormalExit: false }
      : {
          ...classifyCrash({ stdout: output }, progress),
          abnormalExit: true,
        };
  }

  const crash = classifyCrash(error, progress);
  // A fixture/import failure is already the most specific phase available. Keep
  // its evidence, but always retain the abnormal worker status. A reported
  // success is evidence only: a timeout or non-zero exit still fails.
  if (reported?.status === "failed") {
    return {
      ...reported,
      status: "failed",
      abnormalExit: true,
      workerError: crash.error,
    };
  }
  return {
    ...crash,
    abnormalExit: true,
    reportedStatus: reported?.status ?? null,
    ...(reported ? { reportedResult: reported } : {}),
  };
}

function runWorker(command, args, options = {}) {
  let output = "";
  let error = null;
  try {
    output = execFileSync(command, args, {
      cwd: options.cwd,
      encoding: "utf8",
      env: options.env,
      maxBuffer: 16 * 1024 * 1024,
      timeout: options.timeout,
    });
  } catch (caught) {
    error = caught;
    output = `${caught?.stdout ?? ""}\n${caught?.stderr ?? ""}`;
  }
  const progress = options.progressPath
    ? readProgress(options.progressPath)
    : [];
  return {
    ...workerOutcome(error, output, progress),
    observedProgress: progress,
  };
}

if (process.argv.includes("--self-check")) {
  if (!existsSync(selfCheckHelperPath))
    throw new Error(`Missing SSR self-check helper: ${selfCheckHelperPath}`);
  const leak = runWorker(process.execPath, [selfCheckHelperPath, "timeout"], {
    cwd: root,
    env: process.env,
    timeout: 250,
  });
  const nonZero = runWorker(
    process.execPath,
    [selfCheckHelperPath, "nonzero"],
    { cwd: root, env: process.env, timeout: 250 },
  );
  if (leak.status === "rendered" || nonZero.status === "rendered") {
    throw new Error(
      "SSR abnormal-exit self-check incorrectly accepted success.",
    );
  }
  console.log(
    `SSR self-check OK: timeout=${leak.phase}, nonzero=${nonZero.phase}.`,
  );
  process.exit(0);
}

if (!existsSync(path.join(distribution, "package.json"))) {
  throw new Error(
    "Missing dist/orc-ds; SSR verification requires a sealed library distribution.",
  );
}

const manifest = JSON.parse(
  readFileSync(path.join(distribution, "package.json"), "utf8"),
);
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const components = inventory.declarations
  .filter((declaration) => declaration.kind === "Component")
  .map((declaration) => ({
    name: declaration.name,
    selector: declaration.selector.split(",")[0].trim(),
    file: declaration.file,
    entry: declaration.file.replace(/^projects\/orc-ds\//, "").split("/")[0],
    required: declaration.inputs
      .filter((input) => input.required)
      .map((input) => input.publicName ?? input.name),
  }));

function installedAngularVersion() {
  const installedPath = path.join(
    root,
    "node_modules/@angular/core/package.json",
  );
  if (existsSync(installedPath)) {
    return JSON.parse(readFileSync(installedPath, "utf8")).version;
  }
  const lockPath = path.join(root, "package-lock.json");
  if (existsSync(lockPath)) {
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    const version = lock.packages?.["node_modules/@angular/core"]?.version;
    if (version) return version;
  }
  throw new Error(
    "Unable to determine Angular version; set ORC_SSR_ANGULAR_VERSION explicitly.",
  );
}

const angularVersion =
  process.env.ORC_SSR_ANGULAR_VERSION ?? installedAngularVersion();
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const work = mkdtempSync(path.join(tmpdir(), "orchestra-ssr-"));
let passed = false;

try {
  const packed = JSON.parse(
    execFileSync(
      npm,
      [
        "pack",
        distribution,
        "--ignore-scripts",
        "--pack-destination",
        work,
        "--json",
      ],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
    ),
  );
  const archive = path.join(work, packed[0].filename);
  const archiveSha256 = createHash("sha256")
    .update(readFileSync(archive))
    .digest("hex");
  const consumer = path.join(work, "consumer");
  mkdirSync(consumer);
  const angularPackages = [
    "@angular/common",
    "@angular/compiler",
    "@angular/core",
    "@angular/forms",
    "@angular/platform-browser",
    "@angular/platform-server",
    "@angular/router",
  ];
  const dependencies = Object.fromEntries(
    angularPackages.map((name) => [name, angularVersion]),
  );
  dependencies[manifest.name] = `file:${archive}`;
  dependencies.rxjs = "^7.8.0";
  dependencies.tslib = "^2.3.0";
  dependencies.dompurify = "^3.4.15";
  writeFileSync(
    path.join(consumer, "package.json"),
    JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies,
      },
      null,
      2,
    ),
  );
  execFileSync(
    npm,
    ["install", "--ignore-scripts", "--no-fund", "--no-audit"],
    {
      cwd: consumer,
      stdio: "inherit",
    },
  );
  copyFileSync(helperPath, path.join(consumer, "render-one.mjs"));

  const results = [];
  for (const [index, component] of components.entries()) {
    const encoded = Buffer.from(JSON.stringify(component)).toString(
      "base64url",
    );
    const progressPath = path.join(consumer, `progress-${index}.jsonl`);
    writeFileSync(progressPath, "");
    results.push({
      ...component,
      ...runWorker(process.execPath, ["render-one.mjs", encoded], {
        cwd: consumer,
        env: {
          ...process.env,
          ORC_SSR_PACKAGE: manifest.name,
          ORC_SSR_PROGRESS: progressPath,
        },
        progressPath,
        timeout: 5000,
      }),
    });
    rmSync(progressPath, { force: true });
  }

  const failures = results.filter((result) => result.status !== "rendered");
  const diagnostics = results.flatMap((result) =>
    (result.diagnostics ?? []).map((diagnostic) => ({
      ...diagnostic,
      name: result.name,
      file: result.file,
    })),
  );
  const rendered = results.filter((result) => result.status === "rendered");
  const imported = results.filter((result) => result.imported === true);
  const lifecycleExceptions = failures.filter(
    (result) => result.phase === "lifecycle",
  );
  const timeouts = failures.filter((result) => result.phase === "timeout");
  const instantiated = results.filter((result) => result.instantiated === true);
  const matchedSelectors = results.filter(
    (result) => result.matchedSelector === true,
  );
  const defaultLifecycle = results.filter(
    (result) => result.defaultLifecycle === true,
  );
  const result = {
    packageName: manifest.name,
    packageVersion: manifest.version,
    packageArchiveSha256: archiveSha256,
    fixtureValues: ["ariaLabel", "item", "fileData", "toast"],
    angularVersion,
    distribution: "dist/orc-ds (sealed; no build performed by this verifier)",
    distributionMtime: statSync(
      path.join(distribution, "package.json"),
    ).mtime.toISOString(),
    totalComponents: components.length,
    imported: imported.length,
    rendered: rendered.length,
    instantiated: instantiated.length,
    matchedSelectors: matchedSelectors.length,
    defaultLifecycle: defaultLifecycle.length,
    interactiveStateCoverage: 0,
    failures,
    lifecycleExceptions,
    timeouts,
    diagnostics,
    coverage: {
      inventoryComponents: components.length,
      attempted: results.length,
      imported: imported.length,
      rendered: rendered.length,
      instantiated: instantiated.length,
      matchedSelectors: matchedSelectors.length,
      defaultLifecycle: defaultLifecycle.length,
      interactiveStateCoverage: 0,
      failed: failures.length,
    },
    exclusions: [
      "Directives, pipes, services, and providers are excluded because the inventory fixture contract covers declarations of kind Component only.",
      "Components requiring application-specific providers, browser globals, or richer model state are attempted with the shared minimal server providers and reported individually when they fail.",
    ],
    components: results,
  };
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    path.join(outputDir, "verify-ssr-result.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  const report = [
    "# SSR verification",
    "",
    `Generated ${new Date().toISOString()} against ${result.distribution}. Package archive SHA-256: \`${result.packageArchiveSha256}\`.`,
    "",
    `The harness attempted all ${result.totalComponents} component declarations from [inventory.json](../docs/quality/inventory.json), importing each from the packed consumer and rendering it through Angular ${angularVersion}'s \`renderApplication\`. It imported ${result.imported}, instantiated ${result.instantiated}, matched ${result.matchedSelectors} canonical selectors, completed default lifecycle teardown for ${result.defaultLifecycle}, and completed rendering for ${result.rendered}; ${failures.length} failed.`,
    "",
    "The runner isolates every component in a fresh Node process. Each worker uses Angular ViewChild against the imported component type and checks the canonical selector before renderApplication returns, so the marker cannot be produced by a static wrapper alone. This preserves a real server-render lifecycle and records teardown exceptions separately from import/render failures. Production mode suppresses framework startup noise; component warnings and errors remain in the JSON result.",
    "",
    "## Failures",
    "",
    failures.length
      ? failures
          .map((failure) => {
            const source = failure.file
              ? ` Source file in the inventory: [${failure.file}](../${failure.file}).`
              : "";
            return `- **${failure.name}** (${failure.phase}) — ${String(failure.error).split("\n")[0]}.${source}`;
          })
          .join("\n")
      : "None.",
    "",
    lifecycleExceptions.length
      ? "Minimal lifecycle reproducer: for each lifecycle failure, the packed consumer renders the reported canonical selector through `renderApplication`; the worker confirms instance creation and selector matching before teardown. The full exception and component source path are retained in `verify-ssr-result.json` for the owning repair."
      : "",
    "",
    `Lifecycle exceptions: ${lifecycleExceptions.length}. Worker timeouts: ${timeouts.length}. Diagnostics: ${diagnostics.length}. Full per-component evidence is in [verify-ssr-result.json](verify-ssr-result.json).`,
    "",
    `Interactive/open-state coverage: ${result.interactiveStateCoverage}. Fixture values are explicitly enumerated as ${result.fixtureValues.join(", ")}; any new required input fails with phase \`fixture\` instead of being bound to \`undefined\`. The inventory-driven pass excludes non-component declarations and does not claim browser interaction, hydration, or application-specific provider coverage. Check the sealed distribution timestamp against the source revision before treating this as current.`,
    "",
  ].join("\n");
  writeFileSync(path.join(outputDir, "verify-ssr-report.md"), report);
  if (failures.length || diagnostics.length) {
    throw new Error(
      `SSR verification found ${failures.length} failures and ${diagnostics.length} diagnostics. See ${path.relative(root, path.join(outputDir, "verify-ssr-result.json"))}.`,
    );
  }
  console.log(
    `SSR OK: rendered ${result.rendered}/${result.totalComponents} inventory components with Angular ${result.angularVersion}.`,
  );
  passed = true;
} finally {
  if (passed) rmSync(work, { recursive: true, force: true });
  else console.error(`SSR verification fixture retained at ${work}`);
}
