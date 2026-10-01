import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { focusElement } from '../../../tools/quality/test-focus-events';
import { ChipInputComponent } from './chip-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ChipInputComponent],
  template: `
    <orc-chip-input
      [formControl]="control"
      [addOnBlur]="true"
      [separator]="'|'"
    />
    <button type="button">Outside</button>
  `,
})
class ChipInputBlurHost {
  readonly control = new FormControl<string[]>([], {
    nonNullable: true,
    updateOn: 'blur',
  });
}

describe('ChipInput keyboard, paste, and CVA contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipInputBlurHost],
    }).compileComponents();
  });

  it('commits a blur-added chip before marking an updateOn-blur control touched', () => {
    const fixture = TestBed.createComponent(ChipInputBlurHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const outside = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    focusElement(input);
    input.value = 'Alpha';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([]);

    focusElement(outside);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['Alpha']);
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('updates the model before marking the control touched when a chip is removed', () => {
    const fixture = TestBed.createComponent(ChipInputBlurHost);
    fixture.componentInstance.control.setValue(['Alpha', 'Beta']);
    fixture.detectChanges();
    const chipInput = fixture.debugElement.children[0]
      .componentInstance as ChipInputComponent;

    chipInput.removeChip(0);

    expect(fixture.componentInstance.control.value).toEqual(['Beta']);
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('keeps paste changes pending until blur and does not touch the control on paste', () => {
    const fixture = TestBed.createComponent(ChipInputBlurHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const outside = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    const chipInput = fixture.debugElement.children[0]
      .componentInstance as ChipInputComponent;
    focusElement(input);
    const paste = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => 'Alpha|Beta' },
    });
    input.dispatchEvent(paste);
    fixture.detectChanges();

    expect(paste.defaultPrevented).toBeTrue();
    expect(chipInput.value()).toEqual(['Alpha', 'Beta']);
    expect(fixture.componentInstance.control.value).toEqual([]);
    expect(fixture.componentInstance.control.touched).toBeFalse();

    focusElement(outside);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['Alpha', 'Beta']);
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('does not emit a CVA change when pasted chips are all duplicates', () => {
    const fixture = TestBed.createComponent(ChipInputComponent);
    const component = fixture.componentInstance;
    component.writeValue(['Alpha']);
    const changes: string[][] = [];
    component.registerOnChange((value) => changes.push([...value]));

    const paste = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => 'Alpha' },
    });
    component.onPaste(paste);

    expect(paste.defaultPrevented).toBeTrue();
    expect(component.value()).toEqual(['Alpha']);
    expect(changes).toEqual([]);
  });

  it('does not treat Enter used to confirm IME composition as a chip separator', () => {
    const fixture = TestBed.createComponent(ChipInputComponent);
    const component = fixture.componentInstance;
    component.inputValue.set('かな');

    const composingEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      isComposing: true,
      cancelable: true,
    });
    component.onKeydown(composingEnter);

    expect(component.value()).toEqual([]);
    expect(component.inputValue()).toBe('かな');
    expect(composingEnter.defaultPrevented).toBeFalse();
  });

  it('removes the last chip with Backspace only when the draft is empty', () => {
    const fixture = TestBed.createComponent(ChipInputComponent);
    const component = fixture.componentInstance;
    const changes: string[][] = [];
    component.writeValue(['Alpha', 'Beta']);
    component.registerOnChange((value) => changes.push([...value]));
    component.inputValue.set('draft');

    component.onKeydown(
      new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }),
    );
    expect(component.value()).toEqual(['Alpha', 'Beta']);

    component.inputValue.set('');
    const backspace = new KeyboardEvent('keydown', {
      key: 'Backspace',
      cancelable: true,
    });
    component.onKeydown(backspace);
    expect(component.value()).toEqual(['Alpha']);
    expect(changes).toEqual([['Alpha']]);
    expect(backspace.defaultPrevented).toBeTrue();
  });

  it('ignores chip removals outside the current list bounds', () => {
    const fixture = TestBed.createComponent(ChipInputComponent);
    const component = fixture.componentInstance;
    const changes: string[][] = [];
    const touched = jasmine.createSpy('touched');
    component.writeValue(['Alpha']);
    component.registerOnChange((value) => changes.push([...value]));
    component.registerOnTouched(touched);

    component.removeChip(-1);
    component.removeChip(1);

    expect(component.value()).toEqual(['Alpha']);
    expect(changes).toEqual([]);
    expect(touched).not.toHaveBeenCalled();
  });

  it('keeps public and CVA disabled states from mutating chips', () => {
    for (const disabledBy of ['input', 'cva'] as const) {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;
      fixture.componentRef.setInput('disabled', disabledBy === 'input');
      component.writeValue(['Existing']);
      component.inputValue.set('New');
      const changes: string[][] = [];
      component.registerOnChange((value) => changes.push([...value]));
      if (disabledBy === 'cva') component.setDisabledState(true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        'input',
      ) as HTMLInputElement;
      expect(input.disabled).toBeTrue();
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      component.removeChip(0);
      expect(component.value()).toEqual(['Existing']);
      expect(changes).toEqual([]);
    }
  });
});
