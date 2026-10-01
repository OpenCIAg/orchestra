import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  NavigationItemComponent,
  NavigationShellComponent,
} from './navigation/navigation-shell.component';
import { NavigationItem } from './navigation/navigation.types';
import { TimelineComponent } from './timeline/timeline.component';
import { TimelineItem } from './timeline/timeline.types';
import { LoadingSpinnerComponent } from './spinner/spinner.component';
import {
  ToolbarComponent,
  ToolbarItemDirective,
} from './toolbar/toolbar.component';

@Component({
  standalone: true,
  imports: [ToolbarComponent, ToolbarItemDirective],
  template: `
    <orc-toolbar
      [orientation]="orientation"
      [loop]="loop"
      [attr.dir]="direction"
      ariaLabelledBy="toolbar-name"
      label="Edit actions"
      styleClass="toolbar-custom"
    >
      @if (showFirst()) {
        <button
          id="first"
          type="button"
          orcToolbarItem
          [disabled]="firstDisabled()"
          (click)="recordFirstClick()"
        >
          First
        </button>
      }
      @if (showSecond()) {
        <button id="second" type="button" orcToolbarItem>Second</button>
      }
      @if (showThird()) {
        <button id="third" type="button" orcToolbarItem>Third</button>
      }
    </orc-toolbar>
  `,
})
class ToolbarHost {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  loop = true;
  direction: 'ltr' | 'rtl' = 'ltr';
  readonly firstDisabled = input(false);
  readonly showFirst = input(true);
  readonly showSecond = input(true);
  readonly showThird = input(false);
  firstClicks = 0;
  recordFirstClick(): void {
    this.firstClicks += 1;
  }
}

@Component({
  standalone: true,
  imports: [NavigationShellComponent],
  template: `
    <orc-navigation-shell
      ariaLabel="Workspace navigation"
      [open]="true"
      [rail]="true"
    >
      <span navigation-logo>Brand</span>
      <span>Primary link</span>
      <span navigation-footer>Account</span>
    </orc-navigation-shell>
  `,
})
class NavigationShellHost {}

describe('navigation, timeline, toolbar, and spinner contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavigationItemComponent,
        NavigationShellComponent,
        TimelineComponent,
        LoadingSpinnerComponent,
        ToolbarHost,
        NavigationShellHost,
      ],
    }).compileComponents();
  });

  it('keeps navigation links native and exposes action and disabled items as buttons', () => {
    const linkFixture = TestBed.createComponent(NavigationItemComponent);
    const link: NavigationItem = {
      id: 'home',
      label: 'Home',
      href: '/home',
      icon: 'home',
      badge: 2,
    };
    linkFixture.componentRef.setInput('item', link);
    linkFixture.componentRef.setInput('active', true);
    const activated: NavigationItem[] = [];
    linkFixture.componentInstance.activated.subscribe((item) =>
      activated.push(item),
    );
    linkFixture.detectChanges();

    const anchor = linkFixture.nativeElement.querySelector(
      'a',
    ) as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('/home');
    expect(anchor.getAttribute('aria-current')).toBe('page');
    expect(anchor.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(anchor.textContent).toContain('2');
    anchor.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    });
    anchor.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(activated).toEqual([link]);

    linkFixture.componentRef.setInput('item', {
      id: 'action',
      label: 'Create',
    });
    linkFixture.detectChanges();
    const action = linkFixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(action).not.toBeNull();
    action.click();
    expect(activated[1].id).toBe('action');

    linkFixture.componentRef.setInput('item', {
      id: 'disabled',
      label: 'Locked',
      href: '/locked',
      disabled: true,
    });
    linkFixture.detectChanges();
    const disabled = linkFixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(linkFixture.nativeElement.querySelector('a')).toBeNull();
    expect(disabled.disabled).toBeTrue();
    expect(disabled.getAttribute('href')).toBeNull();
    disabled.click();
    expect(activated.map((item) => item.id)).toEqual(['home', 'action']);
    linkFixture.destroy();
  });

  it('exposes named navigation and open/rail state while projecting the named slots', () => {
    const fixture = TestBed.createComponent(NavigationShellHost);
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('aside');
    expect(panel.classList).toContain('orc-navigation-shell--open');
    expect(panel.classList).toContain('orc-navigation-shell--rail');
    expect(
      fixture.nativeElement.querySelector('nav').getAttribute('aria-label'),
    ).toBe('Workspace navigation');
    expect(
      fixture.nativeElement
        .querySelector('[navigation-logo]')
        .textContent.trim(),
    ).toBe('Brand');
    expect(
      fixture.nativeElement
        .querySelector('[navigation-footer]')
        .textContent.trim(),
    ).toBe('Account');
    const requestClose = jasmine.createSpy('requestClose');
    const shell = fixture.debugElement.children[0]
      .componentInstance as NavigationShellComponent;
    shell.requestClose.subscribe(requestClose);
    const backdrop = fixture.nativeElement.querySelector(
      '.orc-navigation-shell__backdrop',
    ) as HTMLButtonElement;
    expect(backdrop.getAttribute('aria-label')).toBe('Close navigation');
    backdrop.click();
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBeTrue();
    expect(requestClose).toHaveBeenCalledTimes(2);
    fixture.destroy();

    const defaultFixture = TestBed.createComponent(NavigationShellComponent);
    defaultFixture.detectChanges();
    expect(
      defaultFixture.nativeElement
        .querySelector('nav')
        .getAttribute('aria-label'),
    ).toBe('Primary navigation');
    expect(
      defaultFixture.nativeElement.querySelector(
        '.orc-navigation-shell__backdrop',
      ),
    ).toBeNull();
    defaultFixture.destroy();
  });

  it('uses the native toolbar roving tab stop and orientation-aware, RTL-aware navigation', () => {
    const fixture = TestBed.createComponent(ToolbarHost);
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector(
      '[role="toolbar"]',
    ) as HTMLElement;
    const toolbarComponent = fixture.debugElement.children[0]
      .componentInstance as ToolbarComponent;
    const first = fixture.nativeElement.querySelector(
      '#first',
    ) as HTMLButtonElement;
    const second = fixture.nativeElement.querySelector(
      '#second',
    ) as HTMLButtonElement;
    expect(toolbarComponent.items.length).toBe(2);
    expect(toolbar.getAttribute('aria-labelledby')).toBe('toolbar-name');
    expect(toolbar.getAttribute('aria-label')).toBe('Edit actions');
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.classList).toContain('toolbar-custom');
    expect(first.getAttribute('tabindex')).toBe('0');
    expect(second.getAttribute('tabindex')).toBe('-1');

    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(second);
    expect(first.getAttribute('tabindex')).toBe('-1');
    expect(second.getAttribute('tabindex')).toBe('0');

    fixture.componentInstance.orientation = 'vertical';
    fixture.detectChanges();
    expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
    second.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(first);

    fixture.componentInstance.direction = 'rtl';
    fixture.componentInstance.orientation = 'horizontal';
    fixture.detectChanges();
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(second);

    second.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(first);
    fixture.componentInstance.loop = false;
    fixture.detectChanges();
    first.focus();
    const edgeKey = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    first.dispatchEvent(edgeKey);
    expect(document.activeElement).toBe(first);
    expect(edgeKey.defaultPrevented).toBeFalse();
    fixture.destroy();
  });

  it('keeps the toolbar reachable after content and disabled-state changes, and blocks disabled activation', () => {
    const fixture = TestBed.createComponent(ToolbarHost);
    fixture.detectChanges();
    fixture.componentRef.setInput('showThird', true);
    fixture.detectChanges();
    const toolbarComponent = fixture.debugElement.children[0]
      .componentInstance as ToolbarComponent;
    const second = fixture.nativeElement.querySelector(
      '#second',
    ) as HTMLButtonElement;
    const third = fixture.nativeElement.querySelector(
      '#third',
    ) as HTMLButtonElement;
    expect(toolbarComponent.items.length).toBe(3);
    expect(
      (
        fixture.nativeElement.querySelector('#first') as HTMLButtonElement
      ).getAttribute('tabindex'),
    ).toBe('0');
    expect(second.getAttribute('tabindex')).toBe('-1');
    expect(third.getAttribute('tabindex')).toBe('-1');

    fixture.componentRef.setInput('firstDisabled', true);
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector(
      '#first',
    ) as HTMLButtonElement;
    expect(first.disabled).toBeTrue();
    expect(first.getAttribute('aria-disabled')).toBe('true');
    expect(second.getAttribute('tabindex')).toBe('0');
    first.click();
    expect(fixture.componentInstance.firstClicks).toBe(0);
    fixture.destroy();
  });

  it('assigns the initial tab stop after projected disabled state and repairs it through content mutations', () => {
    const fixture = TestBed.createComponent(ToolbarHost);
    fixture.componentRef.setInput('firstDisabled', true);
    fixture.detectChanges();

    const first = fixture.nativeElement.querySelector(
      '#first',
    ) as HTMLButtonElement;
    const second = fixture.nativeElement.querySelector(
      '#second',
    ) as HTMLButtonElement;
    expect(first.disabled).toBeTrue();
    expect(first.getAttribute('tabindex')).toBe('-1');
    expect(second.getAttribute('tabindex')).toBe('0');

    second.focus();
    fixture.componentRef.setInput('showThird', true);
    fixture.detectChanges();
    const third = fixture.nativeElement.querySelector(
      '#third',
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(second);
    expect(second.getAttribute('tabindex')).toBe('0');
    expect(third.getAttribute('tabindex')).toBe('-1');

    fixture.componentRef.setInput('showFirst', false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(second);
    expect(second.getAttribute('tabindex')).toBe('0');
    expect(third.getAttribute('tabindex')).toBe('-1');

    fixture.componentRef.setInput('showSecond', false);
    fixture.detectChanges();
    expect(third.getAttribute('tabindex')).toBe('0');
    fixture.destroy();
  });

  it('uses the computed toolbar direction for horizontal RTL navigation', () => {
    const fixture = TestBed.createComponent(ToolbarHost);
    fixture.componentInstance.direction = 'ltr';
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector(
      '[role="toolbar"]',
    ) as HTMLElement;
    const first = fixture.nativeElement.querySelector(
      '#first',
    ) as HTMLButtonElement;
    const second = fixture.nativeElement.querySelector(
      '#second',
    ) as HTMLButtonElement;
    toolbar.style.direction = 'rtl';
    first.focus();
    const forward = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    first.dispatchEvent(forward);
    expect(forward.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(second);

    const backward = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    second.dispatchEvent(backward);
    expect(backward.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(first);
    fixture.destroy();
  });

  it('renders a named ordered timeline and activates items through native keyboard controls', () => {
    const fixture: ComponentFixture<TimelineComponent> =
      TestBed.createComponent(TimelineComponent);
    const first: TimelineItem = {
      id: 'created',
      title: 'Created',
      description: 'Order received',
      status: 'completed',
    };
    const current: TimelineItem = {
      id: 'shipped',
      title: 'Shipped',
      date: 'Today',
      status: 'current',
    };
    fixture.componentRef.setInput('items', [first, current]);
    fixture.componentRef.setInput('ariaLabel', 'Order history');
    const selected: Array<{ item: TimelineItem; index: number }> = [];
    const alias: Array<{ item: TimelineItem; index: number }> = [];
    fixture.componentInstance.itemSelect.subscribe((value) =>
      selected.push(value),
    );
    fixture.componentInstance.onItemClick.subscribe((value) =>
      alias.push(value),
    );
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('ol');
    const controls = fixture.nativeElement.querySelectorAll('li > button');
    expect(list.getAttribute('aria-label')).toBe('Order history');
    expect(controls.length).toBe(2);
    expect(controls[1].getAttribute('aria-current')).toBe('step');
    controls[0].focus();
    const keydown = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    controls[0].dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBeFalse();
    (controls[0] as HTMLButtonElement).click();
    expect(selected.length).toBe(1);
    expect(selected[0]).toEqual({ item: first, index: 0 });
    expect(alias[0]).toBe(selected[0]);
    fixture.destroy();
  });

  it('uses compatibility timeline inputs and applies class and style inputs', () => {
    const fixture: ComponentFixture<TimelineComponent> =
      TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('value', [{ title: 'Legacy item' }]);
    fixture.componentRef.setInput('layout', 'horizontal');
    fixture.componentRef.setInput('align', 'right');
    fixture.componentRef.setInput('styleClass', 'custom-timeline');
    fixture.componentRef.setInput('style', { '--timeline-test': '7px' });
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('ol') as HTMLOListElement;
    expect(list.classList).toContain('orc-timeline--horizontal');
    expect(list.classList).toContain('orc-timeline--align-right');
    expect(list.classList).toContain('custom-timeline');
    expect(list.style.getPropertyValue('--timeline-test')).toBe('7px');
    expect(fixture.nativeElement.textContent).toContain('Legacy item');
    fixture.componentRef.setInput('items', [{ title: 'Current item' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Current item');
    expect(fixture.nativeElement.textContent).not.toContain('Legacy item');
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('emptyMessage', 'No events');
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('.orc-timeline__empty')
        .textContent.trim(),
    ).toBe('No events');
    fixture.destroy();
  });

  it('provides a named live status, honors static animation, and applies visual inputs', () => {
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    fixture.componentRef.setInput('type', 'dots');
    fixture.componentRef.setInput('animation', 'none');
    fixture.componentRef.setInput('customSize', 40);
    fixture.componentRef.setInput('variant', 'white');
    fixture.componentRef.setInput('text', 'Saving');
    fixture.componentRef.setInput('textPosition', 'bottom');
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector('[role="status"]');
    const spinner = fixture.nativeElement.querySelector(
      '.orc-spinner',
    ) as HTMLElement;
    expect(status.getAttribute('aria-label')).toBe('Saving');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.classList).toContain('orc-spinner-container--bottom');
    expect(
      fixture.nativeElement.querySelectorAll('.orc-spinner__dots__dot').length,
    ).toBe(3);
    expect(spinner.style.width).toBe('40px');
    expect(spinner.classList).toContain('orc-spinner--static');
    expect(
      getComputedStyle(
        fixture.nativeElement.querySelector('.orc-spinner__dots__dot'),
      ).animationName,
    ).toBe('none');
    expect(
      getComputedStyle(fixture.nativeElement.querySelector('.orc-spinner-text'))
        .color,
    ).toBe('rgb(255, 255, 255)');

    fixture.componentRef.setInput('ariaLabel', 'Saving changes');
    fixture.componentRef.setInput('fullScreen', true);
    fixture.componentRef.setInput('backdrop', false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[role="status"]')
        .getAttribute('aria-label'),
    ).toBe('Saving changes');
    expect(
      fixture.nativeElement.querySelector('.orc-spinner-overlay--backdrop'),
    ).toBeNull();
    fixture.destroy();
  });

  it('disables animation on the animated element for every spinner type', () => {
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    fixture.componentRef.setInput('animation', 'none');

    const animatedElement = (type: 'ring' | 'star' | 'dots') => {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();
      return fixture.nativeElement.querySelector(
        type === 'ring'
          ? '.orc-spinner__ring'
          : type === 'star'
            ? '.orc-spinner__star'
            : '.orc-spinner__dots__dot',
      ) as HTMLElement;
    };

    for (const type of ['ring', 'star', 'dots'] as const) {
      expect(getComputedStyle(animatedElement(type)).animationName).toBe(
        'none',
      );
    }

    fixture.destroy();
  });
});
