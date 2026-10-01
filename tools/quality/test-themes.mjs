import { spawn } from "node:child_process";

// Separate runs make the requested browser preference an assertion, so ignored
// launcher flags cannot silently turn this matrix into two identical runs.
for (const scheme of ["light", "dark"]) {
  const browser =
    scheme === "light" ? "ChromeHeadlessLightCI" : "ChromeHeadlessDarkCI";
  const child = spawn(
    process.execPath,
    [
      "node_modules/@angular/cli/bin/ng.js",
      "test",
      "orc-ds",
      "--watch=false",
      `--browsers=${browser}`,
      "--include=projects/orc-ds/styles/theme-contract.spec.ts",
      "--include=projects/orc-ds/runtime-diagnostics.spec.ts",
    ],
    {
      stdio: "inherit",
      env: { ...process.env, ORC_TEST_COLOR_SCHEME: scheme },
    },
  );
  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
  if (code) process.exit(code);
}
