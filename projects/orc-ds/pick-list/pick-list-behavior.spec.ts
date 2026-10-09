import { TestBed } from '@angular/core/testing';
import { PickListComponent } from '@ciag/orchestra/pick-list';

describe('PickList transfer focus', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PickListComponent],
    }).compileComponents(),
  );

  it('moves focus to the first transferred option after a selected transfer', async () => {
    const fixture = TestBed.createComponent(
      PickListComponent<{ value: string; label: string }>,
    );
    fixture.componentRef.setInput('source', [
      { value: 'calendar', label: 'Calendar' },
      { value: 'tree', label: 'Tree View' },
    ]);
    fixture.componentRef.setInput('target', [
      { value: 'button', label: 'Button' },
    ]);
    fixture.componentInstance.sourceSelected.set(new Set(['calendar']));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const firstTransfer = root.querySelector(
      '.actions button[aria-label="Move selected to target"]',
    ) as HTMLButtonElement;
    firstTransfer.focus();
    firstTransfer.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const movedOption = root.querySelector(
      '[data-orc-option-value="calendar"]',
    ) as HTMLElement;
    expect(
      fixture.componentInstance.source().map((item) => item.value),
    ).toEqual(['tree']);
    expect(
      fixture.componentInstance.target().map((item) => item.value),
    ).toEqual(['button', 'calendar']);
    expect(document.activeElement).toBe(movedOption);
  });
});
