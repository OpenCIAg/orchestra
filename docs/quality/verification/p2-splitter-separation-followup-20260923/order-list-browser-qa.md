# OrderList narrow-screen browser QA

Live documentation page: `/components/order-list`, Chrome 153, explicit viewport 320 × 800.

- The document stayed within the viewport (`scrollWidth` 314 CSS px, `innerWidth` 320). The OrderList shell used its internal horizontal scroll area (`scrollWidth` 376, `clientWidth` 280).
- ArrowDown moved focus from Calendar to Data Table, then skipped the disabled Experimental option to Tree View. Home and End moved focus to the first and last enabled options; Enter selected the focused item.
- Reordering Calendar down moved it after Data Table and preserved its selected state. The internal shell scrolled to expose the controls; the page itself did not gain horizontal overflow.
- The disabled row exposed `aria-disabled="true"` and `tabindex="-1"`. With the whole widget disabled, every option was disabled and removed from tab order, both reorder buttons were disabled, and the prior selection remained unchanged.
- The page emitted no console errors or warnings. The viewport override was reset after testing.

The direct OrderList contract suite, including the numeric-zero value regression, passes 8/8 in ChromeHeadless.
