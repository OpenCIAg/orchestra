---
'@ciag/orchestra': minor
---

Extract the p2 data and display families to canonical source directories — pick list, order list, tree, tree select, tree table, organization chart, data view, galleria, meter group, terminal, image compare, code, hover card, and virtual scroller — behind unchanged public entry points, with behavior-parity specs guarding each family. The order-list and tree-select controls now share the library's common forms base, and tier-era compatibility class names (`p-picklist`, `p-orderlist`, `p-tree`, `p-treetable`, `p-treeselect`, `p-metergroup`, `p-component`, `data-pc-name`) are gone from the extracted families' templates; tree select's fluid-width hook moved from `p-treeselect-fluid` to `orc-p2-tree-select--fluid`. Applications overriding those internal classes, or the shared-styles global selectors, on these components should re-check their styles.
