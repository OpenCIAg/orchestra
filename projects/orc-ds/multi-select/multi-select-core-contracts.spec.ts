import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from './multi-select.component';

/**
 * Characterization pins for the multi-select contracts the shared
 * list-picker core owns (field resolution, the value-level filter machine,
 * the both-sides dataKey equality, enabled-index roving and the limited
 * selection toggle). They pin current behavior and must stay green while
 * the internals move onto the core.
 */
describe('MultiSelect list-picker core contracts', () => {
  let fixture: ComponentFixture<MultiSelectComponent<any>>;
  let component: MultiSelectComponent<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MultiSelectComponent<any>);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  it('lets filterFields win over filterBy', () => {
    fixture.componentRef.setInput('options', [
      { value: 'one', label: 'Rome', search: 'Italy' },
      { value: 'two', label: 'Italy', search: 'Rome' },
    ]);
    fixture.componentRef.setInput('filterBy', 'label');
    fixture.componentRef.setInput('filterFields', ['search']);
    component.filterValue.set('italy');
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'one',
    ]);
  });

  it('matches notEquals when the searchable value differs from the query', () => {
    fixture.componentRef.setInput('options', [
      { value: 'one', label: 'Rome', region: 'Lazio' },
      { value: 'two', label: 'Turin', region: 'Lazio' },
    ]);
    fixture.componentRef.setInput('filterMatchMode', 'notEquals');
    component.filterValue.set('rome');
    // With no configured fields the searchable value is the label alone:
    // Rome's label differs-and-matches is false, Turin's is true.
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'two',
    ]);
  });

  it('reads missing filter fields as empty strings, which numeric modes treat as zero', () => {
    fixture.componentRef.setInput('options', [
      { value: 'missing', label: 'No rank' },
      { value: 'ten', label: 'Ten', rank: '10' },
    ]);
    fixture.componentRef.setInput('filterBy', 'rank');
    fixture.componentRef.setInput('filterMatchMode', 'gte');
    component.filterValue.set('0');
    // The missing rank stringifies to '' and numeric modes read it as 0,
    // so it satisfies gte 0.
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'missing',
      'ten',
    ]);
    component.filterValue.set('5');
    expect(component.filteredOptions().map((option) => option.value)).toEqual([
      'ten',
    ]);
  });

  it('compares dataKey values only when both sides resolve the key, else strictly', () => {
    fixture.componentRef.setInput('options', [
      { value: { key: 1 }, label: 'Object one' },
      { value: 1, label: 'Scalar one' },
    ]);
    fixture.componentRef.setInput('dataKey', 'key');

    // Both sides hold the key: the objects compare by key despite identity.
    component.writeValue([{ key: 1 } as any]);
    expect(component.isSelected(component.options()[0])).toBeTrue();

    // Only the stored side resolves a key: strict equality decides, and an
    // object never strictly equals the scalar.
    expect(component.isSelected(component.options()[1])).toBeFalse();
  });

  it('selects the active option with Space like Enter', () => {
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);
    component.toggleOpen();
    component.activeIndex.set(1);
    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLElement;
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(component.value()).toEqual(['b']);
  });

  it('lands ArrowUp from no active option on the last enabled entry', () => {
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta', disabled: true },
      { value: 'c', label: 'Gamma' },
    ]);
    component.toggleOpen();
    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLElement;
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(component.activeIndex()).toBe(2);
  });
});
