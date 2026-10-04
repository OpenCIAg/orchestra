import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { registerOverlay } from '@ciag/orchestra/internal';
import { ComboboxComponent } from '@ciag/orchestra/p2';
import type { P2Option } from '@ciag/orchestra/p2';

/**
 * Dismissal-lifecycle pins for the combobox: document-level outside
 * dismissal (the input-blur close stays as the keyboard-focus contract, but
 * clicks that never move focus must also dismiss), topmost-aware Escape,
 * overlay-layer registry participation and truthful aria-expanded.
 */
describe('Combobox dismissal lifecycle', () => {
  const OPTIONS: P2Option<string>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(ComboboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  function inputOf(nativeElement: HTMLElement): HTMLInputElement {
    return nativeElement.querySelector('input') as HTMLInputElement;
  }

  function openPanel(fixture: ReturnType<typeof create>): HTMLInputElement {
    const input = inputOf(fixture.nativeElement);
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    return input;
  }

  function clickOutside(): void {
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
  }

  function settle(fixture: ComponentFixture<unknown>): void {
    // The dismissal wiring attaches through an effect after the panel render.
    fixture.detectChanges();
  }

  it('closes on an outside pointer interaction that never blurs the input', () => {
    const fixture = create();
    openPanel(fixture);
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeTrue();

    // A non-focusable target in Safari never moves focus: no blur fires.
    clickOutside();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('marks the forms control touched when dismissed from outside without a blur', () => {
    @Component({
      imports: [ReactiveFormsModule, ComboboxComponent],
      template: '<orc-combobox [formControl]="control" [options]="options" />',
    })
    class Host {
      readonly control = new FormControl<string | null>(null);
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    inputOf(host.nativeElement).dispatchEvent(new Event('focus'));
    settle(host);
    clickOutside();
    settle(host);
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('still closes when the input blurs (keyboard focus moves away)', () => {
    const fixture = create();
    const input = openPanel(fixture);
    settle(fixture);
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('keeps a single instance open: opening a second combobox closes the first', () => {
    const first = create();
    const second = create();
    openPanel(first);
    settle(first);
    expect(first.componentInstance.open()).toBeTrue();

    // The pointer path into the second input dismisses the first panel.
    const secondInput = inputOf(second.nativeElement);
    secondInput.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    secondInput.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    secondInput.dispatchEvent(new Event('focus'));
    settle(second);
    settle(first);
    expect(second.componentInstance.open()).toBeTrue();
    expect(first.componentInstance.open()).toBeFalse();
  });

  it('keeps aria-expanded truthful across the dismissal', () => {
    const fixture = create();
    const input = inputOf(fixture.nativeElement);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    openPanel(fixture);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    clickOutside();
    settle(fixture);
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes through the overlay-layer registry when the parent layer closes', () => {
    @Component({
      imports: [ComboboxComponent],
      template: `
        <div class="overlay-surface">
          <orc-combobox [options]="options" />
        </div>
      `,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const picker = host.debugElement.query(
      (node) => node.name === 'orc-combobox',
    ).componentInstance as ComboboxComponent<string>;
    const release = registerOverlay(
      host.nativeElement.querySelector('.overlay-surface') as HTMLElement,
    );

    inputOf(host.nativeElement).dispatchEvent(new Event('focus'));
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
    expect(fixture.componentInstance.open()).toBeTrue();

    release();
    sibling.remove();
    escape();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
