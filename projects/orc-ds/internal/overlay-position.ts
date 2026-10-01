export type OverlayPanelPlacement = 'top' | 'right' | 'bottom' | 'left';
export type OverlayPanelAlign = 'start' | 'center' | 'end';
interface Rectangle {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}
interface Size {
  width: number;
  height: number;
}

/** Resolve viewport geometry independently from DOM attachment and lifecycle. */
export function positionOverlayPanel(
  origin: Rectangle,
  panel: Size,
  viewport: Size,
  requested: OverlayPanelPlacement,
  align: OverlayPanelAlign,
  rtl = false,
  gap = 8,
): { left: number; top: number; placement: OverlayPanelPlacement } {
  const opposite: Record<OverlayPanelPlacement, OverlayPanelPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  const available = {
    top: origin.top,
    bottom: viewport.height - origin.bottom,
    left: origin.left,
    right: viewport.width - origin.right,
  };
  const required =
    requested === 'top' || requested === 'bottom'
      ? panel.height + gap
      : panel.width + gap;
  const placement =
    required > available[requested] &&
    available[opposite[requested]] > available[requested]
      ? opposite[requested]
      : requested;
  const horizontal = placement === 'top' || placement === 'bottom';
  const crossAlignment =
    horizontal && rtl && align !== 'center'
      ? align === 'start'
        ? 'end'
        : 'start'
      : align;
  let left =
    placement === 'left'
      ? origin.left - panel.width - gap
      : placement === 'right'
        ? origin.right + gap
        : origin.left;
  let top =
    placement === 'top'
      ? origin.top - panel.height - gap
      : placement === 'bottom'
        ? origin.bottom + gap
        : origin.top;
  if (horizontal && crossAlignment === 'center')
    left += (origin.width - panel.width) / 2;
  else if (horizontal && crossAlignment === 'end')
    left += origin.width - panel.width;
  else if (!horizontal && crossAlignment === 'center')
    top += (origin.height - panel.height) / 2;
  else if (!horizontal && crossAlignment === 'end')
    top += origin.height - panel.height;
  return {
    left: Math.max(gap, Math.min(left, viewport.width - panel.width - gap)),
    top: Math.max(gap, Math.min(top, viewport.height - panel.height - gap)),
    placement,
  };
}
