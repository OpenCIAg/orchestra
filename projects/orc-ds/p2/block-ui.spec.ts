import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BlockUiComponent as P2BlockUiComponent } from '@ciag/orchestra/p2';
import { BlockUiComponent as SecondaryBlockUiComponent } from '@ciag/orchestra/block-ui';
import { BlockUiComponent as FocusedBlockUiComponent } from './p2-block-ui-component';
import { BlockUiComponent, type BlockUiTarget } from './p2-advanced-components';

@Component({
  standalone: true,
  imports: [BlockUiComponent],
  template: `
    <main>
      <orc-block-ui
        [blocked]="blocked()"
        [target]="target()"
        message="Please wait"
      >
        <div class="projected-area">
          <button id="projected-action" type="button" (click)="activate()">
            Projected action</button
          ><span>Projected content</span>
        </div>
      </orc-block-ui>
      <button id="outside-action" type="button">Outside action</button>
    </main>
  `,
})
class BlockUiTestHost {
  blocked = signal(false);
  target = signal<BlockUiTarget>(null);
  activations = 0;
  activate(): void {
    this.activations++;
  }
}

describe('BlockUiComponent', () => {
  it('preserves class identity through focused, compatibility, P2, and secondary imports', () => {
    expect(BlockUiComponent).toBe(FocusedBlockUiComponent);
    expect(BlockUiComponent).toBe(P2BlockUiComponent);
    expect(BlockUiComponent).toBe(SecondaryBlockUiComponent);
  });

  it('confines the scrim to the projected area without shifting its layout or announcing an alert', () => {
    const fixture = TestBed.createComponent(BlockUiTestHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      'orc-block-ui',
    ) as HTMLElement;
    const action = host.querySelector('#projected-action') as HTMLButtonElement;
    const outside = fixture.nativeElement.querySelector(
      '#outside-action',
    ) as HTMLButtonElement;
    action.scrollIntoView({ block: 'center' });
    const before = action.getBoundingClientRect();

    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();

    const content = host.querySelector('.orc-block-ui-content') as HTMLElement;
    const overlay = host.querySelector('.orc-block-ui') as HTMLElement;
    const after = action.getBoundingClientRect();
    expect(host.getAttribute('aria-busy')).toBe('true');
    expect(content.hasAttribute('inert')).toBeTrue();
    expect(getComputedStyle(host).position).toBe('relative');
    expect(getComputedStyle(overlay).position).toBe('absolute');
    expect(overlay.parentElement).toBe(host);
    expect([after.x, after.y, after.width, after.height]).toEqual([
      before.x,
      before.y,
      before.width,
      before.height,
    ]);
    expect(overlay.getAttribute('role')).toBeNull();
    expect(overlay.getAttribute('aria-live')).toBeNull();
    expect(overlay.textContent).toContain('Please wait');

    const centerX = before.left + before.width / 2;
    const centerY = before.top + before.height / 2;
    const hit = document.elementFromPoint(centerX, centerY);
    expect(hit === overlay || overlay.contains(hit)).toBeTrue();
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.activations).toBe(0);
    expect(outside.disabled).toBeFalse();
    expect(outside.closest('[inert]')).toBeNull();

    action.focus();
    expect(document.activeElement).not.toBe(action);
    fixture.destroy();
  });

  it('blocks a dynamic target and restores its prior semantics when retargeted or unblocked', async () => {
    const firstTarget = document.createElement('section');
    firstTarget.style.cssText =
      'position:fixed;left:24px;top:32px;width:180px;height:90px';
    firstTarget.setAttribute('aria-busy', 'false');
    const firstAction = document.createElement('button');
    let firstActivations = 0;
    firstAction.addEventListener('click', () => firstActivations++);
    firstTarget.append(firstAction);
    const secondTarget = document.createElement('section');
    secondTarget.style.cssText =
      'position:fixed;left:80px;top:110px;width:120px;height:60px';
    secondTarget.setAttribute('inert', '');
    document.body.append(firstTarget, secondTarget);
    const fixture = TestBed.createComponent(BlockUiComponent);

    firstTarget.id = 'blockui-first-target';
    fixture.componentRef.setInput('target', '#blockui-first-target');
    fixture.componentRef.setInput('blocked', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector(
      '.orc-block-ui',
    ) as HTMLElement;
    const firstRect = firstTarget.getBoundingClientRect();
    expect(firstTarget.getAttribute('aria-busy')).toBe('true');
    expect(firstTarget.hasAttribute('inert')).toBeTrue();
    expect(overlay.style.position).toBe('fixed');
    expect(overlay.style.top).toBe(`${firstRect.top}px`);
    expect(overlay.style.left).toBe(`${firstRect.left}px`);
    expect(overlay.style.width).toBe(`${firstRect.width}px`);
    expect(overlay.style.height).toBe(`${firstRect.height}px`);
    const targetHit = document.elementFromPoint(
      firstRect.left + firstRect.width / 2,
      firstRect.top + firstRect.height / 2,
    );
    expect(targetHit === overlay || overlay.contains(targetHit)).toBeTrue();
    targetHit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(firstActivations).toBe(0);

    fixture.componentRef.setInput('target', {
      getBlockableElement: () => secondTarget,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstTarget.getAttribute('aria-busy')).toBe('false');
    expect(firstTarget.hasAttribute('inert')).toBeFalse();
    expect(secondTarget.getAttribute('aria-busy')).toBe('true');
    expect(secondTarget.hasAttribute('inert')).toBeTrue();

    fixture.componentRef.setInput('blocked', false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(secondTarget.hasAttribute('aria-busy')).toBeFalse();
    expect(secondTarget.hasAttribute('inert')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.orc-block-ui')).toBeNull();

    fixture.destroy();
    firstTarget.remove();
    secondTarget.remove();
  });

  it('does not fall back to the projected host when an explicit target cannot be resolved', async () => {
    const fixture = TestBed.createComponent(BlockUiTestHost);
    fixture.componentInstance.target.set('#missing-blockui-target');
    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector(
      'orc-block-ui',
    ) as HTMLElement;
    const content = host.querySelector('.orc-block-ui-content') as HTMLElement;
    const action = host.querySelector('#projected-action') as HTMLButtonElement;
    expect(host.getAttribute('aria-busy')).toBeNull();
    expect(content.hasAttribute('inert')).toBeFalse();
    expect(host.querySelector('.orc-block-ui')).toBeNull();
    action.click();
    expect(fixture.componentInstance.activations).toBe(1);
    fixture.destroy();
  });

  it('rejects an external target that contains the BlockUI host', async () => {
    const target = document.createElement('section');
    document.body.append(target);
    const fixture = TestBed.createComponent(BlockUiTestHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      'orc-block-ui',
    ) as HTMLElement;
    target.append(host);
    fixture.componentInstance.target.set(target);
    fixture.componentInstance.blocked.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const action = host.querySelector('#projected-action') as HTMLButtonElement;
    const content = host.querySelector('.orc-block-ui-content') as HTMLElement;
    expect(target.hasAttribute('inert')).toBeFalse();
    expect(target.getAttribute('aria-busy')).toBeNull();
    expect(host.getAttribute('aria-busy')).toBeNull();
    expect(content.hasAttribute('inert')).toBeFalse();
    expect(host.querySelector('.orc-block-ui')).toBeNull();
    action.focus();
    expect(document.activeElement).toBe(action);
    action.click();
    expect(fixture.componentInstance.activations).toBe(1);

    fixture.destroy();
    target.remove();
  });

  it('emits each block and unblock transition once, including external model changes', async () => {
    const fixture = TestBed.createComponent(BlockUiComponent);
    let blocks = 0;
    let unblocks = 0;
    fixture.componentInstance.onBlock.subscribe(() => blocks++);
    fixture.componentInstance.onUnblock.subscribe(() => unblocks++);

    fixture.componentInstance.block();
    fixture.componentInstance.block();
    fixture.componentInstance.unblock();
    fixture.componentInstance.unblock();
    expect(blocks).toBe(1);
    expect(unblocks).toBe(1);

    fixture.componentRef.setInput('blocked', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentRef.setInput('blocked', false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(blocks).toBe(2);
    expect(unblocks).toBe(2);
    fixture.destroy();
  });

  it('restores an external target and listeners on destroy while blocked', async () => {
    const target = document.createElement('section');
    target.setAttribute('aria-busy', 'false');
    document.body.append(target);
    const fixture = TestBed.createComponent(BlockUiComponent);
    fixture.componentRef.setInput('target', target);
    fixture.componentRef.setInput('blocked', true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(target.getAttribute('aria-busy')).toBe('true');
    expect(target.hasAttribute('inert')).toBeTrue();

    fixture.destroy();
    expect(target.getAttribute('aria-busy')).toBe('false');
    expect(target.hasAttribute('inert')).toBeFalse();
    target.remove();
  });

  it('constructs target observers from an external target owner window', async () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    const target = frameDocument.createElement('section');
    frameDocument.body.appendChild(target);
    const fixture = TestBed.createComponent(BlockUiComponent);
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    fixture.componentRef.setInput('target', target);
    fixture.componentRef.setInput('blocked', true);

    class FrameResizeObserver {
      static instances: FrameResizeObserver[] = [];
      constructor(_callback: ResizeObserverCallback) {
        FrameResizeObserver.instances.push(this);
      }
      observe(_target: Element): void {}
      disconnect(): void {}
      unobserve(_target: Element): void {}
    }
    class FrameMutationObserver {
      static instances: FrameMutationObserver[] = [];
      constructor(_callback: MutationCallback) {
        FrameMutationObserver.instances.push(this);
      }
      observe(_target: Node, _options?: MutationObserverInit): void {}
      disconnect(): void {}
    }
    const originalResize = (
      frameWindow as unknown as { ResizeObserver?: unknown }
    ).ResizeObserver;
    const originalMutation = (
      frameWindow as unknown as { MutationObserver?: unknown }
    ).MutationObserver;
    Object.defineProperty(frameWindow, 'ResizeObserver', {
      configurable: true,
      value: FrameResizeObserver,
    });
    Object.defineProperty(frameWindow, 'MutationObserver', {
      configurable: true,
      value: FrameMutationObserver,
    });
    try {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(FrameResizeObserver.instances.length).toBeGreaterThan(0);
      expect(FrameMutationObserver.instances.length).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(frameWindow, 'ResizeObserver', {
        configurable: true,
        value: originalResize,
      });
      Object.defineProperty(frameWindow, 'MutationObserver', {
        configurable: true,
        value: originalMutation,
      });
      fixture.destroy();
      frame.remove();
    }
  });
});
