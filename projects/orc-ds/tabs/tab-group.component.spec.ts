import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComponent } from './tab.component';
import { TabGroupComponent } from './tab-group.component';

@Component({
  standalone: true,
  imports: [TabGroupComponent, TabComponent],
  template: `<orc-tab-group
      [(selectedIndex)]="selectedIndex"
      [(value)]="value"
      [selectOnFocus]="selectOnFocus()"
      [attr.dir]="direction()"
      [scrollable]="scrollable()"
      [autoHideButtons]="autoHideButtons()"
      [lazy]="lazy()"
      [controlClose]="controlClose()"
      [fullWidth]="fullWidth()"
      [tabindex]="tabindex()"
      [prevButtonAriaLabel]="prevLabel()"
      [nextButtonAriaLabel]="nextLabel()"
      (tabChange)="changes.push($event)"
      (onClose)="closes.push($event)"
    >
      @if (showFirst()) {
        <orc-tab
          id="first"
          [label]="firstLabel()"
          [disabled]="allDisabled()"
          [closable]="true"
        >
          First content
        </orc-tab>
      }
      @if (showSecond()) {
        <orc-tab
          id="second"
          [label]="secondLabel()"
          [disabled]="allDisabled() || secondDisabled()"
          [closable]="true"
        >
          Second content
        </orc-tab>
      }
      @if (showThird()) {
        <orc-tab
          id="third"
          [label]="thirdLabel()"
          [disabled]="allDisabled()"
          [closable]="true"
          [cache]="false"
        >
          Third content
        </orc-tab>
      }</orc-tab-group
    ><input id="unaffected" />`,
})
class TabHost {
  selectedIndex = signal(0);
  value = signal<string | number | undefined>(undefined);
  selectOnFocus = signal(false);
  direction = signal<'ltr' | 'rtl'>('ltr');
  secondDisabled = signal(false);
  allDisabled = signal(false);
  scrollable = signal(false);
  autoHideButtons = signal(true);
  lazy = signal(false);
  controlClose = signal(false);
  fullWidth = signal(false);
  tabindex = signal(0);
  prevLabel = signal<string | undefined>(undefined);
  nextLabel = signal<string | undefined>(undefined);
  showFirst = signal(true);
  showSecond = signal(true);
  showThird = signal(true);
  firstLabel = signal('First');
  secondLabel = signal('Second');
  thirdLabel = signal('Third');
  changes: unknown[] = [];
  closes: unknown[] = [];
}

describe('TabGroupComponent browser behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TabGroupComponent, TabComponent],
    }),
  );

  function create(
    initialize?: (host: TabHost) => void,
  ): ComponentFixture<TabHost> {
    const fixture = TestBed.createComponent(TabHost);
    initialize?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('resolves external aliases deterministically and does not emit for writes', async () => {
    const fixture = create();
    const group = fixture.nativeElement.querySelector(
      'orc-tab-group',
    ) as HTMLElement;
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;

    fixture.componentInstance.selectedIndex.set(2);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.activeIndex()).toBe(2);
    fixture.componentInstance.value.set('first');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.activeIndex()).toBe(0);
    expect(fixture.componentInstance.changes).toHaveSize(0);
    expect(group.querySelectorAll('[role="tab"][tabindex="0"]')).toHaveSize(1);
    expect(
      group.querySelector('[role="tablist"]')?.getAttribute('tabindex'),
    ).toBeNull();
  });

  it('settles initial and simultaneous alias writes through a two-way consumer', async () => {
    const fixture = create((host) => {
      host.selectedIndex.set(1);
      host.value.set('third');
    });
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    await fixture.whenStable();
    expect(component.activeIndex()).toBe(2);
    expect(fixture.componentInstance.selectedIndex()).toBe(1);
    expect(fixture.componentInstance.value()).toBe('third');

    const tabs = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIndex()).toBe(0);
    expect(fixture.componentInstance.value()).toBe(0);
    expect(fixture.componentInstance.changes).toHaveSize(1);

    fixture.componentInstance.selectedIndex.set(1);
    fixture.componentInstance.value.set('third');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.activeIndex()).toBe(2);
    expect(fixture.componentInstance.changes).toHaveSize(1);
  });

  it('selects once on native focus navigation and skips disabled tabs', async () => {
    const fixture = create();
    fixture.componentInstance.selectOnFocus.set(true);
    fixture.componentInstance.secondDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].focus();
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons[0].dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(buttons[2]);
    expect(fixture.componentInstance.changes).toHaveSize(1);
    expect(
      (fixture.componentInstance.changes[0] as { index: number }).index,
    ).toBe(2);
  });

  it('does not emit twice when select-on-focus is followed by the native click', async () => {
    const fixture = create();
    fixture.componentInstance.selectOnFocus.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    )[1] as HTMLButtonElement;
    button.focus();
    button.click();
    expect(fixture.componentInstance.changes).toHaveSize(1);
  });

  it('keeps manual focus roving separate from selection and honors RTL arrows', async () => {
    const fixture = create();
    const buttons = () =>
      fixture.nativeElement.querySelectorAll(
        '[role="tab"]',
      ) as NodeListOf<HTMLButtonElement>;
    buttons()[0].focus();
    const manual = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons()[0].dispatchEvent(manual);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons()[1]);
    expect(fixture.componentInstance.changes).toHaveSize(0);
    expect(buttons()[1].tabIndex).toBe(0);
    expect(buttons()[0].tabIndex).toBe(-1);

    fixture.componentInstance.direction.set('rtl');
    fixture.detectChanges();
    await fixture.whenStable();
    const rtl = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    buttons()[1].dispatchEvent(rtl);
    expect(document.activeElement).toBe(buttons()[2]);
  });

  it('uses an independent native close button and keeps projected content lazy-safe', () => {
    const fixture = create();
    const group = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    const close = fixture.nativeElement.querySelectorAll(
      '.orc-tab-group__close',
    )[1] as HTMLButtonElement;
    expect(close.tagName).toBe('BUTTON');
    expect(close.type).toBe('button');
    expect(close.closest('[role="tab"]')).toBeNull();
    expect(group.loadedTabs.size).toBeGreaterThan(0);
    close.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.closes).toHaveSize(1);
    expect(fixture.componentInstance.changes).toHaveSize(0);
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]')).toHaveSize(
      2,
    );
  });

  it('does not expose a disabled tab as the keyboard entry point', async () => {
    const fixture = create();
    fixture.componentInstance.allDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('[role="tab"][tabindex="0"]'),
    ).toHaveSize(0);
  });

  it('honors the public tabindex on the roving tab while keeping the tablist itself unfocusable', async () => {
    const fixture = create();
    fixture.componentInstance.tabindex.set(-1);
    fixture.detectChanges();
    await fixture.whenStable();
    const group = fixture.nativeElement.querySelector(
      'orc-tab-group',
    ) as HTMLElement;
    expect(
      group.querySelector('[role="tablist"]')?.getAttribute('tabindex'),
    ).toBeNull();
    expect(group.querySelector('[role="tab"][tabindex="0"]')).toBeNull();
    expect(group.querySelector('[role="tab"][tabindex="-1"]')).not.toBeNull();
  });

  it('moves the roving entry point to an enabled tab when the controlled tab is disabled', async () => {
    const fixture = create();
    fixture.componentInstance.secondDisabled.set(true);
    fixture.componentInstance.selectedIndex.set(1);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="tab"][tabindex="0"]')?.id,
    ).toBe('third');
  });

  it('creates active lazy content, retains cached content, and drops uncached content', async () => {
    const fixture = create();
    fixture.componentInstance.lazy.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    const panels = () =>
      fixture.nativeElement.querySelectorAll(
        '[role="tabpanel"]',
      ) as NodeListOf<HTMLElement>;
    expect(panels()[0].textContent).toContain('First content');
    expect(panels()[1].textContent).not.toContain('Second content');

    (
      fixture.nativeElement.querySelectorAll('[role="tab"]')[1] as
        HTMLButtonElement | undefined
    )?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(panels()[1].textContent).toContain('Second content');
    expect(component.loadedTabs.size).toBe(2);

    (
      fixture.nativeElement.querySelectorAll('[role="tab"]')[2] as
        HTMLButtonElement | undefined
    )?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(panels()[2].textContent).toContain('Third content');
    (
      fixture.nativeElement.querySelectorAll('[role="tab"]')[1] as
        HTMLButtonElement | undefined
    )?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(panels()[2].textContent).not.toContain('Third content');
  });

  it('preserves active tab identity and chooses an enabled neighbor after close', async () => {
    const fixture = create();
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    fixture.componentInstance.secondDisabled.set(true);
    fixture.detectChanges();
    const closeButtons = () =>
      fixture.nativeElement.querySelectorAll(
        '.orc-tab-group__close',
      ) as NodeListOf<HTMLButtonElement>;
    closeButtons()[0].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="tab"][aria-selected="true"]')
        ?.id,
    ).toBe('third');
  });

  it('does not steal focus from an unaffected control and cancels deferred recovery', async () => {
    const fixture = create();
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    const outside = fixture.nativeElement.querySelector(
      '#unaffected',
    ) as HTMLInputElement;
    outside.focus();
    component.closeTab(1, new Event('click'));
    await Promise.resolve();
    expect(document.activeElement).toBe(outside);

    const close = fixture.nativeElement.querySelector(
      '.orc-tab-group__close',
    ) as HTMLButtonElement;
    close.focus();
    const closeEvent = new Event('click');
    Object.defineProperty(closeEvent, 'target', { value: close });
    component.closeTab(0, closeEvent);
    fixture.detectChanges();
    outside.focus();
    // A later close invalidates the first close's deferred recovery as well.
    (
      fixture.nativeElement.querySelector('.orc-tab-group__close') as
        HTMLButtonElement | undefined
    )?.click();
    outside.focus();
    await Promise.resolve();
    expect(document.activeElement).toBe(outside);

    const destroyFixture = create();
    const destroyClose = destroyFixture.nativeElement.querySelector(
      '.orc-tab-group__close',
    ) as HTMLButtonElement;
    destroyClose.focus();
    destroyClose.click();
    destroyFixture.destroy();
    await Promise.resolve();
    fixture.destroy();
  });

  it('leaves closure to the consumer when controlClose is enabled', async () => {
    const fixture = create();
    fixture.componentInstance.controlClose.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const close = fixture.nativeElement.querySelectorAll(
      '.orc-tab-group__close',
    )[1] as HTMLButtonElement;
    close.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.closes).toHaveSize(1);
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]')).toHaveSize(
      3,
    );
  });

  it('recovers active identity and entry focus as projected tabs shrink to empty', async () => {
    const fixture = create();
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    const observedItems = () =>
      (component as unknown as { observedTabItems: Set<HTMLElement> })
        .observedTabItems;
    expect(observedItems().size).toBe(3);
    fixture.componentInstance.selectedIndex.set(2);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.showThird.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(observedItems().size).toBe(2);
    expect(
      fixture.nativeElement.querySelector('[role="tab"][aria-selected="true"]')
        ?.id,
    ).toBe('second');

    fixture.componentInstance.showSecond.set(false);
    fixture.componentInstance.showFirst.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]')).toHaveSize(
      0,
    );
    expect(
      fixture.nativeElement.querySelectorAll('[role="tab"][tabindex="0"]'),
    ).toHaveSize(0);
    fixture.destroy();
    expect(observedItems().size).toBe(0);
  });

  it('keeps full-width tab items equal with different labels and close controls', async () => {
    const fixture = create();
    fixture.componentInstance.fullWidth.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('.orc-tab-group__tab-item'),
    ) as HTMLElement[];
    const widths = items.map((item) => item.getBoundingClientRect().width);
    expect(widths.every((width) => width > 0)).toBeTrue();
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2);
  });

  it('renders named bounded overflow controls and scrolls the tab header', () => {
    const fixture = create();
    fixture.componentInstance.scrollable.set(true);
    fixture.componentInstance.autoHideButtons.set(false);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    const header = fixture.nativeElement.querySelector(
      '[role="tablist"]',
    ) as HTMLElement;
    spyOnProperty(header, 'clientWidth', 'get').and.returnValue(100);
    spyOnProperty(header, 'scrollWidth', 'get').and.returnValue(300);
    Object.defineProperty(header, 'scrollLeft', {
      configurable: true,
      value: 0,
      writable: true,
    });
    component.updateNavigation();
    fixture.detectChanges();
    const next = fixture.nativeElement.querySelector(
      '.orc-tab-group__navigator--next',
    ) as HTMLButtonElement;
    const previous = fixture.nativeElement.querySelector(
      '.orc-tab-group__navigator--previous',
    ) as HTMLButtonElement;
    fixture.componentInstance.nextLabel.set('Scroll newer tabs');
    fixture.componentInstance.prevLabel.set('Scroll older tabs');
    fixture.detectChanges();
    expect(next.getAttribute('aria-label')).toBe('Scroll newer tabs');
    expect(previous.getAttribute('aria-label')).toBe('Scroll older tabs');
    expect(next.disabled).toBeFalse();
    expect(previous.disabled).toBeTrue();
    next.click();
    expect(header.scrollLeft).toBe(80);
    header.scrollLeft = 190;
    next.click();
    expect(header.scrollLeft).toBe(200);
  });

  it('tracks real label overflow changes and uses logical RTL scrolling', async () => {
    const fixture = create();
    fixture.componentInstance.scrollable.set(true);
    fixture.componentInstance.autoHideButtons.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.debugElement.children[0]
      .componentInstance as TabGroupComponent;
    const header = fixture.nativeElement.querySelector(
      '[role="tablist"]',
    ) as HTMLElement;
    header.style.width = '500px';
    header.style.maxWidth = '500px';
    component.updateNavigation();
    expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);

    fixture.componentInstance.firstLabel.set(
      'A label long enough to overflow '.repeat(20),
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    expect(header.scrollWidth).toBeGreaterThan(header.clientWidth);
    expect(component.navigation().next).toBeTrue();

    fixture.componentInstance.firstLabel.set('First');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);

    fixture.componentInstance.direction.set('rtl');
    fixture.componentInstance.firstLabel.set('RTL '.repeat(40));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    component.updateNavigation();
    fixture.detectChanges();
    const next = fixture.nativeElement.querySelector(
      '.orc-tab-group__navigator--next',
    ) as HTMLButtonElement;
    expect(next.textContent?.trim()).toBe('‹');
    if (!(header.scrollWidth > header.clientWidth)) {
      fail(
        JSON.stringify({
          scrollWidth: header.scrollWidth,
          clientWidth: header.clientWidth,
          rtl: component.isRtl(),
          navigation: component.navigation(),
        }),
      );
    }
    next.click();
    expect(header.scrollLeft)
      .withContext(
        `rtl=${component.isRtl()} scroll=${header.scrollWidth}/${header.clientWidth}`,
      )
      .toBeLessThan(0);
    expect(component.navigation().previous).toBeTrue();
    expect(component.navigation().next).toBeTrue();
    const previous = fixture.nativeElement.querySelector(
      '.orc-tab-group__navigator--previous',
    ) as HTMLButtonElement;
    for (let index = 0; index < 100 && component.navigation().next; index++) {
      fixture.detectChanges();
      next.click();
    }
    expect(component.navigation().next).toBeFalse();
    expect(header.scrollLeft).toBeLessThanOrEqual(0);
    fixture.detectChanges();
    previous.click();
    expect(header.scrollLeft).toBeLessThan(0);
    for (
      let index = 0;
      index < 100 && component.navigation().previous;
      index++
    ) {
      fixture.detectChanges();
      previous.click();
    }
    expect(header.scrollLeft).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="tab"]')).toBeTruthy();
  });
});
