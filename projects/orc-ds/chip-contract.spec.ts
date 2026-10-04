import { TestBed } from '@angular/core/testing';
import { ChipComponent } from './chip/chip.component';

describe('Chip standalone selection and removal contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipComponent],
    }).compileComponents();
  });

  it('uses a standalone group with an accessible toggle and remove action', () => {
    const fixture = TestBed.createComponent(ChipComponent);
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('icon', '★');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-chip',
    ) as HTMLElement;
    const main = root.querySelector('.orc-chip__main') as HTMLButtonElement;
    const remove = root.querySelector('.orc-chip__remove') as HTMLButtonElement;
    expect(root.getAttribute('role')).toBe('group');
    expect(root.querySelector('[role="option"]')).toBeNull();
    expect(root.getAttribute('aria-label')).toBe('Chip');
    expect(main.getAttribute('aria-label')).toBe('Toggle selection');
    expect(main.getAttribute('aria-pressed')).toBe('false');
    expect(remove.getAttribute('aria-label')).toBe('Remove chip');
  });

  it('toggles selected state and emits removal outputs exactly once without bubbling removal', () => {
    const fixture = TestBed.createComponent(ChipComponent);
    const chip = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Angular');
    fixture.componentRef.setInput('value', 'ng');
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removed: Array<string | number> = [];
    const onRemove = jasmine.createSpy('onRemove');
    chip.removed.subscribe((value) => removed.push(value));
    chip.onRemove.subscribe(onRemove);
    const root = fixture.nativeElement.querySelector(
      '.orc-chip',
    ) as HTMLElement;
    const bubbled = jasmine.createSpy('bubbled');
    root.addEventListener('click', bubbled);
    (root.querySelector('.orc-chip__main') as HTMLButtonElement).click();
    expect(chip.selected()).toBeTrue();

    const remove = root.querySelector('.orc-chip__remove') as HTMLButtonElement;
    remove.click();
    expect(removed).toEqual(['ng']);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.calls.mostRecent().args[0]).toEqual(jasmine.any(Event));
    expect(bubbled).toHaveBeenCalledTimes(1);
  });

  it('keeps native actions disabled and emits nothing when disabled', () => {
    const fixture = TestBed.createComponent(ChipComponent);
    const chip = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Angular');
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(
      '.orc-chip',
    ) as HTMLElement;
    const main = root.querySelector('.orc-chip__main') as HTMLButtonElement;
    const remove = root.querySelector('.orc-chip__remove') as HTMLButtonElement;
    const onRemove = jasmine.createSpy('onRemove');
    chip.onRemove.subscribe(onRemove);
    chip.removed.subscribe(onRemove);

    expect(main.disabled).toBeTrue();
    expect(remove.disabled).toBeTrue();
    expect(root.getAttribute('aria-disabled')).toBe('true');
    main.click();
    remove.click();
    expect(chip.selected()).toBeFalse();
    expect(onRemove).not.toHaveBeenCalled();
  });
});
