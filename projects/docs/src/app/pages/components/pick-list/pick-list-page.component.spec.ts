import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PickListPageComponent } from './pick-list-page.component';

describe('PickList documentation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PickListPageComponent],
      providers: [provideRouter([])],
    }),
  );

  it('renders named panes, filters, disabled content, and responsive shell', () => {
    const fixture = TestBed.createComponent(PickListPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('PickList');
    expect(root.querySelector('[aria-label="Disponíveis"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Selecionados"]')).not.toBeNull();
    expect(root.querySelector('.orc-pick-list--responsive')).not.toBeNull();
    expect(root.querySelector('.orc-pick-list--striped')).not.toBeNull();
    expect(
      (
        root.querySelector('[data-orc-option-value="calendar"]') as HTMLElement
      ).getAttribute('draggable'),
    ).toBe('true');
    expect(
      root
        .querySelector('[data-orc-option-value="locked"]')
        ?.getAttribute('aria-disabled'),
    ).toBe('true');
    expect(root.querySelector('.pick-list-shell')).not.toBeNull();
  });

  it('filters and performs selected then all transfers through the live example', () => {
    const fixture = TestBed.createComponent(PickListPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const sourceFilter = root.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    sourceFilter.value = 'Data';
    sourceFilter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(
      root.querySelectorAll('.list-pane:first-child [role="option"]'),
    ).toHaveSize(1);
    expect(
      root.querySelector('.list-pane:first-child [role="option"]')?.textContent,
    ).toContain('Data Table');

    const filteredOption = root.querySelector(
      '.list-pane:first-child [role="option"]',
    ) as HTMLElement;
    filteredOption.click();
    fixture.detectChanges();
    (
      root.querySelector(
        'button[aria-label="Mover selecionado para selecionados"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.target().map((item) => item.value),
    ).toContain('data-table');
    expect(
      root.querySelector('[data-testid="transfer-status"]')?.textContent,
    ).toContain('1 item');

    sourceFilter.value = '';
    sourceFilter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    (
      root.querySelector(
        'button[aria-label="Mover todos para selecionados"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.source().map((item) => item.value),
    ).toEqual(['locked']);
    expect(
      fixture.componentInstance.target().map((item) => item.value),
    ).toEqual(['button', 'data-table', 'calendar', 'tree']);
  });

  it('disables the live example without changing the controlled lists', () => {
    const fixture = TestBed.createComponent(PickListPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const toggle = root.querySelector(
      '.toggle-label input',
    ) as HTMLInputElement;
    toggle.click();
    fixture.detectChanges();
    expect(
      root
        .querySelector('.pick-list-shell section.orc-pick-list')
        ?.getAttribute('aria-disabled'),
    ).toBe('true');
    expect(
      fixture.componentInstance.source().map((item) => item.value),
    ).toEqual(['calendar', 'data-table', 'locked', 'tree']);
  });
});
