import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbItemComponent } from './breadcrumb-item.component';

@Component({
  standalone: true,
  imports: [BreadcrumbComponent, BreadcrumbItemComponent],
  template: `<orc-breadcrumb ariaLabel="Projected trail">
    <orc-breadcrumb-item label="Home" href="/" />
    <orc-breadcrumb-item label="Disabled" [disabled]="true" />
    <orc-breadcrumb-item label="Current" [active]="true" />
  </orc-breadcrumb>`,
})
class ProjectedBreadcrumbHost {}

describe('BreadcrumbComponent browser behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [provideRouter([])],
    }),
  );

  function create(): ComponentFixture<BreadcrumbComponent> {
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('names the collapse control, expands the complete model, and marks only the last item current', () => {
    const fixture = create();
    fixture.componentRef.setInput('items', [
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'Invoices', url: '/invoices' },
      { label: 'Current' },
    ]);
    fixture.componentRef.setInput('maxItems', 3);
    fixture.componentRef.setInput('styleClass', 'consumer-trail');
    fixture.componentRef.setInput('separator', 'slash');
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const expand = fixture.nativeElement.querySelector(
      '.orc-breadcrumb__ellipsis-btn',
    ) as HTMLButtonElement;
    expect(nav.classList).toContain('consumer-trail');
    expect(expand.getAttribute('aria-label')).toBe('Expand breadcrumb');
    expect(
      fixture.nativeElement.querySelectorAll('.orc-breadcrumb__separator')
        .length,
    ).toBe(2);
    expand.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-breadcrumb__ellipsis-btn'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('.orc-breadcrumb__current').length,
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelector('.orc-breadcrumb__current')
        ?.textContent,
    ).toContain('Current');
    expect(
      getComputedStyle(
        fixture.nativeElement.querySelector('.orc-breadcrumb__list'),
      ).flexWrap,
    ).toBe('wrap');
  });

  it('keeps disabled model items noninteractive and follows dynamic model updates', () => {
    const fixture = create();
    fixture.componentRef.setInput('model', [
      { label: 'Home', routerLink: ['/'] },
      { label: 'Disabled', url: '/disabled', disabled: true },
      { label: 'Current' },
    ]);
    fixture.detectChanges();
    const disabled = fixture.nativeElement.querySelector(
      '.orc-breadcrumb__text',
    ) as HTMLElement;
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    expect(disabled.getAttribute('tabindex')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(1);

    fixture.componentRef.setInput('model', [
      { label: 'Dashboard', url: '/dashboard' },
      { label: 'Reports' },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dashboard');
    expect(fixture.nativeElement.textContent).toContain('Reports');
    expect(fixture.nativeElement.textContent).not.toContain('Disabled');
  });

  it('activates generic items from Enter and Space exactly once with native Space suppression', () => {
    const fixture = create();
    const item = { label: 'Intermediate' };
    fixture.componentRef.setInput('items', [item, { label: 'Current' }]);
    fixture.detectChanges();
    const generic = fixture.nativeElement.querySelector(
      '[role="button"]',
    ) as HTMLElement;
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.itemClick.subscribe(selected);

    generic.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    generic.dispatchEvent(space);
    expect(space.defaultPrevented).toBeTrue();
    expect(selected).toHaveBeenCalledTimes(2);
    expect(selected.calls.allArgs().map(([event]) => event.index)).toEqual([
      0, 0,
    ]);
  });

  it('supports projected links/current items, disabled projection, and canonical separators', () => {
    const fixture = TestBed.createComponent(ProjectedBreadcrumbHost);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('orc-breadcrumb-item');
    expect(items.length).toBe(3);
    expect(
      fixture.nativeElement.querySelectorAll('ol > orc-breadcrumb-item').length,
    ).toBe(3);
    expect(
      Array.from(items).every(
        (item) => (item as HTMLElement).getAttribute('role') === 'listitem',
      ),
    ).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('.orc-breadcrumb-item__link')
        ?.tagName,
    ).toBe('A');
    expect(
      fixture.nativeElement
        .querySelector('.orc-breadcrumb-item__current')
        ?.getAttribute('aria-current'),
    ).toBe('page');
    const disabled = fixture.nativeElement.querySelector(
      '.orc-breadcrumb-item__text--disabled',
    ) as HTMLElement;
    expect(disabled.getAttribute('role')).toBeNull();
    expect(disabled.getAttribute('tabindex')).toBeNull();
    const separatorStyle = getComputedStyle(items[1], '::before');
    expect(separatorStyle.content).not.toBe('none');
    expect(separatorStyle.backgroundImage).toContain('data:image');
    const home = fixture.debugElement.queryAll(
      By.directive(BreadcrumbItemComponent),
    )[0].componentInstance as BreadcrumbItemComponent;
    const selected = jasmine.createSpy('selected');
    home.itemClick.subscribe(selected);
    const homeLink = fixture.nativeElement.querySelector(
      '.orc-breadcrumb-item__link',
    ) as HTMLAnchorElement;
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    click.preventDefault();
    homeLink.dispatchEvent(click);
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('forwards Angular router links while preserving the current-page span', () => {
    const fixture = create();
    fixture.componentRef.setInput('items', [
      { label: 'Home', routerLink: ['/home'] },
      { label: 'Current', routerLink: ['/current'] },
    ]);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/home');
    expect(
      fixture.nativeElement.querySelector('.orc-breadcrumb__current')
        ?.textContent,
    ).toContain('Current');
  });
});
