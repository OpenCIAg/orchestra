import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BreadcrumbItemData } from './breadcrumb/breadcrumb.types';
import { MenuComponent } from '@ciag/orchestra/menu';
import { PrimeMenuItem, OrcOption } from '@ciag/orchestra/internal';
import { PickListComponent } from '@ciag/orchestra/pick-list';
import { TerminalComponent } from '@ciag/orchestra/terminal';
import {
  blurElement,
  focusElement,
} from '../../tools/quality/test-focus-events';

type TransferPayload = {
  items: OrcOption[];
  source: OrcOption[];
  target: OrcOption[];
};
type SelectionSnapshot = {
  source: ReadonlySet<string>;
  target: ReadonlySet<string>;
};

@Component({
  standalone: true,
  imports: [MenuComponent],
  template: `<orc-menu
    [model]="items"
    (itemSelect)="canonical.push($event)"
    (onItemClick)="alias.push($event)"
  />`,
})
class MenuConsumer {
  items: PrimeMenuItem[] = [{ label: 'Open' }];
  canonical: PrimeMenuItem[] = [];
  alias: PrimeMenuItem[] = [];
}

@Component({
  standalone: true,
  imports: [TerminalComponent],
  template: `<orc-terminal
    #terminal
    (commandRun)="canonical.push($event)"
    (onCommand)="alias.push($event)"
  />`,
})
class TerminalConsumer {
  @ViewChild('terminal') terminal!: TerminalComponent;
  canonical: string[] = [];
  alias: string[] = [];
}

@Component({
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `<orc-breadcrumb
    [items]="items"
    (itemClick)="canonical.push($event)"
    (onItemClick)="alias.push($event)"
  />`,
})
class BreadcrumbConsumer {
  items = [{ label: 'Home' }, { label: 'Current' }];
  canonical: Array<{ item: BreadcrumbItemData; index: number }> = [];
  alias: Array<{ item: BreadcrumbItemData; index: number }> = [];
}

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `<orc-pick-list
    #pick
    [source]="source"
    [target]="target"
    filterBy="label"
    [disabled]="disabled"
    moveToTargetLabel="Move selected"
    moveToSourceLabel="Move selected back"
    (onMoveToTarget)="selectedForward.push($event)"
    (onMoveToSource)="selectedBack.push($event)"
    (onMoveAllToTarget)="allForward.push($event)"
    (onMoveAllToSource)="allBack.push($event)"
    (selectionChange)="selectionSnapshots.push($event)"
  />`,
})
class PickListConsumer {
  @ViewChild('pick') pick!: PickListComponent<OrcOption>;
  source: OrcOption[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 'b', label: 'Beta' },
  ];
  target: OrcOption[] = [{ value: 'c', label: 'Gamma' }];
  selectedForward: TransferPayload[] = [];
  selectedBack: TransferPayload[] = [];
  allForward: TransferPayload[] = [];
  allBack: TransferPayload[] = [];
  selectionSnapshots: SelectionSnapshot[] = [];
  disabled = false;
}

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `<orc-pick-list [source]="source" [target]="target" />`,
})
class DefaultPickListConsumer {
  source: OrcOption[] = [{ value: 'a', label: 'Alpha' }];
  target: OrcOption[] = [{ value: 'b', label: 'Beta' }];
}

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `<orc-pick-list
    [source]="source"
    [target]="target"
    filterBy="label"
    [disabled]="disabled"
  />`,
})
class DisabledPickListConsumer {
  source: OrcOption[] = [
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 'b', label: 'Beta' },
  ];
  target: OrcOption[] = [{ value: 'c', label: 'Gamma' }];
  disabled = true;
}

describe('public output bindings', () => {
  it('binds Menu aliases through a real consumer click exactly once with the same item', () => {
    const fixture = TestBed.createComponent(MenuConsumer);
    fixture.detectChanges();
    const command = fixture.componentInstance.items[0];
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(fixture.componentInstance.canonical).toEqual([command]);
    expect(fixture.componentInstance.alias).toEqual([command]);
    expect(fixture.componentInstance.canonical[0]).toBe(
      fixture.componentInstance.alias[0],
    );
  });

  it('binds Terminal and Breadcrumb aliases through consumer DOM events', () => {
    const terminal = TestBed.createComponent(TerminalConsumer);
    terminal.detectChanges();
    terminal.componentInstance.terminal.command.set('help');
    terminal.detectChanges();
    const submit = terminal.nativeElement.querySelector('form');
    submit.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(terminal.componentInstance.canonical).toEqual(['help']);
    expect(terminal.componentInstance.alias).toEqual(['help']);

    const breadcrumb = TestBed.createComponent(BreadcrumbConsumer);
    breadcrumb.detectChanges();
    const link = breadcrumb.nativeElement.querySelector(
      '.orc-breadcrumb__link',
    ) as HTMLElement;
    link.click();
    expect(breadcrumb.componentInstance.canonical).toHaveSize(1);
    expect(breadcrumb.componentInstance.alias).toHaveSize(1);
    expect(breadcrumb.componentInstance.canonical[0]).toBe(
      breadcrumb.componentInstance.alias[0],
    );
    expect(breadcrumb.componentInstance.canonical[0].item.label).toBe('Home');
  });

  it('supports PickList selected and all transfers as distinct consumer events', () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const sourceOptions = fixture.nativeElement.querySelectorAll(
      '.list-pane:first-child li[role="option"]',
    );
    sourceOptions[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect([...fixture.componentInstance.pick.sourceSelected()]).toEqual(['a']);
    sourceOptions[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect([...fixture.componentInstance.pick.sourceSelected()]).toEqual(['a']);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move selected"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.selectedForward.length).toBe(1);
    expect(
      fixture.componentInstance.selectedForward[0].items.map(
        (item) => item.value,
      ),
    ).toEqual(['a']);
    expect(fixture.componentInstance.allForward.length).toBe(0);
    expect(fixture.componentInstance.pick.sourceSelected().size).toBe(0);

    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move all to target"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.allForward.length).toBe(1);
    expect(
      fixture.componentInstance.allForward[0].items.map((item) => item.value),
    ).toEqual(['b']);
    expect(
      fixture.componentInstance.pick.source().map((item) => item.value),
    ).toEqual(['locked']);
    expect(
      fixture.componentInstance.pick.target().map((item) => item.value),
    ).toEqual(['c', 'a', 'b']);

    fixture.detectChanges();
    const targetOptions = fixture.nativeElement.querySelectorAll(
      '.list-pane:last-child li[role="option"]',
    );
    targetOptions[0].click();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move selected back"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.selectedBack.length).toBe(1);
    expect(
      fixture.componentInstance.selectedBack[0].items.map((item) => item.value),
    ).toEqual(['c']);

    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move all to source"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.allBack.length).toBe(1);
    expect(
      fixture.componentInstance.allBack[0].items.map((item) => item.value),
    ).toEqual(['a', 'b']);
    expect(fixture.componentInstance.selectionSnapshots.length).toBe(6);
    expect([
      ...fixture.componentInstance.selectionSnapshots.at(-1)!.source,
    ]).toEqual([]);
    expect([
      ...fixture.componentInstance.selectionSnapshots.at(-1)!.target,
    ]).toEqual([]);
    expect(fixture.componentInstance.pick.target()).toEqual([]);
  });

  it('keeps PickList all actions disabled for empty or disabled-only lists and ignores filters', () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.componentInstance.source = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ];
    fixture.componentInstance.target = [];
    fixture.detectChanges();
    const sourceFilter = fixture.nativeElement.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    sourceFilter.value = 'Alpha';
    sourceFilter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move all to target"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.allForward.length).toBe(1);
    expect(
      fixture.componentInstance.allForward[0].items.map((item) => item.value),
    ).toEqual(['a', 'b']);

    fixture.componentInstance.source = [
      { value: 'locked', label: 'Locked', disabled: true },
    ];
    fixture.detectChanges();
    const allForward = fixture.nativeElement.querySelector(
      'button[aria-label="Move all to target"]',
    ) as HTMLButtonElement;
    expect(allForward.disabled).toBeTrue();
    allForward.click();
    expect(fixture.componentInstance.pick.source()).toEqual([
      { value: 'locked', label: 'Locked', disabled: true },
    ]);
    const snapshotsBeforeNoOp =
      fixture.componentInstance.selectionSnapshots.length;
    fixture.componentInstance.pick.sourceSelected.set(new Set(['locked']));
    fixture.detectChanges();
    expect(fixture.componentInstance.pick.sourceSelected().size).toBe(0);
    (
      fixture.nativeElement.querySelector(
        'button[aria-label="Move selected"]',
      ) as HTMLButtonElement
    ).click();
    expect(fixture.componentInstance.selectionSnapshots.length).toBe(
      snapshotsBeforeNoOp,
    );
  });

  it('provides named selected controls in the default configuration', () => {
    const fixture = TestBed.createComponent(DefaultPickListConsumer);
    fixture.detectChanges();
    const buttons = [
      ...fixture.nativeElement.querySelectorAll('button'),
    ] as HTMLButtonElement[];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Move selected to target',
      'Move all to target',
      'Move selected to source',
      'Move all to source',
    ]);
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeFalse();
    expect(buttons[2].disabled).toBeTrue();
    expect(buttons[3].disabled).toBeFalse();
  });

  it('uses one roving entry per pane and skips disabled or filtered options', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const sourceList = fixture.nativeElement.querySelector(
      '.list-pane:first-child ul',
    ) as HTMLUListElement;
    const sourceOptions = [
      ...sourceList.querySelectorAll<HTMLElement>('[role="option"]'),
    ];
    expect(sourceList.getAttribute('aria-multiselectable')).toBe('true');
    expect(sourceOptions.map((option) => option.tabIndex)).toEqual([0, -1, -1]);

    focusElement(sourceOptions[0]);
    sourceOptions[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceOptions[2]);
    expect(sourceOptions.map((option) => option.tabIndex)).toEqual([-1, -1, 0]);

    sourceOptions[2].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceOptions[0]);
    sourceOptions[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(sourceOptions[0].getAttribute('aria-selected')).toBe('true');

    const sourceFilter = fixture.nativeElement.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    sourceFilter.value = 'Beta';
    sourceFilter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();
    const filtered = [
      ...sourceList.querySelectorAll<HTMLElement>('[role="option"]'),
    ];
    expect(filtered).toHaveSize(1);
    expect(filtered[0].textContent).toContain('Beta');
    expect(filtered[0].tabIndex).toBe(0);
    expect(document.activeElement).toBe(filtered[0]);

    focusElement(sourceFilter);
    fixture.componentInstance.pick.source.set([
      { value: 'replacement', label: 'Replacement' },
    ]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceFilter);

    expect(fixture.componentInstance.pick.sourceSelected().size).toBe(0);
    expect(fixture.componentInstance.selectionSnapshots.length).toBe(1);
  });

  it('disables filters, options, and keyboard behavior as one widget', () => {
    const fixture = TestBed.createComponent(DisabledPickListConsumer);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(
      '.orc-pick-list',
    ) as HTMLElement;
    const sourceFilter = root.querySelector(
      '.list-pane:first-child input',
    ) as HTMLInputElement;
    const sourceOptions = [
      ...root.querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(sourceFilter.disabled).toBeTrue();
    expect(sourceOptions.map((option) => option.tabIndex)).toEqual([-1, -1]);
    expect(
      sourceOptions.every(
        (option) => option.getAttribute('aria-disabled') === 'true',
      ),
    ).toBeTrue();
    const key = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    sourceOptions[0].dispatchEvent(key);
    expect(key.defaultPrevented).toBeFalse();

    fixture.componentInstance.disabled = false;
    fixture.detectChanges();
    const enabledOptions = [
      ...root.querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    expect(sourceFilter.disabled).toBeFalse();
    expect(enabledOptions.map((option) => option.tabIndex)).toEqual([-1, 0]);
  });

  it('syncs the roving cursor to focus and cancels stale requests on destroy', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const options = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    focusElement(options[2]);
    expect(fixture.componentInstance.pick.sourceFocusValue()).toBe('b');
    const arrow = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    options[2].dispatchEvent(arrow);
    fixture.destroy();
    await Promise.resolve();
    expect(document.activeElement).not.toBe(options[0]);
  });

  it('uses the configured focus ring token for focused options', () => {
    const fixture = TestBed.createComponent(DefaultPickListConsumer);
    fixture.detectChanges();
    const option = fixture.nativeElement.querySelector(
      '.list-pane:first-child [role="option"]',
    ) as HTMLElement;
    focusElement(option);
    const style = getComputedStyle(option);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineColor).not.toBe('');
  });

  it('moves physical focus after rendered roving updates and skips disabled options', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.componentInstance.source = [
      { value: 'a', label: 'Alpha' },
      { value: 'locked', label: 'Locked', disabled: true },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Charlie' },
    ];
    fixture.detectChanges();

    const options = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    const dispatch = (option: HTMLElement, key: 'ArrowDown' | 'ArrowUp') => {
      option.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        }),
      );
      fixture.detectChanges();
    };

    focusElement(options()[0]);
    dispatch(options()[0], 'ArrowDown');
    await Promise.resolve();
    expect(options()[2].tabIndex).toBe(0);
    expect(document.activeElement).toBe(options()[2]);

    dispatch(options()[2], 'ArrowDown');
    await Promise.resolve();
    expect(options()[3].tabIndex).toBe(0);
    expect(document.activeElement).toBe(options()[3]);

    dispatch(options()[3], 'ArrowUp');
    await Promise.resolve();
    expect(options()[2].tabIndex).toBe(0);
    expect(document.activeElement).toBe(options()[2]);
  });

  it('does not run stale focus requests across disable, blur, or external focus', async () => {
    const fixture = TestBed.createComponent(PickListConsumer);
    fixture.detectChanges();
    const pick = fixture.componentInstance.pick;
    const sourceOptions = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:first-child [role="option"]',
      ),
    ];
    const targetOptions = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.list-pane:last-child [role="option"]',
      ),
    ];

    const source = sourceOptions();
    focusElement(source[0]);
    source[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).not.toBe(source[2]);
    expect(
      sourceOptions().every((option) => option.tabIndex === -1),
    ).toBeTrue();

    fixture.componentInstance.disabled = false;
    pick.target.set([
      { value: 'c', label: 'Gamma' },
      { value: 'd', label: 'Delta' },
    ]);
    fixture.detectChanges();
    const target = targetOptions();
    focusElement(target[0]);
    target[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    pick.target.set([
      { value: 'c', label: 'Gamma' },
      { value: 'd', label: 'Delta', disabled: true },
    ]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(targetOptions()[0]);
    expect(targetOptions()[1].getAttribute('aria-disabled')).toBe('true');

    blurElement(targetOptions()[0]);
    await Promise.resolve();
    pick.target.set([{ value: 'new', label: 'New' }]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(document.body);

    const external = document.createElement('button');
    document.body.appendChild(external);
    try {
      const current = sourceOptions()[0];
      focusElement(current);
      focusElement(external);
      pick.source.set([{ value: 'external-update', label: 'External update' }]);
      fixture.detectChanges();
      await Promise.resolve();
      expect(document.activeElement).toBe(external);
    } finally {
      external.remove();
    }

    pick.source.set([
      { value: 'owned', label: 'Owned' },
      { value: 'neighbor', label: 'Neighbor' },
    ]);
    fixture.detectChanges();
    const owned = sourceOptions()[0];
    focusElement(owned);
    pick.source.set([{ value: 'neighbor', label: 'Neighbor' }]);
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(sourceOptions()[0]);
  });
});
