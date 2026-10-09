import { TestBed } from '@angular/core/testing';
import { TagsInputComponent } from '@ciag/orchestra/tags-input';

/**
 * Behavior-parity pins for the tags input. The specs import the component
 * through the family entry point and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('TagsInput behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(TagsInputComponent);
    fixture.detectChanges();
    return fixture;
  }

  function nativeInput(fixture: ReturnType<typeof create>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  function type(fixture: ReturnType<typeof create>, value: string): void {
    const native = nativeInput(fixture);
    native.value = value;
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function press(
    fixture: ReturnType<typeof create>,
    key: string,
    init: KeyboardEventInit = {},
  ): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    nativeInput(fixture).dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function tags(fixture: ReturnType<typeof create>): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.tag') as NodeListOf<HTMLElement>,
    ).map((tag) => tag.textContent?.trim() ?? '');
  }

  it('adds tags with Enter and reports both output names', () => {
    const fixture = create();
    const added: string[] = [];
    const compatAdded: string[] = [];
    fixture.componentInstance.tagAdded.subscribe((tag) => added.push(tag));
    fixture.componentInstance.onAdd.subscribe((event) =>
      compatAdded.push(event.value),
    );

    type(fixture, 'alpha');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual(['alpha']);
    expect(tags(fixture)).toEqual(['alpha']);
    expect(added).toEqual(['alpha']);
    expect(compatAdded).toEqual(['alpha']);
    expect(nativeInput(fixture).value).toBe('');
  });

  it('splits pasted text on the configured separator and skips duplicates', () => {
    const fixture = create();
    fixture.componentRef.setInput('separator', ',');
    fixture.detectChanges();

    const native = nativeInput(fixture);
    const paste = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer(),
    });
    (paste.clipboardData as DataTransfer).setData(
      'text',
      'alpha, beta ,gamma,,',
    );
    native.dispatchEvent(paste);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);

    (paste.clipboardData as DataTransfer).setData('text', 'beta');
    native.dispatchEvent(paste);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('enforces duplicate policy, maxTags and per-tag maxLength', () => {
    const fixture = create();
    fixture.componentRef.setInput('maxTags', 2);
    fixture.componentRef.setInput('maxLength', 4);
    fixture.detectChanges();

    type(fixture, 'toolongtag');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual([]);

    type(fixture, 'ab');
    press(fixture, 'Enter');
    type(fixture, 'cd');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual(['ab', 'cd']);

    type(fixture, 'ef');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual(['ab', 'cd']);
  });

  it('navigates suggestions with arrows, accepts with Enter and dismisses with Escape', () => {
    const fixture = create();
    fixture.componentRef.setInput('suggestions', ['alpha', 'alphabet', 'beta']);
    fixture.detectChanges();

    type(fixture, 'alp');
    expect(fixture.componentInstance.suggestionsVisible()).toBeTrue();
    expect(fixture.componentInstance.filteredSuggestions()).toEqual([
      'alpha',
      'alphabet',
    ]);

    press(fixture, 'ArrowDown');
    expect(fixture.componentInstance.activeSuggestionIndex()).toBe(0);
    press(fixture, 'ArrowDown');
    expect(fixture.componentInstance.activeSuggestionIndex()).toBe(1);
    press(fixture, 'ArrowDown');
    // Wrap-around.
    expect(fixture.componentInstance.activeSuggestionIndex()).toBe(0);
    press(fixture, 'ArrowUp');
    expect(fixture.componentInstance.activeSuggestionIndex()).toBe(1);

    press(fixture, 'Escape');
    expect(fixture.componentInstance.suggestionsVisible()).toBeFalse();

    type(fixture, 'alp');
    press(fixture, 'ArrowDown');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual(['alpha']);
  });

  it('removes through the chip action, Backspace and clear', () => {
    const fixture = create();
    fixture.componentRef.setInput('removeAriaLabel', 'Remove tag');
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('clearAriaLabel', 'Clear tags');
    const removed: { value: string; index: number }[] = [];
    const cleared: number[] = [];
    fixture.componentInstance.onRemove.subscribe((event) =>
      removed.push({ value: event.value, index: event.index }),
    );
    fixture.componentInstance.onClear.subscribe(() => cleared.push(1));
    fixture.componentInstance.writeValue(['one', 'two', 'three']);
    fixture.detectChanges();

    const removeButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button[aria-label="Remove tag"]'),
    ) as HTMLButtonElement[];
    expect(removeButtons.length).toBe(3);
    removeButtons[1].click();
    fixture.detectChanges();
    expect(removed).toEqual([{ value: 'two', index: 1 }]);
    expect(fixture.componentInstance.value()).toEqual(['one', 'three']);

    type(fixture, '');
    press(fixture, 'Backspace');
    expect(fixture.componentInstance.value()).toEqual(['one']);

    const clear = fixture.nativeElement.querySelector(
      'button[aria-label="Clear tags"]',
    ) as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([]);
    expect(cleared.length).toBe(1);
  });

  it('commits the draft on Tab and blur when configured, without trapping Tab navigation', () => {
    const fixture = create();
    fixture.componentRef.setInput('addOnTab', true);
    fixture.componentRef.setInput('addOnBlur', true);
    fixture.detectChanges();

    type(fixture, 'fromtab');
    const tab = press(fixture, 'Tab');
    expect(tab.defaultPrevented).toBeFalse();
    expect(fixture.componentInstance.value()).toEqual(['fromtab']);

    type(fixture, 'fromblur');
    nativeInput(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['fromtab', 'fromblur']);
  });

  it('registers through the forms API and marks touched when focus leaves the composite', () => {
    const fixture = create();
    let touched = 0;
    fixture.componentInstance.registerOnTouched(() => {
      touched += 1;
    });

    type(fixture, 'cva');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual(['cva']);
    fixture.componentInstance.writeValue(['cva']);
    expect(fixture.componentInstance.value()).toEqual(['cva']);

    fixture.componentInstance.onCompositeFocusOut(
      new FocusEvent('focusout', { relatedTarget: null }),
    );
    expect(touched).toBe(1);
  });

  it('applies the forms disabled handshake to the input and actions', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(nativeInput(fixture).disabled).toBeTrue();
    type(fixture, 'blocked');
    press(fixture, 'Enter');
    expect(fixture.componentInstance.value()).toEqual([]);
  });
});
