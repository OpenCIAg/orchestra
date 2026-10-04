import { Component, input, OnDestroy, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from './p2/p2-overlay-components';
import { PortalComponent as FocusedPortalComponent } from './p2/p2-portal-component';
import { PortalComponent as P2PortalComponent } from './p2';
import { PortalComponent as DocsPortalComponent } from './p2/p2-doc-components';
import { PortalComponent as CompatibilityPortalComponent } from './p2/p2-overlay-components';

@Component({
  standalone: true,
  imports: [FocusedPortalComponent],
  template: `
    <div class="portal-target-a"></div>
    <div class="portal-target-b"></div>
    <orc-portal [target]="target()">
      @if (show()) {
        <span class="projected-content">Projected</span>
      }
    </orc-portal>
  `,
})
class PortalTargetHost {
  readonly target = signal<HTMLElement | string | null>(null);
  readonly show = signal(true);
}

@Component({
  selector: 'orc-portal-lifecycle-child',
  standalone: true,
  template: `<span class="portal-child-label">{{ label() }}</span>`,
})
class PortalLifecycleChildComponent implements OnDestroy {
  static destroyCount = 0;

  readonly label = input('Initial child content');

  ngOnDestroy(): void {
    PortalLifecycleChildComponent.destroyCount += 1;
  }
}

@Component({
  standalone: true,
  imports: [FocusedPortalComponent, PortalLifecycleChildComponent],
  template: `
    <div class="portal-lifecycle-target-a"></div>
    <div class="portal-lifecycle-target-b"></div>
    <orc-portal [target]="target()">
      @if (show()) {
        <orc-portal-lifecycle-child [label]="label()" />
      }
    </orc-portal>
  `,
})
class PortalLifecycleHost {
  readonly target = signal<HTMLElement | string | null>(null);
  readonly show = signal(true);
  readonly label = signal('Initial child content');
}

describe('ContextMenu and Portal target contracts', () => {
  it('preserves PortalComponent identity across focused, compatibility, P2, and docs exports', () => {
    expect(CompatibilityPortalComponent).toBe(FocusedPortalComponent);
    expect(P2PortalComponent).toBe(FocusedPortalComponent);
    expect(DocsPortalComponent).toBe(FocusedPortalComponent);
  });

  it('binds ContextMenu to target changes and removes target listeners on destroy', () => {
    const first = document.createElement('button');
    const second = document.createElement('button');
    first.id = 'context-target-first';
    second.id = 'context-target-second';
    document.body.append(first, second);

    const fixture = TestBed.createComponent(ContextMenuComponent);
    const component = fixture.componentInstance;
    const opened: Array<{ x: number; y: number }> = [];
    component.opened.subscribe((position) => opened.push(position));
    fixture.componentRef.setInput('target', '#context-target-first');
    fixture.detectChanges();

    const firstEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 12,
      clientY: 24,
    });
    first.dispatchEvent(firstEvent);
    expect(firstEvent.defaultPrevented).toBeTrue();
    expect(component.open()).toBeTrue();
    expect(component.position()).toEqual({ x: 12, y: 24 });

    component.hide();
    fixture.componentRef.setInput('target', second);
    fixture.detectChanges();
    first.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(component.open()).toBeFalse();
    second.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: 30,
        clientY: 40,
      }),
    );
    expect(component.open()).toBeTrue();
    expect(component.position()).toEqual({ x: 30, y: 40 });
    component.hide();

    const host = fixture.nativeElement.querySelector(
      '.orc-p2-context-menu-host',
    ) as HTMLElement;
    host.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(component.open()).toBeFalse();
    expect(opened).toHaveSize(2);

    fixture.componentRef.setInput('target', '#missing-context-target');
    fixture.detectChanges();
    host.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(component.open()).toBeTrue();

    component.hide();
    fixture.destroy();
    second.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(component.open()).toBeFalse();
    first.remove();
    second.remove();
  });

  it('handles a target projected inside the host exactly once', () => {
    const fixture = TestBed.createComponent(ContextMenuComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '.orc-p2-context-menu-host',
    ) as HTMLElement;
    const nestedTarget = document.createElement('button');
    host.appendChild(nestedTarget);
    const component = fixture.componentInstance;
    const opened: Array<{ x: number; y: number }> = [];
    component.opened.subscribe((position) => opened.push(position));
    fixture.componentRef.setInput('target', nestedTarget);
    fixture.detectChanges();

    nestedTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: 18,
        clientY: 28,
      }),
    );
    expect(component.open()).toBeTrue();
    expect(opened).toHaveSize(1);
    fixture.destroy();
  });

  it('accepts direct targets from another same-origin document', async () => {
    const frame = document.createElement('iframe');
    frame.style.width = '300px';
    frame.style.height = '200px';
    frame.style.border = '3px solid';
    document.body.appendChild(frame);
    spyOn(frame, 'getBoundingClientRect').and.returnValue(
      new DOMRect(100, 50, 306, 206),
    );
    const foreignDocument = frame.contentDocument;
    if (!foreignDocument)
      throw new Error('Expected same-origin iframe document');

    const contextTarget = foreignDocument.createElement('button');
    foreignDocument.body.appendChild(contextTarget);
    const contextFixture = TestBed.createComponent(ContextMenuComponent);
    contextFixture.componentRef.setInput('target', contextTarget);
    contextFixture.componentRef.setInput('items', [
      { label: 'Open', value: 'open' },
      { label: 'Save', value: 'save' },
    ]);
    contextFixture.detectChanges();
    contextTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 9,
        clientY: 14,
      }),
    );
    expect(contextFixture.componentInstance.position()).toEqual({
      x: 100 + frame.clientLeft + 9,
      y: 50 + frame.clientTop + 14,
    });
    await contextFixture.whenStable();
    contextFixture.detectChanges();
    const menuItems = Array.from(
      contextFixture.nativeElement.querySelectorAll('[role="menuitem"]'),
    ) as HTMLButtonElement[];
    expect(document.activeElement).toBe(menuItems[0]);
    menuItems[0].dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(contextFixture.componentInstance.open()).toBeTrue();
    menuItems[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    await contextFixture.whenStable();
    contextFixture.detectChanges();
    expect(document.activeElement).toBe(menuItems[1]);

    menuItems[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(contextFixture.componentInstance.open()).toBeFalse();
    await contextFixture.whenStable();
    expect(foreignDocument.activeElement).toBe(contextTarget);

    contextTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 9,
        clientY: 14,
      }),
    );
    contextTarget.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(contextFixture.componentInstance.open()).toBeFalse();

    contextTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 9,
        clientY: 14,
      }),
    );
    const outside = foreignDocument.createElement('button');
    foreignDocument.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(contextFixture.componentInstance.open()).toBeFalse();
    contextFixture.destroy();

    const portalTarget = foreignDocument.createElement('div');
    foreignDocument.body.appendChild(portalTarget);
    const portalFixture = TestBed.createComponent(PortalTargetHost);
    portalFixture.detectChanges();
    portalFixture.componentInstance.target.set(portalTarget);
    portalFixture.detectChanges();
    await portalFixture.whenStable();
    expect(portalTarget.querySelector('.projected-content')).toBeTruthy();
    portalFixture.destroy();
    expect(portalTarget.querySelector('.projected-content')).toBeNull();
    frame.remove();
  });

  it('moves projected Portal nodes across target changes and restores them on destroy', async () => {
    const fixture = TestBed.createComponent(PortalTargetHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector(
      'orc-portal',
    ) as HTMLElement;
    const targetA = fixture.nativeElement.querySelector(
      '.portal-target-a',
    ) as HTMLElement;
    const targetB = fixture.nativeElement.querySelector(
      '.portal-target-b',
    ) as HTMLElement;

    fixture.componentInstance.target.set('.portal-target-a');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('.projected-content')).toBeTruthy();
    expect(host.querySelector('.projected-content')).toBeNull();

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('.projected-content')).toBeNull();

    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('.projected-content')).toBeTruthy();

    fixture.componentInstance.target.set('.portal-target-b');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('.projected-content')).toBeNull();
    expect(targetB.querySelector('.projected-content')).toBeTruthy();

    fixture.componentInstance.target.set(null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelector('.projected-content')).toBeTruthy();
    expect(targetB.querySelector('.projected-content')).toBeNull();

    fixture.componentInstance.target.set(targetA);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('.projected-content')).toBeTruthy();
    fixture.destroy();
    expect(targetA.querySelector('.projected-content')).toBeNull();
    expect(targetB.querySelector('.projected-content')).toBeNull();
  });

  it('preserves projected Angular child views across moves and destroys them exactly once', async () => {
    PortalLifecycleChildComponent.destroyCount = 0;
    const fixture = TestBed.createComponent(PortalLifecycleHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector(
      'orc-portal',
    ) as HTMLElement;
    const targetA = fixture.nativeElement.querySelector(
      '.portal-lifecycle-target-a',
    ) as HTMLElement;
    const targetB = fixture.nativeElement.querySelector(
      '.portal-lifecycle-target-b',
    ) as HTMLElement;
    let child = host.querySelector('orc-portal-lifecycle-child') as HTMLElement;
    expect(child).not.toBeNull();

    fixture.componentInstance.target.set('.portal-lifecycle-target-a');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('orc-portal-lifecycle-child')).toBe(child);
    expect(PortalLifecycleChildComponent.destroyCount).toBe(0);

    fixture.componentInstance.label.set('Updated while portaled');
    fixture.detectChanges();
    expect(child.textContent).toContain('Updated while portaled');

    fixture.componentInstance.target.set('.portal-lifecycle-target-b');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetA.querySelector('orc-portal-lifecycle-child')).toBeNull();
    expect(targetB.querySelector('orc-portal-lifecycle-child')).toBe(child);
    expect(PortalLifecycleChildComponent.destroyCount).toBe(0);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(targetB.querySelector('orc-portal-lifecycle-child')).toBeNull();
    expect(PortalLifecycleChildComponent.destroyCount).toBe(1);

    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    child = targetB.querySelector('orc-portal-lifecycle-child') as HTMLElement;
    expect(child).not.toBeNull();
    fixture.destroy();

    expect(PortalLifecycleChildComponent.destroyCount).toBe(2);
  });

  it('moves content when an unresolved selector target appears in the owner document', async () => {
    const fixture = TestBed.createComponent(PortalTargetHost);
    fixture.componentInstance.target.set('.portal-late-target');
    fixture.detectChanges();
    await fixture.whenStable();

    const portal = fixture.nativeElement.querySelector(
      'orc-portal',
    ) as HTMLElement;
    const content = portal.querySelector('.projected-content') as HTMLElement;
    expect(content.parentElement).toBe(portal);

    const lateTarget = document.createElement('div');
    lateTarget.className = 'portal-late-target';
    document.body.appendChild(lateTarget);
    // The owner-document MutationObserver is outside Angular's stability queue.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(lateTarget.querySelector('.projected-content')).toBe(content);
    expect(portal.querySelector('.projected-content')).toBeNull();

    fixture.destroy();
    expect(portal.querySelector('.projected-content')).toBe(content);
    lateTarget.remove();
  });

  it('disconnects an unresolved selector observer when the Portal is destroyed', async () => {
    const fixture = TestBed.createComponent(PortalTargetHost);
    fixture.componentInstance.target.set('.portal-created-after-destroy');
    fixture.detectChanges();
    await fixture.whenStable();

    const portal = fixture.nativeElement.querySelector(
      'orc-portal',
    ) as HTMLElement;
    const content = portal.querySelector('.projected-content') as HTMLElement;
    expect(content.parentElement).toBe(portal);
    fixture.destroy();
    expect(content.parentElement).toBe(portal);

    const lateTarget = document.createElement('div');
    lateTarget.className = 'portal-created-after-destroy';
    document.body.appendChild(lateTarget);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(lateTarget.querySelector('.projected-content')).toBeNull();
    expect(content.parentElement).toBe(portal);
    lateTarget.remove();
  });

  it('keeps an invalid selector local without observing or waiting on the owner document', async () => {
    const observeSpy = spyOn(
      document.defaultView!.MutationObserver.prototype,
      'observe',
    ).and.callThrough();
    const fixture = TestBed.createComponent(PortalTargetHost);
    fixture.componentInstance.target.set('[');
    fixture.detectChanges();
    await fixture.whenStable();

    const portal = fixture.nativeElement.querySelector(
      'orc-portal',
    ) as HTMLElement;
    const content = portal.querySelector('.projected-content') as HTMLElement;
    expect(content.parentElement).toBe(portal);
    expect(
      observeSpy.calls
        .allArgs()
        .some(([node]) => node === portal.ownerDocument),
    ).toBeFalse();

    const unrelatedNode = document.createElement('div');
    document.body.appendChild(unrelatedNode);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(content.parentElement).toBe(portal);
    fixture.destroy();
    unrelatedNode.remove();
  });
});
