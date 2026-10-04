---
'@ciag/orchestra': minor
---

Extract the overlay and menu families to canonical source directories — context menu, speed dial, split button, dock, confirm popup, tiered menu, panel menu, mega menu, and menubar — behind unchanged public entry points, with behavior-parity specs guarding each family. Tier-era compatibility class names and shared-styles global selectors are gone from the extracted families' templates; applications overriding internal `.orc-*` classes on those components should re-check their styles (the public class contracts are unchanged).
