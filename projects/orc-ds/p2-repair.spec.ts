import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  MenuComponent,
  ConfirmDialogComponent,
  ConfirmationService,
} from './p2/p2-advanced-components';
import {
  ConfirmPopupComponent,
  ConfirmPopupService,
} from './p2/p2-confirm-popup';
import {
  ContextMenuComponent,
  PortalComponent,
  SplitterComponent,
  SplitterPanelContentDirective,
} from './p2/p2-overlay-components';
import {
  ListboxComponent,
  MultiSelectComponent,
} from './p2/p2-form-components';
import { ScrollTopComponent } from './p2/p2-primeng-gap-components';
import { TypographyComponent } from './p2/p2-layout-components';

describe('P2 repair regressions', () => {
  it('uses Menu items when model is omitted and tracks nested activation', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const item = { label: 'Open', value: 'open' };
    const nested = { label: 'Child', value: 'child' };
    fixture.componentRef.setInput('items', [
      { label: 'Parent', items: [nested] },
      item,
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Open');
    fixture.componentInstance.activate(nested);
    expect(fixture.componentInstance.activeItem()).toBe(nested);
  });

  it('opens ContextMenu on a configured external target and removes its listener on destroy', () => {
    const target = document.createElement('button');
    document.body.appendChild(target);
    const fixture = TestBed.createComponent(ContextMenuComponent);
    fixture.componentRef.setInput('target', target);
    fixture.detectChanges();
    target.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: 12,
        clientY: 24,
      }),
    );
    expect(fixture.componentInstance.open()).toBeTrue();
    fixture.destroy();
    target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(fixture.componentInstance.open()).toBeTrue();
    target.remove();
  });

  it('moves Portal content to and restores it from its target', () => {
    @Component({
      standalone: true,
      imports: [PortalComponent],
      template: `<div #target></div>
        <orc-portal [target]="target"
          ><span class="projected">Projected</span></orc-portal
        >`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const target = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(target.querySelector('.projected')).toBeTruthy();
    fixture.destroy();
  });

  it('constructs Portal mutation observation from its owner window', async () => {
    @Component({
      standalone: true,
      imports: [PortalComponent],
      template: `<div #target></div>
        <orc-portal [target]="target"
          ><span class="projected">Projected</span></orc-portal
        >`,
    })
    class HostComponent {}
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    class FrameMutationObserver {
      static instances: FrameMutationObserver[] = [];
      constructor(_callback: MutationCallback) {
        FrameMutationObserver.instances.push(this);
      }
      observe(_target: Node, _options?: MutationObserverInit): void {}
      disconnect(): void {}
      takeRecords(): MutationRecord[] {
        return [];
      }
    }
    const original = (frameWindow as unknown as { MutationObserver?: unknown })
      .MutationObserver;
    Object.defineProperty(frameWindow, 'MutationObserver', {
      configurable: true,
      value: FrameMutationObserver,
    });
    const fixture = TestBed.createComponent(HostComponent);
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    try {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(FrameMutationObserver.instances.length).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(frameWindow, 'MutationObserver', {
        configurable: true,
        value: original,
      });
      fixture.destroy();
      frame.remove();
    }
  });

  it('renders splitter panel templates in their matching panel body', () => {
    @Component({
      standalone: true,
      imports: [SplitterComponent, SplitterPanelContentDirective],
      template: `<orc-splitter [panels]="panels"
        ><ng-template orcSplitterPanel="a"><span class="a">A</span></ng-template
        ><ng-template orcSplitterPanel="b"
          ><span class="b">B</span></ng-template
        ></orc-splitter
      >`,
    })
    class HostComponent {
      panels = [{ id: 'a' }, { id: 'b' }];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const bodies = fixture.nativeElement.querySelectorAll('.panel-body');
    expect(bodies[0].textContent).toContain('A');
    expect(bodies[0].textContent).not.toContain('B');
    expect(bodies[1].textContent).toContain('B');
  });

  it('observes parent scrolling in ScrollTop parent mode, including initial position', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'scrollTop', {
      configurable: true,
      value: 240,
      writable: true,
    });
    const host = document.createElement('div');
    parent.appendChild(host);
    document.body.appendChild(parent);
    const fixture = TestBed.createComponent(ScrollTopComponent);
    parent.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('target', 'parent');
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();
    parent.scrollTop = 0;
    parent.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.visible()).toBeFalse();
    fixture.destroy();
    parent.remove();
  });

  it('starts Listbox keyboard navigation at the first enabled option', () => {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', [
      { value: 'blocked', label: 'Blocked', disabled: true },
      { value: 'open', label: 'Open' },
    ]);
    fixture.componentInstance.onKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowDown' }),
    );
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it('resets MultiSelect active index when filter results change', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent<string>);
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    fixture.componentInstance.activeIndex.set(1);
    const event = { target: { value: 'alp' } } as unknown as Event;
    fixture.componentInstance.onFilterInput(event);
    expect(fixture.componentInstance.activeIndex()).toBe(-1);
  });

  it('provides default confirmation actions and handles Escape', () => {
    const service = TestBed.inject(ConfirmationService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Accept');
    expect(fixture.nativeElement.textContent).toContain('Reject');
    fixture.componentInstance.onEscape();
    expect(service.request()).toBeNull();
  });

  it('gives a message-only ConfirmDialog an accessible name and description', () => {
    const service = TestBed.inject(ConfirmationService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    const message = fixture.nativeElement.querySelector('p') as HTMLElement;
    expect(dialog.getAttribute('aria-label')).toBe('Confirmation');
    expect(dialog.getAttribute('aria-labelledby')).toBeNull();
    expect(dialog.getAttribute('aria-describedby')).toBe(message.id);
    expect(message.textContent).toContain('Continue?');
    expect(
      (
        fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement
      ).getAttribute('aria-label'),
    ).toBe('Reject');
    expect(
      (
        fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement
      ).getAttribute('aria-label'),
    ).toBe('Accept');
  });

  it('honors ConfirmDialog defaultFocus none and restores the opener after accept', fakeAsync(() => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const service = TestBed.inject(ConfirmationService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('defaultFocus', 'none');
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    tick();
    expect(document.activeElement).toBe(opener);
    fixture.componentInstance.accept();
    tick();
    expect(document.activeElement).toBe(opener);
    fixture.destroy();
    opener.remove();
  }));

  it('uses a configured ConfirmDialog action label for its accessible name', () => {
    const service = TestBed.inject(ConfirmationService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    service.confirm({
      message: 'Delete?',
      header: 'Delete record',
      acceptLabel: 'Delete',
      acceptAriaLabel: 'Delete this record permanently',
    });
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    const accept = fixture.nativeElement.querySelector(
      '.accept',
    ) as HTMLButtonElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe(
      fixture.componentInstance.titleId,
    );
    expect(dialog.getAttribute('aria-label')).toBeNull();
    expect(accept.textContent).toContain('Delete');
    expect(accept.getAttribute('aria-label')).toBe(
      'Delete this record permanently',
    );
  });

  it('provides default popup actions and handles Escape', () => {
    const service = TestBed.inject(ConfirmPopupService);
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Accept');
    expect(fixture.nativeElement.textContent).toContain('Reject');
    (
      fixture.nativeElement.querySelector('.popup') as HTMLElement
    ).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(service.request()).toBeNull();
  });

  it('gives a message-only ConfirmPopup an accessible name and preserves zero coordinates', () => {
    const service = TestBed.inject(ConfirmPopupService);
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    service.confirm({ message: 'Continue?', x: 0, y: 0 });
    fixture.detectChanges();
    const popup = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    const message = fixture.nativeElement.querySelector('p') as HTMLElement;
    expect(popup.getAttribute('aria-label')).toBe('Confirmation');
    expect(popup.getAttribute('aria-describedby')).toBe(message.id);
    expect(popup.style.left).toBe('0px');
    expect(popup.style.top).toBe('0px');
    expect(
      fixture.nativeElement
        .querySelectorAll('button')[0]
        .getAttribute('aria-label'),
    ).toBe('Reject');
    expect(
      fixture.nativeElement
        .querySelectorAll('button')[1]
        .getAttribute('aria-label'),
    ).toBe('Accept');
  });

  it('restores ConfirmPopup opener focus after accept', fakeAsync(() => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const service = TestBed.inject(ConfirmPopupService);
    const fixture = TestBed.createComponent(ConfirmPopupComponent);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    tick();
    expect(document.activeElement).not.toBe(opener);
    fixture.componentInstance.accept();
    tick();
    expect(document.activeElement).toBe(opener);
    fixture.destroy();
    opener.remove();
  }));

  it('renders Typography using its requested semantic element', () => {
    const fixture = TestBed.createComponent(TypographyComponent);
    fixture.componentRef.setInput('as', 'h2');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('span')).toBeNull();
  });
});
