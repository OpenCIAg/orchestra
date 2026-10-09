import { TestBed } from '@angular/core/testing';
import { PickListComponent } from '@ciag/orchestra/pick-list';
import { OrcOption } from '@ciag/orchestra/internal';

/**
 * Behavior-parity pins for the pick list family. The specs import the
 * component through the family entry point and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('PickList behavior parity', () => {
  const items: OrcOption<string>[] = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' },
    { value: 'blocked', label: 'Blocked', disabled: true },
  ];

  const options = (fixture: ReturnType<typeof createFixture>) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="option"]',
      ),
    );

  const createFixture = () => {
    const fixture = TestBed.createComponent(PickListComponent);
    fixture.componentRef.setInput('source', items);
    fixture.componentRef.setInput('target', []);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders source options with disabled and selected state, and the empty message', () => {
    const fixture = createFixture();
    const rendered = options(fixture);
    expect(rendered.map((item) => item.textContent?.trim())).toEqual([
      'Alpha',
      'Beta',
      'Blocked',
    ]);
    expect(rendered[2].getAttribute('aria-disabled')).toBe('true');
    expect(rendered[2].getAttribute('tabindex')).toBe('-1');

    fixture.componentRef.setInput('emptyText', 'Nothing left');
    fixture.componentRef.setInput('source', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nothing left',
    );
  });

  it('filters the source pane case-insensitively and hides non-matching options', () => {
    const fixture = createFixture();
    fixture.componentInstance.sourceFilter.set('ALP');
    fixture.detectChanges();
    expect(options(fixture).map((item) => item.textContent?.trim())).toEqual([
      'Alpha',
    ]);
  });

  it('selects on click, toggles with ctrl/meta click, and skips disabled items', () => {
    const fixture = createFixture();
    const [alpha, beta, blocked] = options(fixture);
    alpha.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sourceSelected().has('alpha')).toBeTrue();
    expect(fixture.componentInstance.sourceSelected().size).toBe(1);

    beta.dispatchEvent(
      new MouseEvent('click', { bubbles: true, ctrlKey: true }),
    );
    fixture.detectChanges();
    expect([...fixture.componentInstance.sourceSelected()]).toEqual([
      'alpha',
      'beta',
    ]);

    blocked.click();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.sourceSelected().has('blocked'),
    ).toBeFalse();
  });

  it('transfers selected items to the target pane and emits the move and transfer outputs', () => {
    const fixture = createFixture();
    const moves: unknown[] = [];
    const transfers: unknown[] = [];
    fixture.componentInstance.onMoveToTarget.subscribe(moves.push.bind(moves));
    fixture.componentInstance.transfer.subscribe(
      transfers.push.bind(transfers),
    );

    options(fixture)[1].click();
    fixture.detectChanges();
    const buttons = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('.actions button'),
    );
    buttons[0].click();
    fixture.detectChanges();

    expect(
      fixture.componentInstance.source().map((item) => item.value),
    ).toEqual(['alpha', 'blocked']);
    expect(
      fixture.componentInstance.target().map((item) => item.value),
    ).toEqual(['beta']);
    expect(moves.length).toBe(1);
    expect(transfers.length).toBe(1);
  });

  it('disables the transfer actions when only disabled items are selectable', () => {
    const fixture = TestBed.createComponent(PickListComponent);
    fixture.componentRef.setInput('source', [
      { value: 'blocked', label: 'Blocked', disabled: true },
    ]);
    fixture.detectChanges();
    const buttons = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('.actions button'),
    );
    expect(buttons.every((button) => button.disabled)).toBeTrue();
  });

  it('roves DOM focus with arrows and honors Home/End', async () => {
    const fixture = createFixture();
    const rows = options(fixture);
    rows[0].focus();
    rows[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (document.activeElement as HTMLElement | null)?.textContent?.trim(),
    ).toBe('Beta');

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (document.activeElement as HTMLElement | null)?.textContent?.trim(),
    ).toBe('Alpha');

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (document.activeElement as HTMLElement | null)?.textContent?.trim(),
    ).toBe('Beta');
  });
});
