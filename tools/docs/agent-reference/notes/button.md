Use `orc-button` for a labeled action or navigation trigger. Use `orc-icon-button` only when the action is genuinely icon-only and provide its accessible label through the icon button API or surrounding context.

Variations: primary for the main task, secondary for lower-emphasis actions, outline for bordered alternatives, ghost for quiet toolbars, link for inline navigation, danger for destructive tasks; sm/md/lg; loading preserves layout and blocks interaction; icon-left/right and icon-only.

Content: button label is projected between tags. SVG strings may be passed to `iconLeft`/`iconRight`; the component sanitizes them for rendering.

```html
<orc-button variant="primary" [loading]="saving" (click)="save()">Save</orc-button> <orc-icon-button icon="search" ariaLabel="Search" variant="ghost" />
```
