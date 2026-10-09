import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { TagsInputComponent } from '@ciag/orchestra/tags-input';

describe('TagsInput limits, suggestions, and separator contract', () => {
  function createFixture(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(TagsInputComponent);
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

  function typeDraft(
    fixture: ReturnType<typeof createFixture>,
    value: string,
  ): void {
    fixture.input.value = value;
    fixture.input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.fixture.detectChanges();
  }

  function press(fixture: ReturnType<typeof createFixture>, key: string): void {
    fixture.input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.fixture.detectChanges();
  }

  it('enforces maxLength through keyboard and public additions with exactly-once changes', () => {
    const { fixture, tags, input } = createFixture({ maxLength: '3' });
    const cvaChanges: string[][] = [];
    const modelChanges: string[][] = [];
    const added: string[] = [];
    const addPayloads: Array<{ value: string }> = [];
    tags.registerOnChange((value) => cvaChanges.push([...value]));
    tags.value.subscribe((value) => modelChanges.push([...value]));
    tags.tagAdded.subscribe((value) => added.push(value));
    tags.onAdd.subscribe((payload) => addPayloads.push(payload));

    expect(input.getAttribute('maxlength')).toBe('3');
    typeDraft({ fixture, tags, input }, 'long');
    press({ fixture, tags, input }, 'Enter');
    tags.addTag('long');
    expect(tags.value()).toEqual([]);
    expect(cvaChanges).toEqual([]);
    expect(modelChanges).toEqual([]);
    expect(added).toEqual([]);
    expect(addPayloads).toEqual([]);

    typeDraft({ fixture, tags, input }, 'cat');
    press({ fixture, tags, input }, 'Enter');
    expect(tags.value()).toEqual(['cat']);
    expect(cvaChanges).toEqual([['cat']]);
    expect(modelChanges).toEqual([['cat']]);
    expect(added).toEqual(['cat']);
    expect(addPayloads).toEqual([{ value: 'cat' }]);
  });

  it('filters suggestions by maxLength and adds a valid suggestion once', () => {
    const { fixture, tags, input } = createFixture({
      maxLength: 3,
      suggestions: ['long', 'cat'],
    });
    const cvaChanges: string[][] = [];
    const added: string[] = [];
    const addPayloads: Array<{ value: string }> = [];
    tags.registerOnChange((value) => cvaChanges.push([...value]));
    tags.tagAdded.subscribe((value) => added.push(value));
    tags.onAdd.subscribe((payload) => addPayloads.push(payload));

    typeDraft({ fixture, tags, input }, 'l');
    expect(tags.filteredSuggestions()).toEqual([]);
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();

    typeDraft({ fixture, tags, input }, 'c');
    expect(tags.filteredSuggestions()).toEqual(['cat']);
    fixture.nativeElement.querySelector('[role="option"]').click();
    fixture.detectChanges();
    expect(tags.value()).toEqual(['cat']);
    expect(cvaChanges).toEqual([['cat']]);
    expect(added).toEqual(['cat']);
    expect(addPayloads).toEqual([{ value: 'cat' }]);
  });

  it('treats zero as a real limit and undefined as unlimited for length and tag count', () => {
    const zeroLength = createFixture({ maxLength: 0 });
    expect(zeroLength.input.getAttribute('maxlength')).toBe('0');
    zeroLength.tags.addTag('x');
    expect(zeroLength.tags.value()).toEqual([]);

    const zeroMaxTags = createFixture({ maxTags: 0 });
    zeroMaxTags.tags.addTag('x');
    expect(zeroMaxTags.tags.value()).toEqual([]);

    const zeroMaxWins = createFixture({ max: 0, maxTags: 2 });
    zeroMaxWins.tags.addTag('x');
    expect(zeroMaxWins.tags.value()).toEqual([]);

    const maxTags = createFixture({ maxTags: 1 });
    maxTags.tags.addTag('first');
    maxTags.tags.addTag('second');
    expect(maxTags.tags.value()).toEqual(['first']);

    const max = createFixture({ max: 1, maxTags: 2 });
    max.tags.addTag('first');
    max.tags.addTag('second');
    expect(max.tags.value()).toEqual(['first']);

    const unlimited = createFixture();
    unlimited.tags.addTag('one');
    unlimited.tags.addTag('two');
    unlimited.tags.addTag('three');
    expect(unlimited.tags.value()).toEqual(['one', 'two', 'three']);
  });

  it('shows duplicate suggestions only when allowed and emits one addition', () => {
    const { fixture, tags, input } = createFixture({
      suggestions: ['Alpha', 'alpha', 'ALPHA', 'Beta'],
    });
    const cvaChanges: string[][] = [];
    const added: string[] = [];
    tags.registerOnChange((value) => cvaChanges.push([...value]));
    tags.tagAdded.subscribe((value) => added.push(value));
    tags.writeValue(['Alpha']);
    typeDraft({ fixture, tags, input }, 'a');

    expect(tags.filteredSuggestions()).toEqual(['Beta']);
    fixture.componentRef.setInput('allowDuplicate', true);
    fixture.detectChanges();
    expect(tags.filteredSuggestions()).toEqual([
      'Alpha',
      'alpha',
      'ALPHA',
      'Beta',
    ]);
    fixture.nativeElement.querySelector('[role="option"]').click();
    fixture.detectChanges();

    expect(tags.value()).toEqual(['Alpha', 'Alpha']);
    expect(cvaChanges).toEqual([['Alpha', 'Alpha']]);
    expect(added).toEqual(['Alpha']);
  });

  it('matches global and sticky separator expressions consistently across presses', () => {
    const { fixture, tags, input } = createFixture();
    const cvaChanges: string[][] = [];
    tags.registerOnChange((value) => cvaChanges.push([...value]));

    const globalSeparator = /;/g;
    fixture.componentRef.setInput('separator', globalSeparator);
    fixture.detectChanges();
    typeDraft({ fixture, tags, input }, 'one');
    press({ fixture, tags, input }, ';');
    typeDraft({ fixture, tags, input }, 'two');
    press({ fixture, tags, input }, ';');
    expect(globalSeparator.lastIndex).toBe(0);

    const stickySeparator = /,/y;
    fixture.componentRef.setInput('separator', stickySeparator);
    fixture.detectChanges();
    typeDraft({ fixture, tags, input }, 'three');
    press({ fixture, tags, input }, ',');
    typeDraft({ fixture, tags, input }, 'four');
    press({ fixture, tags, input }, ',');
    expect(stickySeparator.lastIndex).toBe(0);

    expect(tags.value()).toEqual(['one', 'two', 'three', 'four']);
    expect(cvaChanges).toEqual([
      ['one'],
      ['one', 'two'],
      ['one', 'two', 'three'],
      ['one', 'two', 'three', 'four'],
    ]);
  });

  it('styles the shell and disables clear for public and CVA disabled states', () => {
    for (const disabledBy of ['input', 'cva'] as const) {
      const { fixture, tags } = createFixture({
        disabled: disabledBy === 'input',
        showClear: true,
        clearAriaLabel: 'Clear tags',
      });
      const cvaChanges: string[][] = [];
      const clearEvents: Event[] = [];
      tags.registerOnChange((value) => cvaChanges.push([...value]));
      tags.onClear.subscribe((event) => clearEvents.push(event));
      tags.writeValue(['existing']);
      if (disabledBy === 'cva') tags.setDisabledState(true);
      fixture.detectChanges();

      const shell = fixture.nativeElement.querySelector(
        '.input-shell',
      ) as HTMLElement;
      const clearButton = fixture.nativeElement.querySelector(
        'button[aria-label="Clear tags"]',
      ) as HTMLButtonElement;
      expect(shell.classList.contains('is-disabled')).toBeTrue();
      expect(clearButton.disabled).toBeTrue();

      clearButton.click();
      tags.clear(new Event('clear'));
      expect(tags.value()).toEqual(['existing']);
      expect(cvaChanges).toEqual([]);
      expect(clearEvents).toEqual([]);
    }
  });
});
