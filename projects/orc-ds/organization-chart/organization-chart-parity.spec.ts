import { TestBed } from '@angular/core/testing';
import {
  OrganizationChartComponent,
  OrganizationNode,
} from '@ciag/orchestra/organization-chart';

/**
 * Behavior-parity pins for the organization chart family. The specs import
 * the component through the family entry point and must
 * pass unchanged while the family moves to its canonical directory.
 */
describe('OrganizationChart behavior parity', () => {
  const nodes: OrganizationNode[] = [
    {
      key: 'ceo',
      label: 'CEO',
      subtitle: 'HQ',
      children: [
        { key: 'cto', label: 'CTO' },
        { key: 'blocked', label: 'Blocked', disabled: true },
      ],
    },
  ];

  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(OrganizationChartComponent);
    fixture.componentRef.setInput('value', nodes);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  const cards = (fixture: ReturnType<typeof setup>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'article.node',
      ),
    );

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders collapsed roots and expands children through the toggle button', () => {
    const fixture = setup();
    expect(cards(fixture).map((card) => card.textContent?.trim())).toEqual([
      '+ CEOHQ',
    ]);

    cards(fixture)[0]
      .querySelector<HTMLButtonElement>('button.expand')!
      .click();
    fixture.detectChanges();

    expect(cards(fixture).map((card) => card.textContent?.trim())).toEqual([
      '− CEOHQ',
      'CTO',
      'Blocked',
    ]);
  });

  it('selects nodes, emits both select/unselect aliases, and reports selectionChange', () => {
    const fixture = setup();
    const selected: unknown[] = [];
    const unselected: unknown[] = [];
    const changes: unknown[] = [];
    fixture.componentInstance.nodeSelect.subscribe(
      selected.push.bind(selected),
    );
    fixture.componentInstance.nodeUnselect.subscribe(
      unselected.push.bind(unselected),
    );
    fixture.componentInstance.selectionChange.subscribe(
      changes.push.bind(changes),
    );

    cards(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('ceo');
    expect(selected.length).toBe(1);

    cards(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(unselected.length).toBe(1);
    expect(changes).toEqual(['ceo', null]);
  });

  it('ignores disabled nodes for selection and expansion', () => {
    const fixture = setup();
    cards(fixture)[0]
      .querySelector<HTMLButtonElement>('button.expand')!
      .click();
    fixture.detectChanges();

    cards(fixture)[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(cards(fixture)[2].textContent).toContain('Blocked');
  });

  it('selects with Enter or Space from the keyboard', () => {
    const fixture = setup();
    cards(fixture)[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(fixture.componentInstance.selected()).toBe('ceo');

    cards(fixture)[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    expect(fixture.componentInstance.selected()).toBeNull();
  });

  it('supports multiple selection mode and collapses when collapsible is off', () => {
    const fixture = setup({ selectionMode: 'multiple', collapsible: false });
    cards(fixture)[0]
      .querySelector<HTMLButtonElement>('button.expand')!
      .click();
    fixture.detectChanges();
    expect(cards(fixture).length).toBe(1);

    cards(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toEqual(['ceo']);
  });
});
