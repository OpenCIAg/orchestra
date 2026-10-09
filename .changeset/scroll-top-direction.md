---
'@ciag/orchestra': minor
---

`orc-scroll-top` accepts `direction="down"`: the button shows while content remains below the threshold and jumps to the end of the window or parent. Without a custom `icon`, the button now renders a Material arrow matching the direction (previously the `↑` text glyph); a custom `icon` is still rendered as text. The default accessible name follows the direction (`Scroll to top` / `Scroll to bottom`).
