import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { TreeSelectComponent, TreeSelectNode } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the tree select family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
const parityNodes: TreeSelectNode[] = [
  {
    value: 'dept',
    label: 'Department',
    children: [
      { value: 'eng', label: 'Engineering' },
      { value: 'ops', label: 'Operations', disabled: true },
    ],
  },
  { value: 'solo', label: 'Solo' },
];

describe('TreeSelect behavior parity', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    fixture.componentRef.setInput('nodes', parityNodes);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  // The panel renders detached from the host view; its items are located
  // in the document by the panel id the trigger points at.
  const panelOf = (fixture: ReturnType<typeof setup>) =>
    document.getElementById(
      `${fixture.componentInstance.effectiveId()}-panel`,
    ) as HTMLElement;

  beforeEach(() => TestBed.configureTestingModule({}));

  it('opens the panel on trigger click, renders disabled nodes, and closes with onHide', () => {
    const fixture = setup();
    const hidden: unknown[] = [];
    fixture.componentInstance.onHide.subscribe(hidden.push.bind(hidden));

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="tree"]'),
    ).toBeNull();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();

    const itemLabels = () =>
      Array.from(
        panelOf(fixture).querySelectorAll<HTMLElement>(
          '[role="treeitem"] button.item',
        ),
      ).map((item) => item.textContent?.trim());
    // The panel renders the collapsed roots; children stay hidden until expanded.
    expect(itemLabels()).toEqual(['Department', 'Solo']);

    panelOf(fixture)
      .querySelectorAll<HTMLButtonElement>('button.expand')[0]!
      .click();
    fixture.detectChanges();
    expect(itemLabels()).toEqual([
      'Department',
      'Engineering',
      'Operations',
      'Solo',
    ]);
    expect(
      panelOf(fixture).querySelectorAll<HTMLButtonElement>(
        '[role="treeitem"] button.item',
      )[2]!.disabled,
    ).toBeTrue();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="tree"]'),
    ).toBeNull();
    expect(hidden.length).toBe(1);
  });

  it('selects a node in single mode, pushes the CVA value, and closes the panel', () => {
    const fixture = setup();
    let modelValue: unknown;
    fixture.componentInstance.registerOnChange((value) => (modelValue = value));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();
    const items = panelOf(fixture).querySelectorAll<HTMLButtonElement>(
      '[role="treeitem"] button.item',
    );
    expect(items.length).toBe(2);
    items[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('solo');
    expect(modelValue).toBe('solo');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="tree"]'),
    ).toBeNull();
  });

  it('cascades checkbox selection down to enabled descendants', () => {
    const fixture = setup({ selectionMode: 'checkbox' });
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();
    const items = panelOf(fixture).querySelectorAll<HTMLButtonElement>(
      '[role="treeitem"] button.item',
    );
    items[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['dept', 'eng']);
  });

  it('closes the panel on an outside document click and marks the control touched', () => {
    const fixture = setup();
    let touched = 0;
    fixture.componentInstance.registerOnTouched(() => touched++);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBeFalse();
    expect(touched).toBe(1);
  });

  it('roves the active descendant with arrows, wraps at the ends, and honors Home/End', () => {
    const fixture = setup();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();

    // The collapsed panel shows Department (0) and Solo (1); the keydown
    // handler is bound on the component's root element. Roving wraps at the
    // ends and honors Home/End.
    const root = (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-tree-select',
    )!;
    const press = (key: string) => {
      root.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };
    press('ArrowUp');
    expect(fixture.componentInstance.activeTreeIndex()).toBe(1);
    press('Home');
    expect(fixture.componentInstance.activeTreeIndex()).toBe(0);
    press('ArrowDown');
    expect(fixture.componentInstance.activeTreeIndex()).toBe(1);
    press('End');
    expect(fixture.componentInstance.activeTreeIndex()).toBe(1);
  });

  it('honors the forms disabled handshake and blocks interaction', () => {
    const fixture = setup();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.trigger')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();

    fixture.componentInstance.setDisabledState(false);
    fixture.componentInstance.select({ value: 'solo', label: 'Solo' });
    expect(fixture.componentInstance.value()).toBe('solo');
  });

  it('writes forms values into the value model through writeValue', () => {
    const fixture = setup();
    fixture.componentInstance.writeValue(['dept']);
    expect(fixture.componentInstance.value()).toEqual(['dept']);
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.value()).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TreeSelectComponent],
  template: `<orc-tree-select [nodes]="nodes" [formControl]="control" />`,
})
class TreeSelectControlHost {
  readonly control = new FormControl<string | null>(null);
  readonly nodes: TreeSelectNode[] = parityNodes;
}

describe('TreeSelect forms integration parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('propagates a node selection into a bound FormControl and marks it touched on outside click', () => {
    const host = TestBed.createComponent(TreeSelectControlHost);
    host.detectChanges();

    const select = (host.nativeElement as HTMLElement).querySelector(
      'orc-tree-select',
    )!;
    select.querySelector<HTMLButtonElement>('.trigger')!.click();
    host.detectChanges();
    const itemButtons = document
      .getElementById(
        (select.querySelector('.trigger') as HTMLElement).getAttribute(
          'aria-controls',
        )!,
      )!
      .querySelectorAll<HTMLButtonElement>('[role="treeitem"] button.item');
    expect(itemButtons.length).toBe(2);
    itemButtons[1].click();
    host.detectChanges();

    expect(host.componentInstance.control.value).toBe('solo');
    expect(host.componentInstance.control.touched).toBeFalse();

    // Reopen the panel, then dismiss it through an outside document click.
    select.querySelector<HTMLButtonElement>('.trigger')!.click();
    host.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    host.detectChanges();
    expect(host.componentInstance.control.touched).toBeTrue();
  });
});
