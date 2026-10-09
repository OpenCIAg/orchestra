---
'@ciag/orchestra': patch
---

`orc-editor` toolbar buttons now reflect the formatting at the caret: an applied command (for example bold) gets the `active` class and `aria-pressed="true"`, updated on input, selection change, blur and after each command. The `actions` default stays empty.
