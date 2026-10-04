import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { focusElement } from '../../tools/quality/test-focus-events';
import { TagsInputComponent } from './p2/p2-form-components';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TagsInputComponent],
  template: `<orc-tags-input
      [formControl]="control"
      removeAriaLabel="Remove tag"
      (onBlur)="blurEvents.push($event)"
    />
    <button type="button">Outside</button>`,
})
class TagsBlurHost {
  readonly control = new FormControl<string[]>([], {
    nonNullable: true,
    updateOn: 'blur',
  });
  readonly blurEvents: Event[] = [];
}

describe('TagsInput suggestions and CVA contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsBlurHost],
    }).compileComponents();
  });

  function createFixture(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(TagsInputComponent);
    fixture.componentRef.setInput('inputId', 'tags');
    fixture.componentRef.setInput('ariaLabel', 'Tags');
    fixture.componentRef.setInput('suggestions', ['Alpha', 'Beta', 'Gamma']);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return {
      fixture,
      tags: fixture.componentInstance,
      input: fixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement,
    };
  }

  function typeDraft(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function paste(input: HTMLInputElement, value: string): ClipboardEvent {
    const event = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => value },
    });
    input.dispatchEvent(event);
    return event;
  }

  it('supports ArrowUp/Down, Enter selection, and active descendant ARIA', () => {
    const { fixture, tags, input } = createFixture();
    const added: string[] = [];
    tags.tagAdded.subscribe((value) => added.push(value));
    typeDraft(input, 'a');
    fixture.detectChanges();

    expect(input.getAttribute('aria-controls')).toBe('tags-panel');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')),
    ).toHaveSize(3);

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    expect(tags.activeSuggestionIndex()).toBe(0);
    expect(input.getAttribute('aria-activedescendant')).toBe('tags-option-0');
    expect(
      fixture.nativeElement
        .querySelector('#tags-option-0')
        .getAttribute('aria-selected'),
    ).toBe('true');

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    fixture.detectChanges();
    expect(tags.activeSuggestionIndex()).toBe(0);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tags.value()).toEqual(['Alpha']);
    expect(added).toEqual(['Alpha']);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('dismisses suggestions with Escape and reopens after new input', () => {
    const { fixture, tags, input } = createFixture();
    typeDraft(input, 'a');
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tags.activeSuggestionIndex()).toBe(-1);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();

    typeDraft(input, 'a');
    fixture.detectChanges();
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('removes the final tag on Backspace without triggering browser navigation', () => {
    const { fixture, tags, input } = createFixture();
    tags.writeValue(['Alpha']);
    fixture.detectChanges();

    const backspace = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(backspace);
    fixture.detectChanges();

    expect(tags.value()).toEqual([]);
    expect(backspace.defaultPrevented).toBeTrue();
  });

  it('does not add a draft when Enter is confirming IME composition', () => {
    const { fixture, tags, input } = createFixture();
    typeDraft(input, 'かな');

    const composingEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    input.dispatchEvent(composingEnter);
    fixture.detectChanges();

    expect(tags.value()).toEqual([]);
    expect(tags.draft()).toBe('かな');
    expect(composingEnter.defaultPrevented).toBeFalse();

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(tags.value()).toEqual(['かな']);
  });

  it('commits on Tab without preventing native focus navigation', () => {
    const { fixture, tags, input } = createFixture({ addOnTab: true });
    const changes: string[][] = [];
    const added: string[] = [];
    tags.registerOnChange((value) => changes.push([...value]));
    tags.tagAdded.subscribe((value) => added.push(value));
    typeDraft(input, 'Alpha');

    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(tab);
    fixture.detectChanges();

    expect(tags.value()).toEqual(['Alpha']);
    expect(changes).toEqual([['Alpha']]);
    expect(added).toEqual(['Alpha']);
    expect(tab.defaultPrevented).toBeFalse();
  });

  it('tokenizes pasted tags, filters duplicates and limits, and reports one CVA change', () => {
    const { fixture, tags, input } = createFixture({ maxTags: 3 });
    const changes: string[][] = [];
    const added: string[] = [];
    tags.registerOnChange((value) => changes.push([...value]));
    tags.tagAdded.subscribe((value) => added.push(value));
    tags.writeValue(['Alpha']);
    typeDraft(input, 'draft');

    const event = paste(input, 'alpha, Beta\nGamma, Delta');
    fixture.detectChanges();

    expect(event.defaultPrevented).toBeTrue();
    expect(tags.value()).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(tags.draft()).toBe('');
    expect(changes).toEqual([['Alpha', 'Beta', 'Gamma']]);
    expect(added).toEqual(['Beta', 'Gamma']);
  });

  it('uses the configured separator when tokenizing clipboard text', () => {
    const { fixture, tags, input } = createFixture({ separator: /[;|]/ });
    const changes: string[][] = [];
    tags.registerOnChange((value) => changes.push([...value]));

    paste(input, 'one;two|three');
    fixture.detectChanges();

    expect(tags.value()).toEqual(['one', 'two', 'three']);
    expect(changes).toEqual([['one', 'two', 'three']]);
  });

  it('filters duplicate suggestions according to caseSensitiveDuplication', () => {
    const { fixture, tags, input } = createFixture();
    fixture.componentRef.setInput('suggestions', [
      'Alpha',
      'alpha',
      'ALPHA',
      'Beta',
      'Gamma',
    ]);
    tags.value.set(['Alpha']);
    typeDraft(input, 'a');
    fixture.detectChanges();
    expect(tags.filteredSuggestions()).toEqual(['Beta', 'Gamma']);

    fixture.componentRef.setInput('caseSensitiveDuplication', true);
    fixture.detectChanges();
    expect(tags.filteredSuggestions()).toEqual([
      'alpha',
      'ALPHA',
      'Beta',
      'Gamma',
    ]);

    tags.addTag('alpha');
    expect(tags.value()).toEqual(['Alpha', 'alpha']);
    fixture.componentRef.setInput('caseSensitiveDuplication', false);
    tags.addTag('ALPHA');
    expect(tags.value()).toEqual(['Alpha', 'alpha']);
  });

  it('keeps disabled and CVA-disabled inputs inert while preserving CVA writes', () => {
    const { fixture, tags, input } = createFixture();
    const changes: string[][] = [];
    tags.registerOnChange((value) => changes.push(value));
    tags.writeValue(['Existing']);
    fixture.detectChanges();
    expect(tags.value()).toEqual(['Existing']);

    tags.setDisabledState(true);
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    typeDraft(input, 'a');
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(tags.value()).toEqual(['Existing']);
    expect(changes).toEqual([]);

    tags.setDisabledState(false);
    fixture.detectChanges();
    expect(input.disabled).toBeFalse();
  });

  it('commits updateOn blur and marks touched only when focus leaves the composite', () => {
    const fixture = TestBed.createComponent(TagsBlurHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    const tags = fixture.debugElement.query(By.directive(TagsInputComponent))
      .componentInstance as TagsInputComponent;
    const input = fixture.nativeElement.querySelector(
      'orc-tags-input input',
    ) as HTMLInputElement;

    focusElement(input);
    tags.addTag('Alpha');
    fixture.detectChanges();
    expect(control.value).toEqual([]);
    expect(control.touched).toBeFalse();

    const remove = fixture.nativeElement.querySelector(
      'orc-tags-input .tag button',
    ) as HTMLButtonElement;
    focusElement(remove);
    fixture.detectChanges();
    expect(control.value).toEqual([]);
    expect(control.touched).toBeFalse();
    expect(fixture.componentInstance.blurEvents).toHaveSize(1);

    focusElement(
      Array.from(fixture.nativeElement.querySelectorAll('button')).at(
        -1,
      ) as HTMLButtonElement,
    );
    fixture.detectChanges();
    expect(control.value).toEqual(['Alpha']);
    expect(control.touched).toBeTrue();
    expect(fixture.componentInstance.blurEvents).toHaveSize(1);
  });
});
