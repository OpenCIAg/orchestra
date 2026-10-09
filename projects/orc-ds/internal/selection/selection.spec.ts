import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createOptionKeyManager,
  findOrcOption,
  OrcHighlightableOption,
  OrcSelection,
} from './selection';

interface Project {
  id: number;
  name: string;
}

class FakeOption implements OrcHighlightableOption {
  active = false;
  constructor(
    readonly label: string,
    readonly disabled = false,
  ) {}
  setActiveStyles(): void {
    this.active = true;
  }
  setInactiveStyles(): void {
    this.active = false;
  }
  getLabel(): string {
    return this.label;
  }
}

/** CDK key managers read the legacy `keyCode`. */
function key(name: string, keyCode: number): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name });
  Object.defineProperty(event, 'keyCode', { get: () => keyCode });
  return event;
}

describe('internal/selection', () => {
  const byId = (a: Project | null, b: Project | null) => a?.id === b?.id;

  it('selects a single value and replaces it', () => {
    const selection = new OrcSelection<string>();
    selection.toggle('a');
    selection.toggle('b');
    expect(selection.value()).toBe('b');
    selection.toggle('b');
    expect(selection.value()).toBe('b');
    selection.clear();
    expect(selection.value()).toBeNull();
  });

  it('toggles multiple values and exposes them as a signal', () => {
    const selection = new OrcSelection<string>({ multiple: true });
    selection.toggle('a');
    selection.toggle('b');
    selection.toggle('a');
    expect(selection.selected()).toEqual(['b']);
    expect(selection.value()).toEqual(['b']);
  });

  it('matches object values with compareWith', () => {
    const selection = new OrcSelection<Project | null>({
      multiple: true,
      compareWith: byId,
    });
    selection.setValue([{ id: 1, name: 'Antigo' }]);
    expect(selection.isSelected({ id: 1, name: 'Novo' })).toBeTrue();
    const options = [
      { label: 'Um', value: { id: 1, name: 'Um' } },
      { label: 'Dois', value: { id: 2, name: 'Dois' } },
    ];
    expect(selection.selectedOptions(options).map((o) => o.label)).toEqual([
      'Um',
    ]);
    expect(findOrcOption(options, { id: 2, name: '?' }, byId)?.label).toBe(
      'Dois',
    );
  });

  it('keeps only the first value in single mode', () => {
    const selection = new OrcSelection<number>();
    selection.setValue([3, 4]);
    expect(selection.value()).toBe(3);
    selection.setValue(undefined);
    expect(selection.value()).toBeNull();
  });

  it('creates an active-descendant key manager that skips disabled options', () => {
    const items = signal([
      new FakeOption('Ana'),
      new FakeOption('Bruno', true),
      new FakeOption('Carla'),
    ]);
    const manager = createOptionKeyManager(items, TestBed.inject(Injector));
    manager.setFirstItemActive();
    expect(manager.activeItem?.label).toBe('Ana');
    manager.onKeydown(key('ArrowDown', 40));
    expect(manager.activeItem?.label).toBe('Carla');
    manager.onKeydown(key('ArrowDown', 40));
    expect(manager.activeItem?.label).toBe('Ana');
    manager.onKeydown(key('End', 35));
    expect(manager.activeItem?.label).toBe('Carla');
    expect(items()[2].active).toBeTrue();
    manager.destroy();
  });
});
