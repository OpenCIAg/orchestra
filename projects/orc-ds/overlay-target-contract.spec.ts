import { TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from '@ciag/orchestra/context-menu';

describe('ContextMenu and Portal target contracts', () => {
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

  it('accepts a ContextMenu target from another same-origin document', async () => {
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
    frame.remove();
  });
});
