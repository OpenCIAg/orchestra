import { isTopOverlay, registerOverlay } from './overlay-lifecycle';

describe('Overlay parent ownership', () => {
  let root: HTMLDivElement;
  let cleanup: (() => void)[];
  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    cleanup = [];
  });
  afterEach(() => {
    cleanup.reverse().forEach((release) => release());
    root.remove();
  });

  function element(parent: HTMLElement = root): HTMLDivElement {
    const node = document.createElement('div');
    parent.append(node);
    return node;
  }

  it('closes only logical descendants from deepest to shallowest, even when panels are detached', () => {
    const parent = element(),
      anchor = element(parent),
      child = element(),
      grandchildAnchor = element(child),
      grandchild = element(),
      unrelated = element();
    const order: string[] = [];
    const releaseParent = registerOverlay(parent);
    cleanup.push(releaseParent);
    const releaseChild = registerOverlay(child, {
      anchor,
      onParentClose: () => {
        order.push('child');
        releaseChild();
      },
    });
    cleanup.push(releaseChild);
    const releaseGrandchild = registerOverlay(grandchild, {
      anchor: grandchildAnchor,
      onParentClose: () => {
        order.push('grandchild');
        releaseGrandchild();
      },
    });
    cleanup.push(releaseGrandchild);
    const unrelatedClosed = jasmine.createSpy();
    cleanup.push(
      registerOverlay(unrelated, { onParentClose: unrelatedClosed }),
    );
    releaseParent();
    releaseParent();
    expect(order).toEqual(['grandchild', 'child']);
    expect(unrelatedClosed).not.toHaveBeenCalled();
    expect(isTopOverlay(unrelated)).toBeTrue();
  });

  it('does not close its parent or call a disposed child twice', () => {
    const parent = element(),
      child = element(parent);
    const parentClosed = jasmine.createSpy(),
      childClosed = jasmine.createSpy();
    const releaseParent = registerOverlay(parent, {
      onParentClose: parentClosed,
    });
    cleanup.push(releaseParent);
    const releaseChild = registerOverlay(child, { onParentClose: childClosed });
    cleanup.push(releaseChild);
    releaseChild();
    expect(isTopOverlay(parent)).toBeTrue();
    releaseParent();
    expect(parentClosed).not.toHaveBeenCalled();
    expect(childClosed).not.toHaveBeenCalled();
  });

  it('finds ownership across closed shadow roots without allowing descriptive layers to own popups', () => {
    const parent = element(),
      shadowHost = element(parent),
      child = element(),
      tooltip = element(),
      second = element();
    const anchor = document.createElement('button');
    shadowHost.attachShadow({ mode: 'closed' }).append(anchor);
    const releaseParent = registerOverlay(parent);
    cleanup.push(releaseParent);
    const childClosed = jasmine.createSpy(),
      tooltipClosed = jasmine.createSpy(),
      secondClosed = jasmine.createSpy();
    cleanup.push(
      registerOverlay(child, { anchor, onParentClose: childClosed }),
    );
    cleanup.push(
      registerOverlay(tooltip, {
        anchor,
        interactive: false,
        onParentClose: tooltipClosed,
      }),
    );
    cleanup.push(
      registerOverlay(second, {
        anchor: element(tooltip),
        onParentClose: secondClosed,
      }),
    );
    releaseParent();
    expect(childClosed).toHaveBeenCalledTimes(1);
    expect(tooltipClosed).toHaveBeenCalledTimes(1);
    expect(secondClosed).not.toHaveBeenCalled();
  });
});
