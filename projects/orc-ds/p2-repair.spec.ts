import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MenuComponent } from '@ciag/orchestra/menu';
import {
  ConfirmDialogComponent,
  ConfirmationService,
} from '@ciag/orchestra/confirm-dialog';
import { ContextMenuComponent } from '@ciag/orchestra/context-menu';
import {
  SplitterComponent,
  SplitterPanelContentDirective,
} from '@ciag/orchestra/splitter';
import { ListboxComponent } from '@ciag/orchestra/listbox';
import { MultiSelectComponent } from '@ciag/orchestra/multi-select';
import { TypographyComponent } from '@ciag/orchestra/typography';

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

  it('renders Typography using its requested semantic element', () => {
    const fixture = TestBed.createComponent(TypographyComponent);
    fixture.componentRef.setInput('as', 'h2');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('span')).toBeNull();
  });
});
