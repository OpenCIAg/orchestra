import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { TabMenuComponent, TabMenuItem } from './tab-menu.component';

describe('TabMenuComponent', () => {
  let fixture: ComponentFixture<TabMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabMenuComponent],
    }).compileComponents();
  });

  function create(items: TabMenuItem[]): TabMenuComponent {
    fixture = TestBed.createComponent(TabMenuComponent);
    fixture.componentRef.setInput('model', items);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function buttons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button'));
  }

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button, a'));
  }

  it('selects the first visible and enabled item when the leading items cannot be selected', () => {
    const hidden = { label: 'Hidden', visible: false };
    const disabled = { label: 'Disabled', disabled: true };
    const selected = { label: 'Selected' };
    const component = create([hidden, disabled, selected]);

    expect(component.isActive(hidden)).toBeFalse();
    expect(component.isActive(disabled)).toBeFalse();
    expect(component.isActive(selected)).toBeTrue();
    expect(buttons().map((button) => button.textContent?.trim())).toEqual([
      'Disabled',
      'Selected',
    ]);
    expect(buttons().map((button) => button.tabIndex)).toEqual([-1, 0]);
  });

  it('leaves every item unfocusable when all visible items are disabled', () => {
    const component = create([
      { label: 'First', disabled: true },
      { label: 'Second', disabled: true },
    ]);

    expect(component.selectedItem()).toBeUndefined();
    expect(buttons().every((button) => button.disabled)).toBeTrue();
    expect(buttons().map((button) => button.tabIndex)).toEqual([-1, -1]);
    expect(
      buttons().every(
        (button) => button.getAttribute('aria-selected') === 'false',
      ),
    ).toBeTrue();
  });

  it('keeps fallback selection and roving tabindex coherent when the model changes', () => {
    const first = { label: 'First' };
    const second = { label: 'Second' };
    const replacement = { label: 'Replacement' };
    const component = create([first, second]);

    component.activeItem.set(second);
    fixture.detectChanges();
    fixture.componentRef.setInput('model', [
      { label: 'Hidden', visible: false },
      { label: 'Disabled', disabled: true },
      replacement,
    ]);
    fixture.detectChanges();

    expect(component.isActive(second)).toBeFalse();
    expect(component.isActive(replacement)).toBeTrue();
    expect(buttons().map((button) => button.tabIndex)).toEqual([-1, 0]);
  });

  it('provides a default navigation name while honoring explicit labels', () => {
    create([{ label: 'Home' }]);
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Tab menu');

    fixture.componentRef.setInput('ariaLabel', 'Primary navigation');
    fixture.detectChanges();
    expect(nav.getAttribute('aria-label')).toBe('Primary navigation');

    fixture.componentRef.setInput('ariaLabelledBy', 'page-heading');
    fixture.detectChanges();
    expect(nav.getAttribute('aria-label')).toBeNull();
    expect(nav.getAttribute('aria-labelledby')).toBe('page-heading');
  });

  it('moves through visible enabled items, emits selection, and prevents a cancelable arrow key', () => {
    const command = jasmine.createSpy('command');
    const first = { label: 'First' };
    const disabled = { label: 'Disabled', disabled: true };
    const second = { label: 'Second', command };
    const component = create([first, disabled, second]);
    const selected = jasmine.createSpy('selected');
    component.itemSelect.subscribe(selected);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });

    buttons()[0].dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBeTrue();
    expect(component.activeItem()).toBe(second);
    expect(component.isActive(second)).toBeTrue();
    expect(selected).toHaveBeenCalledOnceWith(second);
    expect(buttons()[2].tabIndex).toBe(0);
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(
      buttons()[2],
    );
    expect(command).toHaveBeenCalledOnceWith(event);
  });

  it('reverses horizontal arrow navigation in RTL and still activates the target', () => {
    const first = { label: 'First' };
    const second = { label: 'Second' };
    const third = { label: 'Third' };
    const component = create([first, second, third]);
    const selected = jasmine.createSpy('selected');
    component.itemSelect.subscribe(selected);
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    nav.setAttribute('dir', 'rtl');
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });

    buttons()[1].dispatchEvent(event);
    fixture.detectChanges();

    expect(component.activeItem()).toBe(first);
    expect(selected).toHaveBeenCalledOnceWith(first);
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(
      buttons()[0],
    );
  });

  it('resolves RTL from a same-origin iframe target realm', () => {
    const component = create([{ label: 'First' }]);
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    if (!frameDocument)
      throw new Error('same-origin iframe document unavailable');
    const target = frameDocument.createElement('button');
    target.setAttribute('dir', 'rtl');
    frameDocument.body.appendChild(target);

    expect(
      (
        component as unknown as { isRtl: (value: EventTarget) => boolean }
      ).isRtl(target),
    ).toBeTrue();
    iframe.remove();
  });

  it('binds routerLink items to Angular RouterLink and does not invent panel controls', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const item = { label: 'Settings', routerLink: ['/settings'] };
    create([item]);

    expect(fixture.debugElement.query(By.directive(RouterLink))).toBeTruthy();
    expect(items()[0].tagName).toBe('A');
    expect(items()[0].getAttribute('aria-controls')).toBeNull();
  });

  it('navigates through a routerLink button when clicked', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'settings', component: TabMenuComponent }]),
      ],
    });
    const router = TestBed.inject(Router);
    const item = { label: 'Settings', routerLink: ['/settings'] };
    create([item]);

    items()[0].click();
    await fixture.whenStable();

    expect(router.url).toBe('/settings');
  });

  it('navigates and selects the routed target during automatic arrow activation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'first', component: TabMenuComponent },
          { path: 'second', component: TabMenuComponent },
        ]),
      ],
    });
    const first = { label: 'First', routerLink: ['/first'] };
    const second = { label: 'Second', routerLink: ['/second'] };
    const component = create([first, second]);
    const router = TestBed.inject(Router);
    const selected = jasmine.createSpy('selected');
    component.itemSelect.subscribe(selected);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });

    items()[0].dispatchEvent(event);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(event.defaultPrevented).toBeTrue();
    expect(router.url).toBe('/second');
    expect(component.activeItem()).toBe(second);
    expect(selected).toHaveBeenCalledOnceWith(second);
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(items()[1]);
  });
});
