import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxChangeEvent } from './checkbox.types';

@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: `<orc-checkbox
    [(checked)]="checked"
    (change)="onChange($event)"
  />`,
})
class CheckboxHost {
  checked = false;
  changes: CheckboxChangeEvent[] = [];

  onChange(event: CheckboxChangeEvent): void {
    this.changes.push(event);
  }
}

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create checkbox component', () => {
    expect(component).toBeTruthy();
  });

  it('should write checked state via writeValue', () => {
    component.writeValue(true);
    expect(component.checked()).toBeTrue();

    component.writeValue(false);
    expect(component.checked()).toBeFalse();
  });

  it('should toggle state and emit change on toggle', () => {
    let emitted = false;
    component.change.subscribe((event: CheckboxChangeEvent) => {
      emitted = true;
      expect(event.checked).toBeTrue();
    });

    component.toggle();
    expect(component.checked()).toBeTrue();
    expect(emitted).toBeTrue();
  });

  it('delivers one structured host change for one native click', () => {
    const hostFixture = TestBed.createComponent(CheckboxHost);
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.changes).toEqual([
      jasmine.objectContaining({ checked: true, indeterminate: false }),
    ]);
    expect(hostFixture.componentInstance.checked).toBeTrue();
  });

  it('keeps a readonly checkbox focusable and prevents DOM, API, and CVA changes', () => {
    fixture.componentRef.setInput('readonly', true);
    component.writeValue(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    let cvaChanges = 0;
    component.registerOnChange(() => cvaChanges++);
    expect(input.disabled).toBeFalse();
    expect(input.readOnly).toBeTrue();
    expect(input.getAttribute('aria-readonly')).toBe('true');
    expect(input.checked).toBeTrue();

    input.click();
    component.toggle();
    fixture.detectChanges();
    expect(component.checked()).toBeTrue();
    expect(input.checked).toBeTrue();
    expect(cvaChanges).toBe(0);

    component.writeValue(false);
    fixture.detectChanges();
    expect(component.checked()).toBeFalse();
    expect(input.checked).toBeFalse();
  });

  it('applies the filled/outlined variants and small/large visual sizes', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const existingRoot = host.querySelector('label') as HTMLElement;
    existingRoot.style.setProperty('--orc-surface-subtle', '#eeeeee');
    existingRoot.style.setProperty('--orc-control-surface', '#ffffff');
    existingRoot.style.setProperty('--orc-fill-input', '#ffffff');
    fixture.componentRef.setInput('variant', 'filled');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 150));
    let root = fixture.nativeElement.querySelector('label') as HTMLElement;
    let box = root.querySelector('.orc-checkbox__box') as HTMLElement;
    expect(root.classList.contains('variant-filled')).toBeTrue();
    expect(root.classList.contains('size-small')).toBeTrue();
    expect(getComputedStyle(box).width).toBe('14px');
    expect(getComputedStyle(box).height).toBe('14px');
    expect(getComputedStyle(box).backgroundColor).toBe('rgb(238, 238, 238)');

    fixture.componentRef.setInput('variant', 'outlined');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 150));
    root = fixture.nativeElement.querySelector('label') as HTMLElement;
    box = root.querySelector('.orc-checkbox__box') as HTMLElement;
    expect(root.classList.contains('variant-outlined')).toBeTrue();
    expect(root.classList.contains('variant-filled')).toBeFalse();
    expect(root.classList.contains('size-large')).toBeTrue();
    expect(getComputedStyle(box).width).toBe('20px');
    expect(getComputedStyle(box).height).toBe('20px');
    expect(['rgb(255, 255, 255)', 'rgb(254, 254, 254)']).toContain(
      getComputedStyle(box).backgroundColor,
    );
  });

  it('keeps an unlabeled checkbox host at a 24 by 24 pointer target', () => {
    const root = fixture.nativeElement.querySelector('label') as HTMLElement;
    const rect = root.getBoundingClientRect();
    expect(getComputedStyle(root).minWidth).toBe('24px');
    expect(getComputedStyle(root).minHeight).toBe('24px');
    expect(rect.width).toBeGreaterThanOrEqual(24);
    expect(rect.height).toBeGreaterThanOrEqual(24);
  });

  it('keeps the wrapped label as the hit area and paints focus on the visible box', () => {
    fixture.componentRef.setInput('inputId', 'accept-terms');
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(
      'label',
    ) as HTMLLabelElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const box = root.querySelector('.orc-checkbox__box') as HTMLElement;

    expect(root.htmlFor).toBe(input.id);
    expect(root.contains(input)).toBeTrue();
    root.click();
    fixture.detectChanges();
    expect(component.checked()).toBeTrue();

    input.focus();
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(box).outlineWidth).toBe('2px');
    expect(getComputedStyle(box).outlineOffset).toBe('2px');
  });
});
