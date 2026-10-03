import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';

/**
 * Characterization pins for the dropdown contracts the shared list-picker
 * core owns (dotted-path field readers, scalar option fallbacks, and the
 * contains-only filter machine over filterBy paths). The full menu/form
 * behavior suite lives in dropdown-behavior.spec.ts; these pin the engine
 * seams that move onto the core and must stay green through the move.
 */
describe('Dropdown list-picker core contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
    }).compileComponents();
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-backdrop')
      .forEach((backdrop) => backdrop.remove());
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(DropdownComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('resolves scalar options as their own label and value', () => {
    const { fixture, component } = create({
      options: ['Alpha', 'Beta'],
    });
    expect(component.optionText('Alpha')).toBe('Alpha');
    expect(component.optionValueOf('Alpha')).toBe('Alpha');
    expect(component.selectedLabel()).toBe('');
    component.writeValue('Beta');
    fixture.detectChanges();
    expect(component.selectedLabel()).toBe('Beta');
    fixture.destroy();
  });

  it('filters through dotted filterBy paths, tolerating blank entries', () => {
    const { fixture, component } = create({
      options: [
        { label: 'Alpha', meta: { tag: 'system' } },
        { label: 'Beta', meta: { tag: 'community' } },
      ],
      filterBy: ' label , , meta.tag ',
    });
    component.filterValue.set('system');
    expect(component.filteredOptions()).toEqual([
      { label: 'Alpha', meta: { tag: 'system' } },
    ]);
    component.filterValue.set('community');
    expect(component.filteredOptions()).toEqual([
      { label: 'Beta', meta: { tag: 'community' } },
    ]);
    fixture.destroy();
  });

  it('keeps the form filter contains-only and case-insensitive', () => {
    const { fixture, component } = create({
      options: [
        { label: 'Alpha', value: 1 },
        { label: 'Beta', value: 2 },
      ],
    });
    component.filterValue.set('ALP');
    expect(component.filteredOptions().length).toBe(1);
    // notEquals is not a dropdown mode: the machine only contains.
    component.filterValue.set('gamma');
    expect(component.filteredOptions()).toEqual([]);
    fixture.destroy();
  });

  it('extracts values and labels from nested paths for selection', fakeAsync(() => {
    const { fixture, component } = create({
      options: [
        { key: 'a', title: { text: 'Alpha' } },
        { key: 'b', title: { text: 'Beta' } },
      ],
      optionLabel: 'title.text',
      optionValue: 'key',
    });
    const changed: unknown[] = [];
    component.registerOnChange((value) => changed.push(value));
    component.selectOption(
      { key: 'b', title: { text: 'Beta' } },
      new Event('click'),
    );
    expect(component.value()).toBe('b');
    expect(changed).toEqual(['b']);
    expect(component.selectedLabel()).toBe('Beta');
    fixture.destroy();
    tick();
  }));
});
