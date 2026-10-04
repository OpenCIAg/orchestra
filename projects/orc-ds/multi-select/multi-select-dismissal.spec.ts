import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerOverlay } from '@ciag/orchestra/internal';
import { MultiSelectComponent } from '@ciag/orchestra/p2';
import type { P2Option } from '@ciag/orchestra/p2';

/**
 * Dismissal-lifecycle pins for the multi-select: outside-interaction
 * dismissal, singleton behavior between instances, overlay-layer registry
 * participation (topmost-aware Escape and parent-close) and focus restore.
 */
describe('MultiSelect dismissal lifecycle', () => {
  const OPTIONS: P2Option<string>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(MultiSelectComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  function openPanel(fixture: ReturnType<typeof create>): void {
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();
  }

  function triggerOf(nativeElement: HTMLElement): HTMLElement {
    return nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLElement;
  }

  function clickOutside(): void {
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
  }

  function settle(
    fixture: ComponentFixture<MultiSelectComponent<string>>,
  ): void;
  function settle(fixture: ComponentFixture<unknown>): void;
  function settle(fixture: { detectChanges(): void }): void {
    // The dismissal wiring attaches through an effect after the panel render.
    fixture.detectChanges();
  }

  it('closes the open panel when a pointer interaction lands outside', () => {
    const fixture = create();
    const hidden: number[] = [];
    fixture.componentInstance.onPanelHide.subscribe(() => hidden.push(1));
    openPanel(fixture);
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeTrue();

    clickOutside();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(hidden).toEqual([1]);
    expect(fixture.nativeElement.querySelector('ul.options')).toBeNull();
  });

  it('marks the forms control touched when dismissed from outside', () => {
    @Component({
      imports: [ReactiveFormsModule, MultiSelectComponent],
      template:
        '<orc-multi-select [formControl]="control" [options]="options" />',
    })
    class Host {
      readonly control = new FormControl<string[]>([]);
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const trigger = triggerOf(host.nativeElement);
    trigger.click();
    host.detectChanges();
    settle(host);
    // The panel renders detached from the host view; it is located in the
    // document, not under the fixture element.
    expect(
      (document.querySelector('ul.options') as HTMLElement | null)?.id,
    ).toBeTruthy();

    clickOutside();
    settle(host);
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('keeps a single instance open: opening a second instance closes the first', () => {
    const first = create();
    const second = create();
    openPanel(first);
    settle(first);
    expect(first.componentInstance.open()).toBeTrue();

    // Opening the second instance is a pointer interaction outside the first.
    triggerOf(second.nativeElement).click();
    settle(second);
    settle(first);
    expect(second.componentInstance.open()).toBeTrue();
    expect(first.componentInstance.open()).toBeFalse();
  });

  it('does not dismiss when the interaction lands inside the panel', () => {
    const fixture = create();
    openPanel(fixture);
    settle(fixture);
    // The panel renders detached from the host view.
    const option = document.querySelector('li[role="option"]') as HTMLElement;
    option.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeTrue();
  });

  it('keeps aria-expanded truthful across the dismissal', () => {
    const fixture = create();
    const trigger = triggerOf(fixture.nativeElement);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    openPanel(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    clickOutside();
    settle(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes through the overlay-layer registry when the parent layer closes', () => {
    // A layer containing the picker that registered BEFORE the panel acts as
    // its parent in the registry, exactly like an open dialog does.
    @Component({
      imports: [MultiSelectComponent],
      template: `
        <div class="overlay-surface">
          <orc-multi-select [options]="options" />
        </div>
      `,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const picker = host.debugElement.query(
      (node) => node.name === 'orc-multi-select',
    ).componentInstance as MultiSelectComponent<string>;
    const release = registerOverlay(
      host.nativeElement.querySelector('.overlay-surface') as HTMLElement,
    );

    picker.toggleOpen();
    settle(host);
    expect(picker.open()).toBeTrue();

    release();
    settle(host);
    expect(picker.open()).toBeFalse();
  });

  it('defers to a topmost sibling layer on Escape and closes once topmost again', () => {
    const fixture = create();
    openPanel(fixture);
    settle(fixture);

    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    const release = registerOverlay(sibling);

    const escape = () =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    escape();
    settle(fixture);
    // A layer above the panel owns Escape; the panel stays open.
    expect(fixture.componentInstance.open()).toBeTrue();

    release();
    sibling.remove();
    escape();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('restores focus to the trigger when Escape closes the panel', () => {
    const fixture = create();
    fixture.componentRef.setInput('filter', true);
    fixture.detectChanges();
    openPanel(fixture);
    settle(fixture);
    // The filter input renders inside the detached panel.
    const filter = document.querySelector(
      '.orc-p2-multi-select-panel input',
    ) as HTMLInputElement;
    filter.focus();
    expect(document.activeElement).toBe(filter);

    filter.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(triggerOf(fixture.nativeElement));
  });
});
