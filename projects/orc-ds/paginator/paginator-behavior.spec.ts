import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PaginatorComponent } from './paginator.component';

@Component({
  standalone: true,
  imports: [PaginatorComponent],
  template: `<form (submit)="onSubmit($event)">
    <orc-paginator
      [alwaysShow]="true"
      [totalItems]="100"
      [rows]="10"
      [showJumpToPageInput]="true"
    />
  </form>`,
})
class PaginatorFormHost {
  submitCount = 0;

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitCount++;
  }
}

describe('PaginatorComponent behavior', () => {
  function createPaginator(): ComponentFixture<PaginatorComponent> {
    const fixture = TestBed.createComponent(PaginatorComponent);
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('rows', 10);
    fixture.detectChanges();
    return fixture;
  }

  it('keeps rows and pageSize synchronized while allowing a later controlled rows update', () => {
    const fixture = createPaginator();
    const paginator = fixture.componentInstance;

    expect(paginator.rows()).toBe(10);
    expect(paginator.pageSize()).toBe(10);
    const events: unknown[] = [];
    paginator.pageChange.subscribe((event) => events.push(event));

    const pageSizeSelect = fixture.nativeElement.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    pageSizeSelect.value = '20';
    pageSizeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(20);
    expect(paginator.pageSize()).toBe(20);
    expect(events).toEqual([
      jasmine.objectContaining({
        first: 0,
        rows: 20,
        page: 1,
        pageSize: 20,
        totalPages: 5,
        startIndex: 1,
        endIndex: 20,
        totalItems: 100,
      }),
    ]);

    fixture.componentRef.setInput('rows', 25);
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(25);
    expect(paginator.pageSize()).toBe(25);
    expect(pageSizeSelect.value).toBe('25');
  });

  it('uses Portuguese defaults for rendered text, reports, and accessible names', () => {
    const fixture = createPaginator();
    fixture.componentRef.setInput('totalItems', 1_500);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('showFirstLastButtons', true);
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.componentRef.setInput('showJumpToPageInput', true);
    fixture.componentRef.setInput('showTotalInfo', true);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const previous = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--prev',
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--next',
    ) as HTMLButtonElement;
    const first = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--first',
    ) as HTMLButtonElement;
    const last = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--last',
    ) as HTMLButtonElement;
    const page = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--page',
    ) as HTMLButtonElement;
    const pageSize = fixture.nativeElement.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    const jumpGroup = fixture.nativeElement.querySelector(
      '.orc-paginator__jump',
    ) as HTMLElement;
    const jumpSelect = fixture.nativeElement.querySelector(
      '.orc-paginator__jump select',
    ) as HTMLSelectElement;
    const jumpInput = fixture.nativeElement.querySelector(
      '.orc-paginator__jump-input',
    ) as HTMLInputElement;

    expect(nav.getAttribute('lang')).toBe('pt-BR');
    expect(nav.getAttribute('aria-label')).toBe('Paginação');
    expect(first.getAttribute('aria-label')).toBe('Primeira página');
    expect(first.title).toBe('Primeira página');
    expect(last.getAttribute('aria-label')).toBe('Última página');
    expect(last.title).toBe('Última página');
    expect(previous.textContent?.trim()).toBe('Anterior');
    expect(next.textContent?.trim()).toBe('Próximo');
    expect(previous.getAttribute('aria-label')).toBe('Anterior');
    expect(next.getAttribute('aria-label')).toBe('Próximo');
    expect(page.getAttribute('aria-label')).toBe('Página 1');
    expect(jumpGroup.getAttribute('aria-label')).toBe('Ir para a página');
    expect(jumpSelect.getAttribute('aria-label')).toBe('Ir para a página');
    expect(jumpInput.getAttribute('aria-label')).toBe('Número da página');
    expect(pageSize.getAttribute('aria-label')).toBe('Itens por página');
    expect(pageSize.options[0].textContent?.trim()).toBe('10 / Página');
    expect(
      fixture.nativeElement
        .querySelector('.orc-paginator__info')
        .textContent.trim(),
    ).toBe('11-20 de 1.500');
  });

  it('uses English defaults for en locales and preserves explicit label and report overrides', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', 1_500);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('showFirstLastButtons', true);
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.componentRef.setInput('showJumpToPageInput', true);
    fixture.componentRef.setInput('showTotalInfo', true);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const previous = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--prev',
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--next',
    ) as HTMLButtonElement;
    const first = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--first',
    ) as HTMLButtonElement;
    const last = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--last',
    ) as HTMLButtonElement;
    const page = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--page',
    ) as HTMLButtonElement;
    const pageSize = fixture.nativeElement.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    const jumpGroup = fixture.nativeElement.querySelector(
      '.orc-paginator__jump',
    ) as HTMLElement;
    const jumpSelect = fixture.nativeElement.querySelector(
      '.orc-paginator__jump select',
    ) as HTMLSelectElement;
    const jumpInput = fixture.nativeElement.querySelector(
      '.orc-paginator__jump-input',
    ) as HTMLInputElement;

    expect(nav.getAttribute('lang')).toBe('en-US');
    expect(nav.getAttribute('aria-label')).toBe('Pagination');
    expect(previous.textContent?.trim()).toBe('Previous page');
    expect(previous.getAttribute('aria-label')).toBe('Previous page');
    expect(next.textContent?.trim()).toBe('Next page');
    expect(next.getAttribute('aria-label')).toBe('Next page');
    expect(first.getAttribute('aria-label')).toBe('First page');
    expect(first.title).toBe('First page');
    expect(last.getAttribute('aria-label')).toBe('Last page');
    expect(last.title).toBe('Last page');
    expect(page.getAttribute('aria-label')).toBe('Page 1');
    expect(jumpGroup.getAttribute('aria-label')).toBe('Jump to page');
    expect(jumpSelect.getAttribute('aria-label')).toBe('Jump to page');
    expect(jumpInput.getAttribute('aria-label')).toBe('Page number');
    expect(pageSize.getAttribute('aria-label')).toBe('Items per page');
    expect(pageSize.options[0].textContent?.trim()).toBe('10 / page');
    expect(
      fixture.nativeElement
        .querySelector('.orc-paginator__info')
        .textContent.trim(),
    ).toBe('11-20 of 1,500');

    fixture.componentRef.setInput('ariaLabel', ' Search results ');
    fixture.componentRef.setInput('previousLabel', ' Back ');
    fixture.componentRef.setInput('nextLabel', 'Forward');
    fixture.componentRef.setInput('firstLabel', 'Start');
    fixture.componentRef.setInput('lastLabel', 'End');
    fixture.componentRef.setInput('itemsPerPageLabel', 'records');
    fixture.componentRef.setInput('jumpAriaLabel', 'Choose page');
    fixture.componentRef.setInput('pageAriaLabel', 'Go to page');
    fixture.componentRef.setInput('pageNumberAriaLabel', 'Enter page');
    fixture.componentRef.setInput('pageSizeAriaLabel', 'Rows per page');
    fixture.componentRef.setInput(
      'currentPageReportTemplate',
      'Showing {first}–{last} of {totalRecords} (page {currentPage} of {totalPages})',
    );
    fixture.detectChanges();

    expect(nav.getAttribute('aria-label')).toBe('Search results');
    expect(previous.textContent?.trim()).toBe('Back');
    expect(previous.getAttribute('aria-label')).toBe('Back');
    expect(next.textContent?.trim()).toBe('Forward');
    expect(next.getAttribute('aria-label')).toBe('Forward');
    expect(first.getAttribute('aria-label')).toBe('Start');
    expect(first.title).toBe('Start');
    expect(last.getAttribute('aria-label')).toBe('End');
    expect(last.title).toBe('End');
    expect(page.getAttribute('aria-label')).toBe('Go to page 1');
    expect(jumpGroup.getAttribute('aria-label')).toBe('Choose page');
    expect(jumpSelect.getAttribute('aria-label')).toBe('Go to page');
    expect(jumpInput.getAttribute('aria-label')).toBe('Enter page');
    expect(pageSize.getAttribute('aria-label')).toBe('Rows per page');
    expect(pageSize.options[0].textContent?.trim()).toBe('10 / records');
    expect(
      fixture.nativeElement
        .querySelector('.orc-paginator__info')
        .textContent.trim(),
    ).toBe('Showing 11–20 of 1,500 (page 2 of 150)');
  });

  it('uses localized fallback names for empty and whitespace-only label overrides', () => {
    const fixture = createPaginator();
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('showFirstLastButtons', true);
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.componentRef.setInput('showJumpToPageInput', true);
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('previousLabel', '  ');
    fixture.componentRef.setInput('nextLabel', '\t');
    fixture.componentRef.setInput('firstLabel', ' \n ');
    fixture.componentRef.setInput('lastLabel', '');
    fixture.componentRef.setInput('pageAriaLabel', '  ');
    fixture.componentRef.setInput('jumpAriaLabel', ' \t ');
    fixture.componentRef.setInput('pageNumberAriaLabel', ' ');
    fixture.componentRef.setInput('pageSizeAriaLabel', '\n');
    fixture.componentRef.setInput('itemsPerPageLabel', '   ');
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const previous = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--prev',
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--next',
    ) as HTMLButtonElement;
    const first = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--first',
    ) as HTMLButtonElement;
    const last = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--last',
    ) as HTMLButtonElement;
    const page = fixture.nativeElement.querySelector(
      '.orc-paginator__btn--page',
    ) as HTMLButtonElement;
    const pageSize = fixture.nativeElement.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    const jumpGroup = fixture.nativeElement.querySelector(
      '.orc-paginator__jump',
    ) as HTMLElement;
    const jumpSelect = fixture.nativeElement.querySelector(
      '.orc-paginator__jump select',
    ) as HTMLSelectElement;
    const jumpInput = fixture.nativeElement.querySelector(
      '.orc-paginator__jump-input',
    ) as HTMLInputElement;

    expect(nav.getAttribute('aria-label')).toBe('Pagination');
    expect(previous.textContent?.trim()).toBe('Previous page');
    expect(previous.getAttribute('aria-label')).toBe('Previous page');
    expect(next.textContent?.trim()).toBe('Next page');
    expect(next.getAttribute('aria-label')).toBe('Next page');
    expect(first.getAttribute('aria-label')).toBe('First page');
    expect(first.title).toBe('First page');
    expect(last.getAttribute('aria-label')).toBe('Last page');
    expect(last.title).toBe('Last page');
    expect(page.getAttribute('aria-label')).toBe('Page 1');
    expect(jumpGroup.getAttribute('aria-label')).toBe('Jump to page');
    expect(jumpSelect.getAttribute('aria-label')).toBe('Jump to page');
    expect(jumpInput.getAttribute('aria-label')).toBe('Page number');
    expect(pageSize.getAttribute('aria-label')).toBe('Items per page');
    expect(pageSize.options[0].textContent?.trim()).toBe('10 / page');
  });

  it('lets a controlled pageSize update replace a previous local selector choice', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', 100);
    fixture.detectChanges();

    const pageSizeSelect = fixture.nativeElement.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    pageSizeSelect.value = '20';
    pageSizeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(20);

    fixture.componentRef.setInput('pageSize', 25);
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(25);
    expect(paginator.pageSize()).toBe(25);
  });

  it('resolves simultaneous rows and pageSize changes in favor of the changed pageSize model', () => {
    const fixture = createPaginator();
    const paginator = fixture.componentInstance;

    fixture.componentRef.setInput('pageSize', 25);
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(25);

    fixture.componentRef.setInput('rows', 30);
    fixture.componentRef.setInput('pageSize', 40);
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(40);
    expect(paginator.pageSize()).toBe(40);

    fixture.componentRef.setInput('rows', 50);
    fixture.detectChanges();
    expect(paginator.effectivePageSize()).toBe(50);
    expect(paginator.pageSize()).toBe(50);
  });

  it('reconciles controlled first and currentPage models and clamps out-of-range values', () => {
    const fixture = createPaginator();
    const paginator = fixture.componentInstance;

    fixture.componentRef.setInput('first', 40);
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(5);
    expect(paginator.first()).toBe(40);

    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(2);
    expect(paginator.first()).toBe(10);

    fixture.componentRef.setInput('currentPage', 99);
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(10);
    expect(paginator.first()).toBe(90);

    fixture.componentRef.setInput('first', 999);
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(10);
    expect(paginator.first()).toBe(90);
  });

  it('accepts controlled page and zero-based pageIndex aliases', () => {
    const fixture = createPaginator();
    const paginator = fixture.componentInstance;

    fixture.componentRef.setInput('pageIndex', 2);
    fixture.detectChanges();
    expect(paginator.pageIndex()).toBe(2);
    expect(paginator.currentPage()).toBe(3);
    expect(paginator.first()).toBe(20);

    fixture.componentRef.setInput('page', 5);
    fixture.detectChanges();
    expect(paginator.page()).toBe(5);
    expect(paginator.currentPage()).toBe(5);
    expect(paginator.first()).toBe(40);
  });

  it('keeps visible page links bounded, valid, unique, and active for small link sizes', () => {
    const fixture = createPaginator();
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('totalItems', 20);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('maxVisiblePages', 1);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();

    expect(paginator.visiblePages()).toEqual([2]);
    const pageButtons = [
      ...(fixture.nativeElement.querySelectorAll(
        '.orc-paginator__btn--page',
      ) as NodeListOf<HTMLButtonElement>),
    ];
    expect(pageButtons.map((button) => button.textContent?.trim())).toEqual([
      '2',
    ]);

    fixture.componentRef.setInput('maxVisiblePages', 3);
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();
    const pages = paginator.visiblePages();
    const numbers = pages.filter((page): page is number => page !== 'ellipsis');
    expect(numbers.length).toBeLessThanOrEqual(3);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(
      numbers.every((page) => page >= 1 && page <= paginator.totalPages()),
    ).toBeTrue();
    expect(numbers).toContain(5);
  });

  it('honors PrimeNG aliases, selector options, report toggles, link visibility, and visual inputs', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('totalRecords', 120);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('pageSizeOptions', [2, 4]);
    fixture.componentRef.setInput('rowsPerPageOptions', [5, 20]);
    fixture.componentRef.setInput('pageLinkSize', 3);
    fixture.componentRef.setInput('currentPage', 6);
    fixture.componentRef.setInput('showFirstLastIcon', true);
    fixture.componentRef.setInput('showPrevNextButtons', false);
    fixture.componentRef.setInput('showCurrentPageReport', true);
    fixture.componentRef.setInput('showPageLinks', false);
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('styleClass', 'results-paginator');
    fixture.componentRef.setInput('style', { color: 'rgb(1, 2, 3)' });
    fixture.detectChanges();

    expect(paginator.effectiveTotalRecords()).toBe(120);
    expect(paginator.effectivePageLinkSize()).toBe(3);
    expect(paginator.visiblePages()).toEqual([
      1,
      'ellipsis',
      6,
      'ellipsis',
      12,
    ]);

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.classList.contains('results-paginator')).toBeTrue();
    expect(nav.classList.contains('orc-paginator--lg')).toBeTrue();
    expect(nav.style.color).toBe('rgb(1, 2, 3)');
    expect(nav.querySelector('.orc-paginator__btn--first')).not.toBeNull();
    expect(nav.querySelector('.orc-paginator__btn--last')).not.toBeNull();
    expect(nav.querySelector('.orc-paginator__btn--prev')).toBeNull();
    expect(nav.querySelector('.orc-paginator__btn--next')).toBeNull();
    expect(nav.querySelector('.orc-paginator__btn--page')).toBeNull();
    expect(nav.querySelector('.orc-paginator__info')?.textContent?.trim()).toBe(
      '51-60 de 120',
    );

    const pageSize = nav.querySelector(
      '.orc-paginator__select',
    ) as HTMLSelectElement;
    expect([...pageSize.options].map((option) => option.value)).toEqual([
      '10',
      '5',
      '20',
    ]);

    fixture.componentRef.setInput('rowsPerPageOptions', undefined);
    fixture.detectChanges();
    expect([...pageSize.options].map((option) => option.value)).toEqual([
      '10',
      '2',
      '4',
    ]);

    fixture.componentRef.setInput('showPageSizeSelector', false);
    fixture.detectChanges();
    expect(nav.querySelector('.orc-paginator__page-size')).toBeNull();
  });

  it('reports empty and partially filled ranges with stable page counts', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', 0);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('showTotalInfo', true);
    fixture.componentRef.setInput(
      'currentPageReportTemplate',
      '{first}-{last} / {totalRecords} ({currentPage}/{totalPages})',
    );
    fixture.detectChanges();

    expect(paginator.totalPages()).toBe(1);
    expect(paginator.startIndex()).toBe(0);
    expect(paginator.endIndex()).toBe(0);
    expect(
      fixture.nativeElement
        .querySelector('.orc-paginator__info')
        .textContent.trim(),
    ).toBe('0-0 / 0 (1/1)');

    fixture.componentRef.setInput('totalItems', 15);
    fixture.componentRef.setInput('currentPage', 99);
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(2);
    expect(paginator.first()).toBe(10);
    expect(paginator.startIndex()).toBe(11);
    expect(paginator.endIndex()).toBe(15);
  });

  it('renders a useful default range report, including the empty range', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', 0);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('showTotalInfo', true);
    fixture.detectChanges();

    expect(paginator.pageReport()).toBe('0-0 de 0');
    expect(
      fixture.nativeElement
        .querySelector('.orc-paginator__info')
        .textContent.trim(),
    ).toBe('0-0 de 0');

    fixture.componentRef.setInput('totalItems', 25);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    expect(paginator.pageReport()).toBe('11-20 de 25');
  });

  it('coerces invalid numeric inputs to safe finite values', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalItems', -4);
    fixture.componentRef.setInput('pageSize', 0);
    fixture.componentRef.setInput('first', Number.NaN);
    fixture.componentRef.setInput('currentPage', Number.POSITIVE_INFINITY);
    fixture.detectChanges();

    expect(paginator.effectiveTotalRecords()).toBe(0);
    expect(paginator.effectivePageSize()).toBe(1);
    expect(paginator.totalPages()).toBe(1);
    expect(paginator.currentPage()).toBe(1);
    expect(paginator.first()).toBe(0);
    expect(() => paginator.goToPage(Number.NaN)).not.toThrow();
  });

  it('uses native controls for navigation, labels every control, and honors disabled state', () => {
    const fixture = createPaginator();
    const paginator = fixture.componentInstance;
    const events: unknown[] = [];
    paginator.pageChange.subscribe((event) => events.push(event));

    const pageTwo = [
      ...(fixture.nativeElement.querySelectorAll(
        '.orc-paginator__btn--page',
      ) as NodeListOf<HTMLButtonElement>),
    ].find((button) => button.textContent?.trim() === '2');
    expect(pageTwo).toBeDefined();
    pageTwo!.click();
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(2);
    expect(events).toEqual([
      jasmine.objectContaining({ first: 10, rows: 10, page: 2, pageSize: 10 }),
    ]);

    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.componentRef.setInput('showJumpToPageInput', true);
    fixture.detectChanges();
    const jumpInput = fixture.nativeElement.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    jumpInput.value = '3';
    jumpInput.dispatchEvent(new Event('input', { bubbles: true }));
    jumpInput.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(3);
    const controls = [
      ...(fixture.nativeElement.querySelectorAll(
        'button, select, input',
      ) as NodeListOf<
        HTMLButtonElement | HTMLSelectElement | HTMLInputElement
      >),
    ];
    expect(
      controls.every((control) => !!control.getAttribute('aria-label')),
    ).toBeTrue();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(controls.every((control) => control.disabled)).toBeTrue();
    const pageBeforeDisabled = paginator.currentPage();
    controls[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(paginator.currentPage()).toBe(pageBeforeDisabled);
  });

  it('jumps once from a host form, ignores blank or invalid input, and clamps finite values', () => {
    const fixture = TestBed.createComponent(PaginatorFormHost);
    fixture.detectChanges();
    const paginator = fixture.debugElement.query(
      By.directive(PaginatorComponent),
    ).componentInstance as PaginatorComponent;
    const input = fixture.nativeElement.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    const events: unknown[] = [];
    paginator.pageChange.subscribe((event) => events.push(event));

    input.value = '4';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(enter);
    fixture.detectChanges();

    expect(enter.defaultPrevented).toBeTrue();
    expect(paginator.currentPage()).toBe(4);
    expect(events.length).toBe(1);
    expect(fixture.componentInstance.submitCount).toBe(0);

    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(paginator.currentPage()).toBe(4);
    expect(events.length).toBe(1);

    paginator.jumpPageInput.set('invalid');
    paginator.jumpToPage();
    expect(paginator.currentPage()).toBe(4);
    expect(events.length).toBe(1);

    paginator.jumpPageInput.set('0');
    paginator.jumpToPage();
    expect(paginator.currentPage()).toBe(1);
    expect(events.length).toBe(2);

    paginator.jumpPageInput.set('99');
    paginator.jumpToPage();
    expect(paginator.currentPage()).toBe(10);
    expect(paginator.first()).toBe(90);
    expect(events.length).toBe(3);
  });

  it('bounds jump dropdown options for large totals and keeps arbitrary page entry available', () => {
    const fixture = TestBed.createComponent(PaginatorComponent);
    const paginator = fixture.componentInstance;
    fixture.componentRef.setInput('alwaysShow', true);
    fixture.componentRef.setInput('totalRecords', 1_000_000);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('showJumpToPageDropdown', true);
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector(
      '.orc-paginator__jump select',
    ) as HTMLSelectElement;
    const jumpInput = fixture.nativeElement.querySelector(
      '.orc-paginator__jump-input',
    ) as HTMLInputElement;
    expect(dropdown.options.length).toBeLessThanOrEqual(7);
    expect(jumpInput).not.toBeNull();
    expect(jumpInput.max).toBe('100000');

    const events: unknown[] = [];
    paginator.pageChange.subscribe((event) => events.push(event));
    jumpInput.value = '99999';
    jumpInput.dispatchEvent(new Event('input', { bubbles: true }));
    jumpInput.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(paginator.first()).toBe(999_980);
    expect(events).toEqual([
      jasmine.objectContaining({ first: 999_980, rows: 10 }),
    ]);
  });

  it('does not retain subscriptions or throw during fixture teardown', () => {
    const fixture = createPaginator();
    fixture.destroy();
    expect(() => fixture.destroy()).not.toThrow();
  });
});
