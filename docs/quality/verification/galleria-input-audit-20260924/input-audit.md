# Galleria public-input audit — 2026-09-24

The inventory records **31 public inputs** on `GalleriaComponent`: 27 active bindings (24 signal inputs and three models) and four deprecated compatibility no-ops. The source is `projects/orc-ds/p2/p2-galleria-component.ts`; the implementation was extracted from the shared gallery module, and the old P2 export preserves class identity. The focused DOM suite passes **20/20** in Chrome Headless. The source/template trace and focused cases below classify every public input.

| Public input | Status and observable behavior | Focused evidence |
| --- | --- | --- |
| `images` | Active. Supplies the main image and thumbnail list; shrinking the list clamps `activeIndex`. | Rendered image/thumbnail selection; shrink and empty-list boundary cases. |
| `label` | Active. Names the gallery section; surrounding whitespace is trimmed and blank values are omitted. | Accessible-name contract. |
| `roleDescription` | Active. Sets the section's `aria-roledescription`; surrounding whitespace is trimmed. | Accessible-name contract. |
| `closeLabel` | Active. Names the fullscreen close control and falls back to “Close gallery”; values are trimmed. | Fullscreen close-name contract. |
| `previousLabel` | Active. Names the previous-image control; it no longer changes the independent thumbnail-scroll name. | Custom image and thumbnail control labels. |
| `nextLabel` | Active. Names the next-image control; it no longer changes the independent thumbnail-scroll name. | Default and custom navigation-label contracts. |
| `thumbnailLabel` | Active. Names the thumbnail list and prefixes each thumbnail action name; values are trimmed. | Thumbnail list and item-name contract. |
| `activeIndex` | Active model. Selection updates the model; invalid and out-of-range writes normalize to a valid image index. | Click, keyboard, shrink, fractional and non-finite index cases. |
| `fullScreen` | Active model. Applies fixed fullscreen dialog presentation, mask, close action, z-index offset, initial focus, Tab containment, Escape dismissal, and focus restoration. | Fullscreen keyboard and stacking contracts; Playwright checks the user-facing docs example in Chromium, Firefox, and WebKit. |
| `visible` | Active model. Hides gallery content, updates `aria-hidden`/tabindex, controls autoplay, and is restored by `show()`. | Hide/show and autoplay lifecycle cases. |
| `showItemNavigators` | Active. Shows or removes previous/next image actions. | Optional-controls contract. |
| `showThumbnailNavigators` | Active. Shows or removes thumbnail-scroll actions. | Optional-controls contract. |
| `showItemNavigatorsOnHover` | Active. Hides item actions until the pointer enters the gallery. | Hover enter/leave contract. |
| `changeItemOnIndicatorHover` | Active. Hovering a thumbnail or indicator changes the selected image when enabled. | Indicator-hover selection contract. |
| `shouldStopAutoplayByClick` | Active. A user click on image selection or item navigation stops autoplay when enabled; timed advances and hover selection do not. | Fake-timer autoplay/click regression. |
| `circular` | Active. Previous/next and keyboard movement wrap at either end when enabled; otherwise they stop at boundaries. | Circular keyboard and disabled-boundary contracts. |
| `autoPlay` | Active. Starts repeated advances only while visible and with a valid positive interval. | Fake-timer autoplay contract. |
| `transitionInterval` | Active. Supplies the autoplay interval; non-finite and non-positive values do not create a timer. | Fake-timer invalid-interval contract. |
| `showThumbnails` | Active. Removes the thumbnail track when false. | Optional-controls contract. |
| `thumbnailsPosition` | Active. Supports top/bottom placement and distinct side columns for left/right; side thumbnails stack and scroll vertically. | Four-position and non-overlapping side-layout contracts. |
| `showIndicators` | Active. Removes indicator tabs when false. | Optional-controls contract. |
| `showIndicatorsOnItem` | Active. Places the indicator tablist over the main image instead of in the controls row. | Indicator placement contract. |
| `indicatorsPosition` | Active. Applies bottom/top/left/right placement classes. | Four-position class contract; left geometry assertion. |
| `baseZIndex` | Active. Adds 1000 to the fullscreen root z-index while visible. | High-base stacking contract. |
| `maskClass` | Active. Adds consumer styling to the fullscreen mask. | Consumer class/style contract. |
| `containerClass` | Active. Adds consumer styling while retaining the component class. | Consumer class/style contract. |
| `containerStyle` | Active. Applies consumer inline styles to the section. | Consumer class/style contract. |
| `numVisible` | Deprecated no-op. The gallery does not virtualize the thumbnail list. | Deprecated in source JSDoc; retained for compatibility. |
| `responsiveOptions` | Deprecated no-op. Responsive thumbnail breakpoints are not implemented. | Deprecated in source JSDoc; retained for compatibility. |
| `showTransitionOptions` | Deprecated no-op. Transitions are CSS-only and this value is not consumed. | Deprecated in source JSDoc; retained for compatibility. |
| `hideTransitionOptions` | Deprecated no-op. Transitions are CSS-only and this value is not consumed. | Deprecated in source JSDoc; retained for compatibility. |

## Repairs found during the audit

- Left/right thumbnail layouts assigned the main image and thumbnail track to the same grid cell. The image and side track now use separate columns, side thumbnails stack vertically, and the scroll action uses vertical offsets and arrows.
- `shouldStopAutoplayByClick` was checked inside `goTo()`, so an automatic timer advance stopped its own slideshow. Click-specific handlers now own that option; timed and hover changes leave autoplay running.
- The thumbnail-scroll buttons reused `previousLabel` and `nextLabel`, which could misname scrolling as image navigation. They now have independent “Previous thumbnails” and “Next thumbnails” names.
- Whitespace-only gallery/control labels now resolve to useful defaults or omit the optional section name. Non-finite or non-positive autoplay intervals are ignored.

The four no-op inputs remain compatibility-only and are explicitly deprecated. Fullscreen focus entry, containment, Escape dismissal, and restoration now have DOM and cross-browser regression coverage. Responsive side-thumbnail sizing, narrow viewport layouts, reduced-motion behavior for slideshow changes, and physical assistive-technology review remain open.
