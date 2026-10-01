import { TestBed } from '@angular/core/testing';
import { CommandMenuComponent } from './p2/p2-command-components';
import {
  DockComponent,
  ScrollPanelComponent,
} from './p2/p2-dock-scroll-components';

describe('CommandMenuComponent keyboard and listbox contract', () => {
  it('keeps the active option valid while filtering, skipping disabled items, and selecting by keyboard', () => {
    const fixture = TestBed.createComponent(CommandMenuComponent);
    const runLast = jasmine.createSpy('runLast');
    const first = { label: 'Duplicate', disabled: true };
    const second = { label: 'Duplicate', keywords: ['open project'] };
    const last = { label: 'Preferences', command: runLast };
    fixture.componentRef.setInput('items', [first, second, last]);
    fixture.detectChanges();
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.itemSelect.subscribe(selected);

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const options = fixture.nativeElement.querySelectorAll(
      '[role="option"]',
    ) as NodeListOf<HTMLElement>;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-label')).toBe('Search commands');
    expect(input.getAttribute('aria-controls')).toBe(
      fixture.componentInstance.listboxId,
    );
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id);
    expect(options[0].getAttribute('aria-disabled')).toBe('true');
    expect(options[1].id).not.toBe(options[0].id);
    expect(options[1].querySelector('.orc-command-icon')).toBeNull();

    options[0].click();
    expect(selected).not.toHaveBeenCalled();
    expect(runLast).not.toHaveBeenCalled();

    const down = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(down);
    fixture.detectChanges();
    expect(down.defaultPrevented).toBeTrue();
    expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id);

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBeTrue();
    expect(runLast).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledOnceWith(last);

    fixture.componentInstance.setQuery('open');
    fixture.detectChanges();
    const filteredOption = fixture.nativeElement.querySelector(
      '[role="option"]',
    ) as HTMLElement;
    expect(filteredOption.textContent).toContain('Duplicate');
    expect(input.getAttribute('aria-activedescendant')).toBe(filteredOption.id);
  });

  it('shows a named empty state and leaves modified navigation keys to the browser', () => {
    const fixture = TestBed.createComponent(CommandMenuComponent);
    fixture.componentRef.setInput('items', [{ label: 'Open' }]);
    fixture.componentRef.setInput('emptyText', 'No matching commands');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    fixture.componentInstance.setQuery('missing');
    fixture.detectChanges();

    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No matching commands');
    const modified = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      ctrlKey: true,
      cancelable: true,
    });
    fixture.componentInstance.setQuery('open');
    fixture.componentInstance.keydown(modified);
    expect(modified.defaultPrevented).toBeFalse();
  });
});

describe('DockComponent toolbar contract', () => {
  it('uses one roving tab stop, skips disabled items, and invokes an item command', () => {
    const fixture = TestBed.createComponent(DockComponent);
    const run = jasmine.createSpy('run');
    fixture.componentRef.setInput('label', 'Workspace shortcuts');
    fixture.componentRef.setInput('position', 'top');
    fixture.componentRef.setInput('items', [
      { value: 'home', label: 'Home', icon: '⌂' },
      { value: 'disabled', label: 'Disabled', disabled: true },
      { value: 'settings', label: 'Settings', command: run },
    ]);
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector(
      '[role="toolbar"]',
    ) as HTMLElement;
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(toolbar.getAttribute('aria-label')).toBe('Workspace shortcuts');
    expect(toolbar.classList.contains('top')).toBeTrue();
    expect([...buttons].map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    expect(buttons[0].querySelector('span')?.getAttribute('aria-hidden')).toBe(
      'true',
    );

    buttons[0].focus();
    const next = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons[0].dispatchEvent(next);
    fixture.detectChanges();
    expect(next.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(buttons[2]);
    expect(buttons[2].tabIndex).toBe(0);

    buttons[2].click();
    expect(run).toHaveBeenCalledTimes(1);
    const wrap = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    buttons[2].dispatchEvent(wrap);
    expect(document.activeElement).toBe(buttons[0]);
  });
});

describe('ScrollPanelComponent keyboard contract', () => {
  it('scrolls from the panel itself and does not steal keys from projected controls', () => {
    const fixture = TestBed.createComponent(ScrollPanelComponent);
    fixture.componentRef.setInput('step', 12);
    fixture.componentRef.setInput('contentId', 'results-scroll');
    fixture.componentRef.setInput('label', 'Search results');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector(
      '#results-scroll',
    ) as HTMLDivElement;
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-label')).toBe('Search results');
    const scrollBy = spyOn(panel, 'scrollBy').and.stub();
    const scrollTo = spyOn(panel, 'scrollTo').and.stub();

    const noOverflow = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      cancelable: true,
    });
    panel.dispatchEvent(noOverflow);
    expect(noOverflow.defaultPrevented).toBeFalse();
    Object.defineProperty(panel, 'scrollHeight', {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(panel, 'clientHeight', {
      configurable: true,
      value: 40,
    });

    const line = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    panel.dispatchEvent(line);
    expect(line.defaultPrevented).toBeTrue();
    expect(scrollBy).toHaveBeenCalledWith({ top: 12 });

    const page = new KeyboardEvent('keydown', {
      key: 'PageUp',
      bubbles: true,
      cancelable: true,
    });
    panel.dispatchEvent(page);
    expect(scrollBy).toHaveBeenCalledWith({
      top: -Math.max(1, panel.clientHeight),
    });

    fixture.destroy();
  });

  it('keeps projected controls keyboard-operable and validates imperative scrolling', () => {
    const fixture = TestBed.createComponent(ScrollPanelComponent);
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector(
      '.orc-scroll-panel',
    ) as HTMLDivElement;
    const scrollBy = spyOn(panel, 'scrollBy').and.stub();
    const scrollTo = spyOn(panel, 'scrollTo').and.stub();
    Object.defineProperty(panel, 'scrollHeight', {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(panel, 'clientHeight', {
      configurable: true,
      value: 40,
    });

    const child = document.createElement('input');
    panel.append(child);
    const childArrow = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(childArrow);
    expect(childArrow.defaultPrevented).toBeFalse();
    expect(scrollBy).not.toHaveBeenCalled();

    fixture.componentInstance.scrollTop(-10);
    fixture.componentInstance.scrollTop(Number.NaN);
    expect(scrollTo).toHaveBeenCalledOnceWith({ top: 0 });

    const scrollListener = jasmine.createSpy('scrollListener');
    const onScroll = jasmine.createSpy('onScroll');
    fixture.componentInstance.onScroll.subscribe(onScroll);
    panel.addEventListener('scroll', scrollListener);
    fixture.componentInstance.refresh();
    expect(scrollListener).toHaveBeenCalledTimes(1);
    expect(onScroll).toHaveBeenCalledTimes(1);
    const dispatchedEvent = scrollListener.calls.mostRecent().args[0] as Event;
    expect(onScroll).toHaveBeenCalledOnceWith(dispatchedEvent);
    expect(
      dispatchedEvent instanceof panel.ownerDocument.defaultView!.Event,
    ).toBeTrue();
  });
});
