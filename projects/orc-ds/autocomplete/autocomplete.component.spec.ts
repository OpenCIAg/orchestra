import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteComponent } from './autocomplete.component';
import { AutocompleteOption } from './autocomplete.types';

const OPTIONS: AutocompleteOption[] = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro', description: 'Southeast' },
  { value: 'mg', label: 'Minas Gerais', disabled: true },
];

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AutocompleteComponent],
  template: `<orc-autocomplete [formControl]="city" [options]="options" />`,
})
class ReactiveHost {
  readonly city = new FormControl<string | null>(null);
  readonly options = OPTIONS;
}

describe('AutocompleteComponent', () => {
  function create(options = OPTIONS): ComponentFixture<AutocompleteComponent> {
    const fixture = TestBed.createComponent(AutocompleteComponent);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('delay', 0);
    fixture.detectChanges();
    return fixture;
  }

  function inputFor(
    fixture: ComponentFixture<AutocompleteComponent>,
  ): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      '.orc-autocomplete__input',
    ) as HTMLInputElement;
  }

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent, ReactiveHost],
    }).compileComponents();
  });

  it('filters from the native input and selects an option by click', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const input = inputFor(fixture);
    const changed = jasmine.createSpy('changed');
    component.onChange.subscribe(changed);

    typeInto(input, 'rio');
    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector(
      '.orc-autocomplete__option',
    ) as HTMLElement;
    expect(component.filteredOptions()).toEqual([OPTIONS[1]]);
    expect(option.textContent).toContain('Rio de Janeiro');
    option.click();
    fixture.detectChanges();

    expect(component.value()).toBe('rj');
    expect(input.value).toBe('Rio de Janeiro');
    expect(changed).toHaveBeenCalledWith({ value: 'rj' });
    expect(component.isOpen()).toBeFalse();
  });

  it('navigates with arrows, skips disabled options, and selects with Enter', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    typeInto(inputFor(fixture), '');
    fixture.detectChanges();

    const preventDefault = jasmine.createSpy('preventDefault');
    component.onKeydown({
      key: 'ArrowDown',
      preventDefault,
    } as unknown as KeyboardEvent);
    expect(component.activeIndex()).toBe(0);
    component.onKeydown({
      key: 'ArrowDown',
      preventDefault,
    } as unknown as KeyboardEvent);
    expect(component.activeIndex()).toBe(1);
    component.onKeydown({
      key: 'ArrowDown',
      preventDefault,
    } as unknown as KeyboardEvent);
    expect(component.activeIndex()).toBe(0);
    component.onKeydown({
      key: 'Enter',
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(component.value()).toBe('sp');
    expect(preventDefault).toHaveBeenCalled();
  });

  it('propagates CVA writes and user changes, and marks the control touched on blur', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as AutocompleteComponent;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    component.writeValue('rj');
    fixture.detectChanges();
    expect(input.value).toBe('Rio de Janeiro');

    input.focus();
    component.select(OPTIONS[0]);
    fixture.detectChanges();
    expect(fixture.componentInstance.city.value).toBe('sp');
    expect(fixture.componentInstance.city.touched).toBeTrue();

    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.city.touched).toBeTrue();
  });

  it('clears a selected CVA value when forceSelection requires an option and the user starts a different query', () => {
    const fixture = create();
    fixture.componentRef.setInput('forceSelection', true);
    const component = fixture.componentInstance;
    component.writeValue('sp');
    const input = inputFor(fixture);
    fixture.detectChanges();
    typeInto(input, 'rio');

    expect(component.value()).toBeNull();
    expect(component.filteredOptions()).toEqual([OPTIONS[1]]);
  });

  it('honors disabled and readonly states for native and programmatic interactions', () => {
    const disabled = create();
    const disabledComponent = disabled.componentInstance;
    disabledComponent.writeValue('sp');
    disabled.componentRef.setInput('disabled', true);
    disabled.detectChanges();
    const disabledInput = inputFor(disabled);
    expect(disabledInput.disabled).toBeTrue();
    disabledComponent.toggleDropdown();
    disabledComponent.clear();
    expect(disabledComponent.value()).toBe('sp');

    disabledComponent.setDisabledState(false);
    disabledComponent.setDisabledState(true);
    disabled.detectChanges();
    expect(inputFor(disabled).disabled).toBeTrue();

    const readonly = create();
    const readonlyComponent = readonly.componentInstance;
    readonlyComponent.writeValue('sp');
    readonly.componentRef.setInput('readonly', true);
    readonly.detectChanges();
    const readonlyInput = inputFor(readonly);
    expect(readonlyInput.readOnly).toBeTrue();
    expect(readonlyInput.getAttribute('aria-readonly')).toBe('true');
    readonlyComponent.toggleDropdown();
    readonlyComponent.clear();
    readonlyComponent.select(OPTIONS[1]);
    expect(readonlyComponent.value()).toBe('sp');
    expect(readonlyComponent.isOpen()).toBeFalse();
  });

  it('emits show/hide consistently for focus, outside dismissal, Escape, and deferred blur', fakeAsync(() => {
    const fixture = create();
    const component = fixture.componentInstance;
    const shown = jasmine.createSpy('shown');
    const hidden = jasmine.createSpy('hidden');
    component.onShow.subscribe(shown);
    component.onHide.subscribe(hidden);

    component.onFocus();
    expect(shown).toHaveBeenCalledTimes(1);
    component.onFocus();
    expect(shown).toHaveBeenCalledTimes(1);

    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(hidden).toHaveBeenCalledTimes(1);
    component.toggleDropdown();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(hidden).toHaveBeenCalledTimes(2);

    component.toggleDropdown();
    component.onBlur();
    tick(120);
    expect(hidden).toHaveBeenCalledTimes(3);
  }));

  it('debounces opening, cancels stale queries, and clears the timer on destroy', fakeAsync(() => {
    const fixture = create();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('delay', 100);
    fixture.componentRef.setInput('minChars', 2);
    fixture.detectChanges();
    const input = inputFor(fixture);

    typeInto(input, 'sp');
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    tick(99);
    expect(component.isOpen()).toBeFalse();

    typeInto(input, 'rj');
    tick(100);
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();

    typeInto(input, '');
    expect(component.isOpen()).toBeFalse();
    fixture.destroy();
    tick(1000);
  }));

  it('attaches the panel to body or a custom target and keeps attached clicks inside', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const target = document.createElement('div');
    document.body.appendChild(target);
    fixture.componentRef.setInput('appendTo', target);
    component.toggleDropdown();
    fixture.detectChanges();

    const panel = target.querySelector(
      '.orc-autocomplete__list',
    ) as HTMLElement;
    expect(panel.parentElement).toBe(target);
    expect(panel.classList).toContain('orc-autocomplete__list--detached');
    panel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.isOpen()).toBeTrue();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.isOpen()).toBeFalse();
    fixture.detectChanges();
    fixture.destroy();
    target.remove();
  });

  it('attaches to body and removes the detached panel during teardown', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('appendTo', 'body');
    component.toggleDropdown();
    fixture.detectChanges();
    const panel = document.body.querySelector(
      `#${component.listId()}`,
    ) as HTMLElement;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.position).toBe('fixed');

    fixture.destroy();
    expect(panel.isConnected).toBeFalse();
  });

  it('constructs resize observation from the autocomplete owner window', () => {
    const fixture = create();
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    frameDocument.body.appendChild(
      frameDocument.adoptNode(fixture.nativeElement),
    );
    fixture.detectChanges();

    class FrameResizeObserver {
      static instances: FrameResizeObserver[] = [];
      constructor(_callback: ResizeObserverCallback) {
        FrameResizeObserver.instances.push(this);
      }
      observe(_target: Element): void {}
      disconnect(): void {}
      unobserve(_target: Element): void {}
    }
    const original = (frameWindow as unknown as { ResizeObserver?: unknown })
      .ResizeObserver;
    Object.defineProperty(frameWindow, 'ResizeObserver', {
      configurable: true,
      value: FrameResizeObserver,
    });
    try {
      fixture.componentInstance.toggleDropdown();
      fixture.detectChanges();
      expect(FrameResizeObserver.instances.length).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(frameWindow, 'ResizeObserver', {
        configurable: true,
        value: original,
      });
      fixture.destroy();
      frame.remove();
    }
  });

  it('renders empty and loading states only when configured', () => {
    const empty = create([{ value: 'sp', label: 'São Paulo' }]);
    empty.componentRef.setInput('emptyMessage', 'No cities');
    empty.componentInstance.onInput({
      target: { value: 'zz' },
    } as unknown as Event);
    empty.detectChanges();
    expect(
      empty.nativeElement.querySelector('[role="status"]')?.textContent,
    ).toContain('No cities');

    const hidden = create([{ value: 'sp', label: 'São Paulo' }]);
    hidden.componentRef.setInput('showEmptyMessage', false);
    hidden.componentInstance.onInput({
      target: { value: 'zz' },
    } as unknown as Event);
    hidden.detectChanges();
    expect(
      hidden.nativeElement.querySelector('.orc-autocomplete__list'),
    ).toBeNull();

    const loading = create([]);
    loading.componentRef.setInput('loading', true);
    loading.componentRef.setInput('loadingMessage', 'Loading cities');
    loading.componentInstance.toggleDropdown();
    loading.detectChanges();
    expect(
      loading.nativeElement.querySelector('.orc-autocomplete__list')
        ?.textContent,
    ).toContain('Loading cities');
  });

  it('cancels deferred blur cleanup when destroyed', fakeAsync(() => {
    const fixture = create();
    const hidden = jasmine.createSpy('hidden');
    fixture.componentInstance.onHide.subscribe(hidden);
    fixture.componentInstance.toggleDropdown();
    fixture.componentInstance.onBlur();
    fixture.destroy();
    tick(120);
    expect(hidden).not.toHaveBeenCalled();
  }));
  it('starts ArrowUp at the last enabled option and shows meaningful names and empty feedback', () => {
    const fixture = create();
    fixture.componentRef.setInput('dropdown', true);
    fixture.detectChanges();
    const input = inputFor(fixture);
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(
      fixture.nativeElement
        .querySelector('.p-autocomplete-dropdown')
        .getAttribute('aria-label'),
    ).toBe('Show options');
    typeInto(input, 'no match');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role=status]').textContent,
    ).toContain('No results');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('.orc-autocomplete__clear')
        .getAttribute('aria-label'),
    ).toBe('Clear selection');
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-autocomplete__clear').disabled,
    ).toBeTrue();
  });

  it('reflects external value changes after a user selection and honors an explicitly empty suggestions array', () => {
    const fixture = create();
    fixture.componentInstance.select(OPTIONS[0]);
    fixture.detectChanges();
    fixture.componentRef.setInput('value', 'rj');
    fixture.detectChanges();
    expect(inputFor(fixture).value).toBe('Rio de Janeiro');
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredOptions()).toEqual(OPTIONS);
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    expect(inputFor(fixture).value).toBe('');
    fixture.componentRef.setInput('suggestions', []);
    fixture.detectChanges();
    expect(fixture.componentInstance.effectiveOptions()).toEqual([]);
  });

  it('keeps default panels in the local positioned wrapper and dismisses through stopped outside events', () => {
    const fixture = create();
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector(
      '[role=listbox]',
    ) as HTMLElement;
    expect(panel.parentElement).toBe(
      fixture.nativeElement.querySelector('.orc-autocomplete'),
    );
    const outside = document.createElement('button');
    outside.addEventListener('pointerdown', (event) => event.stopPropagation());
    document.body.appendChild(outside);
    try {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(fixture.componentInstance.isOpen()).toBeFalse();
    } finally {
      outside.remove();
    }
  });

  it('positions body and static custom panels against the input and flips above the viewport edge', () => {
    const fixture = create();
    const target = document.createElement('div');
    target.style.cssText = 'margin: 100px; padding: 12px; border: 3px solid;';
    document.body.appendChild(target);
    fixture.nativeElement.style.cssText =
      'position:fixed;left:40px;top:50px;width:260px;';
    try {
      for (const parent of [document.body, target]) {
        fixture.componentRef.setInput(
          'appendTo',
          parent === document.body ? 'body' : parent,
        );
        fixture.componentInstance.toggleDropdown();
        fixture.detectChanges();
        const panel = document.getElementById(
          fixture.componentInstance.listId(),
        )!;
        const anchor = fixture.nativeElement
          .querySelector('.orc-autocomplete__control')
          .getBoundingClientRect();
        expect(panel.getBoundingClientRect().left).toBeCloseTo(anchor.left, 0);
        expect(panel.getBoundingClientRect().top).toBeCloseTo(
          anchor.bottom - 1,
          0,
        );
        expect(panel.getBoundingClientRect().width).toBeCloseTo(
          anchor.width,
          0,
        );
        fixture.componentInstance.toggleDropdown();
        fixture.detectChanges();
      }
      fixture.nativeElement.style.top = 'auto';
      fixture.nativeElement.style.bottom = '10px';
      fixture.componentRef.setInput('appendTo', 'body');
      fixture.componentInstance.toggleDropdown();
      fixture.detectChanges();
      const panel = document.getElementById(
        fixture.componentInstance.listId(),
      )!;
      const input = inputFor(fixture).getBoundingClientRect();
      expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        input.top,
      );
    } finally {
      fixture.destroy();
      target.remove();
    }
  });
  it('commits free text to reactive forms and accepts a manually typed option when selection is required', fakeAsync(() => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    typeInto(input, 'Custom city');
    fixture.detectChanges();
    expect(fixture.componentInstance.city.value).toBe('Custom city');
    input.dispatchEvent(new Event('blur'));
    tick(120);
    fixture.detectChanges();
    expect(input.value).toBe('Custom city');
    fixture.destroy();

    const required = create();
    required.componentRef.setInput('forceSelection', true);
    required.detectChanges();
    typeInto(inputFor(required), 'Rio de Janeiro');
    inputFor(required).dispatchEvent(new Event('blur'));
    tick(120);
    required.detectChanges();
    expect(required.componentInstance.value()).toBe('rj');
    expect(inputFor(required).value).toBe('Rio de Janeiro');
    required.destroy();
  }));

  it('defers IME input commits and filtering until compositionend', fakeAsync(() => {
    const options = [...OPTIONS, { value: 'jp', label: '日本' }];
    const fixture = create(options);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('forceSelection', true);
    fixture.componentRef.setInput('delay', 40);
    fixture.componentRef.setInput('dropdown', true);
    component.writeValue('sp');
    fixture.detectChanges();
    const input = inputFor(fixture);
    const changed = jasmine.createSpy('changed');
    component.onChange.subscribe(changed);
    component.toggleDropdown();
    fixture.detectChanges();
    expect(component.filteredOptions()).toEqual(options);

    input.dispatchEvent(
      new CompositionEvent('compositionstart', { bubbles: true }),
    );
    input.value = 'に';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(component.value()).toBe('sp');
    expect(component.query()).toBe('に');
    expect(component.isOpen()).toBeTrue();
    expect(component.filteredOptions()).toEqual(options);
    expect(changed).not.toHaveBeenCalled();

    input.value = '日本';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: '日本' }),
    );
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ value: null });
    expect(component.isOpen()).toBeTrue();
    expect(component.filteredOptions()).toEqual([options[3]]);
    tick(40);
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    tick(120);
    fixture.detectChanges();
    expect(component.value()).toBe('jp');
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledWith({ value: 'jp' });
  }));

  it('ignores composing key events and only prevents arrows when movement is possible', () => {
    const fixture = create([
      { value: 'locked', label: 'Locked', disabled: true },
    ]);
    const component = fixture.componentInstance;
    const input = inputFor(fixture);

    input.dispatchEvent(
      new CompositionEvent('compositionstart', { bubbles: true }),
    );
    const composingArrow = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowDown',
      isComposing: true,
    });
    input.dispatchEvent(composingArrow);
    expect(composingArrow.defaultPrevented).toBeFalse();
    expect(component.activeIndex()).toBe(-1);

    const keyCode229 = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowDown',
      keyCode: 229,
    });
    input.dispatchEvent(keyCode229);
    expect(keyCode229.defaultPrevented).toBeFalse();

    input.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true }),
    );
    const emptyArrow = new KeyboardEvent('keydown', {
      bubbles: true,
      key: 'ArrowDown',
    });
    input.dispatchEvent(emptyArrow);
    expect(emptyArrow.defaultPrevented).toBeFalse();
    expect(component.activeIndex()).toBe(-1);

    const open = create();
    const openComponent = open.componentInstance;
    const openInput = inputFor(open);
    openComponent.toggleDropdown();
    open.detectChanges();
    openInput.dispatchEvent(
      new CompositionEvent('compositionstart', { bubbles: true }),
    );
    openComponent.activeIndex.set(0);
    const composingEnter = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      isComposing: true,
    });
    openInput.dispatchEvent(composingEnter);
    const composingEscape = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Escape',
      isComposing: true,
    });
    openInput.dispatchEvent(composingEscape);
    expect(composingEnter.defaultPrevented).toBeFalse();
    expect(composingEscape.defaultPrevented).toBeFalse();
    expect(openComponent.value()).toBeNull();
    expect(openComponent.isOpen()).toBeTrue();
  });

  it('supports Home and End navigation while preserving native defaults at an empty edge', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const input = inputFor(fixture);
    component.toggleDropdown();
    fixture.detectChanges();

    const end = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'End',
    });
    input.dispatchEvent(end);
    expect(end.defaultPrevented).toBeTrue();
    expect(component.activeIndex()).toBe(1);

    const home = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Home',
    });
    input.dispatchEvent(home);
    expect(home.defaultPrevented).toBeTrue();
    expect(component.activeIndex()).toBe(0);

    const noOptions = create([]);
    const noOptionsInput = inputFor(noOptions);
    noOptions.componentInstance.toggleDropdown();
    const homeAtEmpty = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Home',
    });
    noOptionsInput.dispatchEvent(homeAtEmpty);
    expect(homeAtEmpty.defaultPrevented).toBeFalse();
  });

  it('applies identity, native text, form, and accessible-description inputs', () => {
    const fixture = create();
    fixture.componentRef.setInput('id', 'city-search');
    fixture.componentRef.setInput('inputId', 'city-input');
    fixture.componentRef.setInput('name', 'city');
    fixture.componentRef.setInput('label', 'City');
    fixture.componentRef.setInput('placeholder', 'Search cities');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('helperText', 'Choose a city');
    fixture.detectChanges();

    const input = inputFor(fixture);
    expect(input.id).toBe('city-input');
    expect(input.name).toBe('city');
    expect(input.placeholder).toBe('Search cities');
    expect(input.required).toBeTrue();
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(
      'city-input',
    );
    expect(input.getAttribute('aria-describedby')).toBe('city-input-helper');
    expect(
      fixture.nativeElement.querySelector('#city-input-helper').textContent,
    ).toContain('Choose a city');

    fixture.componentRef.setInput('errorMessage', 'A city is required');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('city-input-error');
    expect(
      fixture.nativeElement.querySelector('#city-input-error').textContent,
    ).toContain('A city is required');

    fixture.componentRef.setInput('ariaLabel', 'City finder');
    fixture.detectChanges();
    expect(input.getAttribute('aria-label')).toBe('City finder');
    fixture.destroy();

    const unlabeled = create();
    expect(inputFor(unlabeled).getAttribute('aria-label')).toBe('Autocomplete');
    unlabeled.destroy();
  });

  it('honors option and threshold aliases, and applies host and panel styling inputs', () => {
    const fixture = create();
    fixture.componentRef.setInput('id', 'legacy-city-id');
    fixture.componentRef.setInput('minChars', 1);
    fixture.componentRef.setInput('minLength', 3);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('suggestions', [
      { value: 'ny', label: 'New York' },
    ]);
    fixture.componentRef.setInput('style', { color: 'rgb(1, 2, 3)' });
    fixture.componentRef.setInput('styleClass', 'consumer-autocomplete');
    fixture.componentRef.setInput('panelStyle', { color: 'rgb(4, 5, 6)' });
    fixture.componentRef.setInput('panelStyleClass', 'consumer-panel');
    fixture.componentRef.setInput('emptyMessage', 'No matching city');
    fixture.componentRef.setInput('ariaLabel', 'City search');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const input = inputFor(fixture);
    expect(input.id).toBe('legacy-city-id');
    expect(component.effectiveOptions()).toEqual([
      { value: 'ny', label: 'New York' },
    ]);
    typeInto(input, 'zzz');
    fixture.detectChanges();
    expect(component.filteredOptions()).toEqual([]);
    expect(
      fixture.nativeElement.querySelector('[role="status"]')?.textContent,
    ).toContain('No matching city');

    const host = fixture.nativeElement.querySelector('.orc-autocomplete');
    expect(host.classList).toContain('consumer-autocomplete');
    expect(host.style.color).toBe('rgb(1, 2, 3)');
    const panel = fixture.nativeElement.querySelector('[role="listbox"]');
    expect(panel.classList).toContain('consumer-panel');
    expect(panel.style.color).toBe('rgb(4, 5, 6)');
    expect(panel.getAttribute('aria-label')).toBe('City search');
    fixture.destroy();
  });

  it('supports clear controls, their compatibility alias, and custom accessible names', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.writeValue('sp');
    fixture.componentRef.setInput('clearAriaLabel', 'Remove city');
    fixture.componentRef.setInput('dropdown', true);
    fixture.componentRef.setInput('dropdownAriaLabel', 'Browse cities');
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.orc-autocomplete__clear')
        .getAttribute('aria-label'),
    ).toBe('Remove city');
    expect(
      fixture.nativeElement
        .querySelector('.p-autocomplete-dropdown')
        .getAttribute('aria-label'),
    ).toBe('Browse cities');

    fixture.componentRef.setInput('showClear', false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-autocomplete__clear'),
    ).toBeNull();
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-autocomplete__clear').disabled,
    ).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('.p-autocomplete-dropdown').disabled,
    ).toBeTrue();
    fixture.destroy();

    const hiddenByCanonical = create();
    hiddenByCanonical.componentInstance.writeValue('sp');
    hiddenByCanonical.componentRef.setInput('clearable', false);
    hiddenByCanonical.detectChanges();
    expect(
      hiddenByCanonical.nativeElement.querySelector('.orc-autocomplete__clear'),
    ).toBeNull();
    hiddenByCanonical.destroy();
  });

  it('applies the minimum length and selection navigation inputs and configurable Escape behavior', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('minChars', 0);
    fixture.componentRef.setInput('minLength', 2);
    fixture.componentRef.setInput('autoHighlight', true);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.componentRef.setInput('delay', 0);
    fixture.componentRef.setInput('dropdown', true);
    fixture.detectChanges();

    typeInto(inputFor(fixture), 's');
    fixture.detectChanges();
    expect(component.filteredOptions()).toEqual([]);
    expect(component.isOpen()).toBeFalse();

    typeInto(inputFor(fixture), 'sp');
    fixture.detectChanges();
    expect(component.filteredOptions()).toEqual([OPTIONS[0]]);
    expect(component.activeIndex()).toBe(0);
    expect(inputFor(fixture).getAttribute('aria-activedescendant')).toBe(
      component.optionId(0),
    );
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    inputFor(fixture).dispatchEvent(escape);
    expect(escape.defaultPrevented).toBeFalse();
    expect(component.isOpen()).toBeTrue();
    fixture.destroy();
  });

  it('binds loading status, busy state, and model updates to the documented names', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingMessage', 'Finding cities');
    fixture.componentRef.setInput('dropdown', true);
    fixture.detectChanges();
    component.toggleDropdown();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('[role="listbox"]');
    expect(panel.getAttribute('aria-busy')).toBe('true');
    expect(panel.textContent).toContain('Finding cities');

    component.value.set('rj');
    fixture.detectChanges();
    expect(inputFor(fixture).value).toBe('Rio de Janeiro');
    fixture.componentRef.setInput('value', 'sp');
    fixture.detectChanges();
    expect(inputFor(fixture).value).toBe('São Paulo');
    fixture.destroy();
  });
});
