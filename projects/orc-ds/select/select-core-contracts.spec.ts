import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { SelectComponent } from './select.component';

/**
 * Characterization pins for the select contracts the shared list-picker
 * core owns (the value-level filter machine with select's empty-value
 * drop, the extract dataKey equality, skip-disabled roving with wrap, and
 * the detached overlay open/close lifecycle). They pin current behavior
 * and must stay green while the internals move onto the core.
 */
describe('Select list-picker core contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, SelectComponent],
    }).compileComponents();
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-backdrop')
      .forEach((backdrop) => backdrop.remove());
  });

  const create = (
    inputs: Record<string, unknown> = {},
  ): ComponentFixture<SelectComponent> => {
    const fixture = TestBed.createComponent(SelectComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  };

  it('drops empty searchable values before matching, unlike the family zero-reading', () => {
    const fixture = create({
      options: [
        { label: 'No rank', value: 'missing' },
        { label: 'Ten', value: 'ten', rank: '10' },
      ],
      filterBy: 'rank',
      filterMatchMode: 'gte',
    });
    const component = fixture.componentInstance;
    component.searchTerm.set('0');
    // A missing rank never participates: select drops empty values instead
    // of reading them as zero, so only Ten satisfies gte 0.
    expect(
      component.filteredDataOptions().map((option) => option.value),
    ).toEqual(['ten']);
    component.searchTerm.set('5');
    expect(
      component.filteredDataOptions().map((option) => option.value),
    ).toEqual(['ten']);
    fixture.destroy();
  });

  it('searches data options through the description field by default', () => {
    const fixture = create({
      options: [
        { label: 'Alpha', value: 'a', description: 'The first one' },
        { label: 'Beta', value: 'b', description: 'The second one' },
      ],
    });
    const component = fixture.componentInstance;
    component.searchTerm.set('second');
    expect(
      component.filteredDataOptions().map((option) => option.value),
    ).toEqual(['b']);
    fixture.destroy();
  });

  it('extracts dataKey values per side before comparing, so primitives meet keyed objects', () => {
    const fixture = create({
      options: [
        { label: 'Five', value: { id: 5 } },
        { label: 'Seven', value: { id: 7 } },
        { label: 'Plain', value: 5 },
      ],
      dataKey: 'id',
    });
    const component = fixture.componentInstance;

    // Stored primitive meets the object holding the key.
    component.writeValue(5);
    expect(component.isDataOptionSelected(component.options()![0])).toBeTrue();

    // Stored keyed object meets the primitive option value.
    component.writeValue({ id: 5 });
    expect(component.isDataOptionSelected(component.options()![2])).toBeTrue();

    // Different keys stay distinct.
    expect(component.isDataOptionSelected(component.options()![1])).toBeFalse();
    fixture.destroy();
  });

  it('wraps data roving from the last enabled option to the first', () => {
    const fixture = create({
      options: [
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b', disabled: true },
        { label: 'Gamma', value: 'c' },
      ],
    });
    const component = fixture.componentInstance;
    component.openPanel();
    fixture.detectChanges();
    component.activeOptionIndex.set(2);
    component.onKeyDown(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    );
    expect(component.activeOptionIndex()).toBe(0);
    component.onKeyDown(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    );
    // Beta is skipped on the way through.
    expect(component.activeOptionIndex()).toBe(2);
    fixture.destroy();
  });

  it('closes on overlay escape with focus restored, and on backdrop click without it', () => {
    const fixture = create({
      options: [
        { label: 'Alpha', value: 'a' },
        { label: 'Beta', value: 'b' },
      ],
    });
    const component = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;
    trigger.focus();
    component.openPanel();
    fixture.detectChanges();
    const listbox = document.getElementById(component.listboxId())!;
    listbox.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    expect(document.activeElement).toBe(trigger);

    component.openPanel();
    fixture.detectChanges();
    const backdrop = document.querySelector(
      '.cdk-overlay-backdrop',
    ) as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    fixture.destroy();
  });
});
