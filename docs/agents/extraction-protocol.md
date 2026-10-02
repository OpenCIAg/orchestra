# Family extraction protocol (tier dissolution)

The repeatable procedure for moving a p2 component family into its own
canonical directory without changing any import path or behavior. Follow it
step by step for every family-extraction ticket (#10 menu/overlay, #11, #12).
One family per ticket; do not mix families.

`docs/quality/library-scope-decisions.md` is the decision authority for what
stays and what moves; respect the documented deliberate divergences recorded
there (Dropdown flat, RadioButton no individual CVA, listbox no interactive
descendants, Menubar one level, Select lazy single-range, BlockUi inline
target, Collapsible lazy/lazyContent).

## Step 0 — record the baseline

Run on the branch before touching anything:

```bash
npm run build:lib
ls -l dist/orc-ds/fesm2022/   # note the family's chunk(s)
gzip -c dist/orc-ds/fesm2022/<chunk>.mjs | wc -c   # gzip size
```

Record raw and gzip bytes for every affected chunk (the p2 monolith chunk
plus any secondary entry chunk the family feeds). Prior extraction deltas are
recorded in `docs/quality/library-scope-decisions.md` (SpeedDial: 1 raw /
138 gzip; Tree/TreeTable: 0 raw / −269 gzip) — keep that convention.

## Step 1 — behavior-parity specs first

Before moving code, pin each moved component's behavior with focused specs
that only use public surface: template bindings, dispatched DOM events,
outputs, and the forms API. Cover at minimum:

- rendering of visible/enabled/disabled/hidden items,
- keyboard roving (arrows, Home/End, wrap-around) against real DOM focus,
- outside dismissal through dispatched pointer events (inside stays open,
  outside closes; include owner-document cases when the family supports
  cross-document targets),
- CVA registration/writeValue/touched propagation for value-holding controls,
- dual-name compatibility outputs (PrimeNG alias names) the family declares.

Run the specs against the p2 source and commit them green. These specs move
with the family in Step 2 and must pass unchanged after the move — that is
the parity definition. `menu-family-dismissal-keyboard.spec.ts` and
`p2-menu-contract.spec.ts` are the pattern to copy.

## Step 2 — move the family to a canonical directory

- Create `projects/orc-ds/<kebab>/` following the `select/` layout: one file
  per component plus `index.ts` and `ng-package.json`.
- Move classes verbatim in the first cut; behavior-affecting cleanup (dropping
  tier compatibility classes from templates, removing shared-styles global
  selectors) is a separate commit after the move is proven.
- The tier entry point keeps every symbol: `p2/index.ts` and the family's
  p2 barrel re-export from the new canonical location. Secondary entry
  paths and alias directories are never removed.
- Moved controls use the shared internal helpers (`@ciag/orchestra/internal`):
  `CvaControl` for ControlValueAccessor registration/disabled state,
  `listenForOutsideInteraction` for dismissal, and the menu-keyboard helpers
  for roving focus — do not carry private copies across the move.

## Step 3 — identity and resolvability sweep

```bash
npm run generate:alias-parity   # regenerate, then commit the spec
npm run verify:alias-parity     # must pass (also runs in CI)
```

The generated sweep imports every value export of every alias entry point and
asserts it is the same class reference as the declaration reached through the
re-export chain, and it fails generation on any dangling export. A move that
breaks an import path fails here, not in a consumer.

## Step 4 — consumer and gate checks

```bash
npm run verify:package        # isolated tarball consumer: types + Sass
node tools/quality/inventory.mjs && git add docs/quality   # refresh inventory
npm run verify:docs
npm run test:lib:ci
npm run build:lib
npm run format:check
npm run test:themes:ci        # whenever styles moved
RELEASE_BRANCH=main npm run verify:compatibility   # wt/* names are rejected
```

## Step 5 — record the chunk-size comparison

Rebuild and re-measure exactly as in Step 0, then append the before/after
raw+gzip table to the ticket and to the family's row in
`docs/quality/library-scope-decisions.md`. A passing build is not a
performance result; small raw/gzip deltas (either direction) are the expected
outcome because code moves, it does not get rewritten.

## Commit shape

Conventional commits, one logical batch per commit, each one green:

1. `test(<family>): add behavior-parity specs` (Step 1),
2. `refactor(<family>): extract to canonical directory` — the move, tier
   re-export preservation, and the regenerated alias-parity spec (Steps 2–3),
3. `refactor(<family>)|chore(<family>): ...` for template/style cleanup
   (dropping tier classes, shared-styles leakage), if the ticket asks for it.
