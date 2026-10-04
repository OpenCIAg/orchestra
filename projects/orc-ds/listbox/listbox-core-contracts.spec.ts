import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListboxComponent } from './listbox.component';

/**
 * Characterization pins for the listbox contracts the shared list-picker
 * core owns: the row-wise filter machine (notEquals over every field,
 * `in` over list-valued fields, numeric modes skipping null and empty raw
 * values), cold ArrowUp roving, and the filter input landing the active
 * option on the first enabled row. Field/scalar/dataKey seams are pinned
 * in listbox-parity.spec.ts; these must stay green through the migration.
 */
describe('Listbox list-picker core contracts', () => {
  let fixture: ComponentFixture<ListboxComponent<any>>;
  let component: ListboxComponent<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListboxComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ListboxComponent<any>);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  it('matches notEquals only when no searchable field equals the query', () => {
    fixture.componentRef.setInput('options', [
      { label: 'Rome', region: 'Lazio' },
      { label: 'Turin', region: 'Piedmont' },
    ]);
    fixture.componentRef.setInput('filterBy', 'label, region');
    fixture.componentRef.setInput('filterMatchMode', 'notEquals');
    component.filterValue.set('rome');
    // Row-wise semantics: Rome's label equals the query, so the whole row
    // is out even though its region differs.
    expect(component.filteredOptions().map((option) => option.label)).toEqual([
      'Turin',
    ]);
  });

  it('matches `in` against options whose filter field is itself a list', () => {
    fixture.componentRef.setInput('options', [
      { label: 'Alpha', tags: ['web', 'mobile'] },
      { label: 'Beta', tags: ['cli'] },
    ]);
    fixture.componentRef.setInput('filterBy', 'tags');
    fixture.componentRef.setInput('filterMatchMode', 'in');
    component.filterValue.set('mobile');
    expect(component.filteredOptions().map((option) => option.label)).toEqual([
      'Alpha',
    ]);
  });

  it('skips null and empty values in numeric comparisons over raw fields', () => {
    fixture.componentRef.setInput('options', [
      { label: 'No rank', rank: null },
      { label: 'Empty', rank: '' },
      { label: 'Ten', rank: 10 },
    ]);
    fixture.componentRef.setInput('filterBy', 'rank');
    fixture.componentRef.setInput('filterMatchMode', 'gte');
    component.filterValue.set('5');
    expect(component.filteredOptions().map((option) => option.label)).toEqual([
      'Ten',
    ]);
  });

  it('lands cold ArrowUp roving on the last enabled option', () => {
    fixture.componentRef.setInput('options', [
      { label: 'Alpha' },
      { label: 'Beta', disabled: true },
      { label: 'Gamma' },
    ]);
    component.onKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }),
    );
    expect(component.activeIndex()).toBe(2);
  });

  it('moves the active option to the first enabled row while filtering', () => {
    fixture.componentRef.setInput('options', [
      { label: 'Alpha', disabled: true },
      { label: 'Beta' },
      { label: 'Gamma' },
    ]);
    component.onFilterInput({ target: { value: '' } } as unknown as Event);
    expect(component.activeIndex()).toBe(1);
  });
});
