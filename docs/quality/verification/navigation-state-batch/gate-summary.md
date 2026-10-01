# Tabs and Stepper navigation-state gate

Date: 2026-09-13

- Focused browser/runtime suite: 26/26 passed in ChromeHeadlessCI.
- Relevant P1/P2/runtime suite: 153/153 passed in ChromeHeadlessCI.
- Command environment: Node 24.16.0 PATH, `NG_BUILD_MAX_WORKERS=2`, `ORC_KARMA_PORT=9878`.
- Scope: `projects/orc-ds/tabs/*`, `projects/orc-ds/stepper/*`, their focused DOM specs, and runtime diagnostics.

The focused run exercises controlled alias writes and precedence, roving keyboard focus in manual and select-on-focus modes, disabled and all-disabled navigation, RTL arrow direction and real negative scroll progress/end/return, native close controls, close identity/focus recovery and cancellation, lazy/cache projection behavior, full-width layout, and bounded overflow navigation. It also verifies dynamic tab-item observer release and teardown, plus Stepper recovery from empty data and readonly transitions. Runtime diagnostics completed without a reported failure. These checks do not cover hydration, caller-projected node creation timing beyond the existing template contract, or full responsive visual combinations.
