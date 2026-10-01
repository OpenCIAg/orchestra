# Command menu, dock, and scroll panel contract batch

Focused browser coverage passed in ChromeHeadlessCI with Node 24.16.0, `NG_BUILD_MAX_WORKERS=2`, and Karma port 9883.

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9883 npm run test:lib:ci -- --include=projects/orc-ds/command-dock-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts
```

Result: **5/5 specs passed**, including the runtime diagnostics import. Full output is in [focused-tests.log](focused-tests.log).

The command menu now keeps its active option valid across filtering and item updates, skips disabled options for keyboard navigation, supports Home/End, exposes a labelled combobox/listbox relationship with unique option IDs, and handles duplicate labels safely. Empty icon slots no longer add spacing. The dock now implements a roving toolbar tab stop with arrow/Home/End navigation, skips disabled actions, hides decorative glyphs from assistive technology, and stays within the viewport on narrow screens. The scroll panel only consumes navigation keys when the panel itself is focused and content actually overflows; it leaves projected controls and modified shortcuts alone, and rejects invalid scroll positions/steps.

Residual scope: the command menu contract has no open/close or dismissal API, so this batch leaves dialog lifecycle and focus restoration to its host. Dock keyboard direction has not been visually reviewed in RTL or across browsers. `ScrollPanelComponent.refresh()` remains a compatibility method that dispatches a synthetic `scroll` event; this native-overflow implementation has no cached custom scrollbar state to recalculate. Visual and assistive-technology testing beyond the automated Chrome run remains open.
