/** Accept direct DOM targets from other same-origin documents, such as iframes. */
export function isElementTarget(target: unknown): target is HTMLElement {
  return (
    typeof target === 'object' &&
    target !== null &&
    'nodeType' in target &&
    target.nodeType === 1
  );
}
