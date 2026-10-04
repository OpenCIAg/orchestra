const mode = process.argv[2];

console.log(
  `SSR_RESULT ${JSON.stringify({
    status: 'rendered',
    phase: 'render',
    imported: true,
    instantiated: true,
    matchedSelector: true,
    defaultLifecycle: true,
  })}`,
);

if (mode === 'nonzero') {
  process.exitCode = 7;
} else if (mode === 'timeout') {
  setInterval(() => {}, 1_000);
} else {
  throw new Error(`Unknown self-check mode: ${mode}`);
}
