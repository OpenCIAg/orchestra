# PickList narrow-screen browser QA

Live documentation page: `/components/pick-list`, Chrome 153, explicit viewport 320 × 800.

- The document stayed within the viewport (`scrollWidth` 314 CSS px, `innerWidth` 320). The PickList shell provided the intended internal horizontal scroll area (`scrollWidth` 568, `clientWidth` 280).
- ArrowDown moved through enabled options and skipped the disabled “Experimental” option; Home and End reached the first and last enabled options. Space selected the focused option.
- Tab from a selected source option reached the transfer action. Enter moved the selected item and focus landed on it in the destination list after rendering. The shell scrolled horizontally to expose the focused action (`scrollLeft` 288); the page itself did not gain horizontal overflow.
- Pointer activation of the same action also restored focus to the moved destination option. This verifies recovery when the action becomes disabled after the selection is cleared.
- The page emitted no console errors or warnings during the replay. The viewport override was reset after testing.

The behavior has a focused regression in `projects/orc-ds/p2/pick-list-behavior.spec.ts`; the recorded ChromeHeadless run passes 1/1.
