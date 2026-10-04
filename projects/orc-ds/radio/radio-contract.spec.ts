import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonComponent } from './radio-button.component';
import { RadioGroupComponent } from './radio-group.component';
import { focusElement } from '../../../tools/quality/test-focus-events';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RadioGroupComponent,
    RadioButtonComponent,
  ],
  template: `<orc-radio-group label="Choice" [formControl]="control"
    ><orc-radio-button
      value="a"
      label="Alpha"
      [disabled]="disabledA" /><orc-radio-button
      value="b"
      label="Beta" /><orc-radio-button value="c" label="Gamma"
  /></orc-radio-group>`,
})
class FormRadioHost {
  control = new FormControl<string | null>('b', { updateOn: 'blur' });
  disabledA = true;
}

@Component({
  standalone: true,
  imports: [CommonModule, RadioGroupComponent, RadioButtonComponent],
  template: `<orc-radio-group
    ><ng-container *ngFor="let item of items()"
      ><orc-radio-button [value]="item" [label]="item" /></ng-container
  ></orc-radio-group>`,
})
class ReorderRadioHost {
  items = signal(['a', 'b', 'c']);
}

@Component({
  standalone: true,
  imports: [RadioButtonComponent],
  template: `<orc-radio-button
      name="standalone"
      value="a"
      label="A"
      [size]="size"
      [variant]="variant"
    /><orc-radio-button name="standalone" value="b" label="B" />`,
})
class StandaloneRadioHost {
  size: 'large' | undefined = undefined;
  variant: 'filled' | undefined = undefined;
}

@Component({
  standalone: true,
  imports: [RadioGroupComponent, RadioButtonComponent],
  template: `<orc-radio-group
    ><orc-radio-button value="a"
      ><span class="projected-label">Projected</span></orc-radio-button
    ><orc-radio-button value="b" label="Explicit"
  /></orc-radio-group>`,
})
class ProjectedRadioHost {}

@Component({
  standalone: true,
  imports: [RadioGroupComponent, RadioButtonComponent],
  template: `<orc-radio-group
    ><orc-radio-button value="a" [disabled]="true" /><orc-radio-button
      value="b"
      [disabled]="true"
  /></orc-radio-group>`,
})
class AllDisabledRadioHost {}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RadioGroupComponent, RadioButtonComponent],
  template: `<orc-radio-group [formControl]="control"
      ><orc-radio-button value="a" label="Alpha" /><orc-radio-button
        value="b"
        label="Beta" /></orc-radio-group
    ><input class="outside" />`,
})
class BlurRadioHost {
  control = new FormControl<string | null>('a', { updateOn: 'blur' });
}

@Component({
  standalone: true,
  imports: [RadioButtonComponent],
  template: `<form>
      <orc-radio-button name="same" value="first" label="First" />
    </form>
    <form>
      <orc-radio-button name="same" value="second" label="Second" />
    </form>`,
})
class FormOwnedStandaloneRadioHost {}

@Component({
  standalone: true,
  imports: [RadioButtonComponent],
  template: `<orc-radio-button
      [name]="firstName()"
      value="first"
      label="First"
    /><orc-radio-button [name]="secondName()" value="second" label="Second" />`,
})
class RenamedStandaloneRadioHost {
  firstName = signal('same');
  secondName = signal('same');
}

function radioInstances(
  fixture: ComponentFixture<unknown>,
): RadioButtonComponent[] {
  return Array.from(
    new Set(
      fixture.debugElement
        .queryAll((d) => d.componentInstance instanceof RadioButtonComponent)
        .map((d) => d.componentInstance as RadioButtonComponent),
    ),
  );
}

describe('Radio group and button contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormRadioHost,
        ReorderRadioHost,
        StandaloneRadioHost,
        ProjectedRadioHost,
        AllDisabledRadioHost,
        BlurRadioHost,
        FormOwnedStandaloneRadioHost,
        RenamedStandaloneRadioHost,
      ],
    }).compileComponents();
  });

  it('gives the first enabled radio a roving tab stop when the selected value is disabled', () => {
    const fixture = TestBed.createComponent(FormRadioHost);
    fixture.componentInstance.control.setValue('a');
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll(
      'input',
    ) as NodeListOf<HTMLInputElement>;
    expect(inputs[0].disabled).toBeTrue();
    expect(inputs[1].tabIndex).toBe(0);
  });

  it('marks the reactive control touched on focus leaving the group', () => {
    const fixture = TestBed.createComponent(FormRadioHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelectorAll(
      'input',
    )[1] as HTMLInputElement;
    input.dispatchEvent(new FocusEvent('focus'));
    input.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('does not touch updateOn blur controls when focus moves between siblings', () => {
    const fixture = TestBed.createComponent(BlurRadioHost);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll(
      '.orc-radio-group input',
    ) as NodeListOf<HTMLInputElement>;
    const outside = fixture.nativeElement.querySelector(
      '.outside',
    ) as HTMLInputElement;
    focusElement(inputs[0]);
    inputs[1].click();
    focusElement(inputs[1]);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('a');
    expect(fixture.componentInstance.control.touched).toBeFalse();
    focusElement(outside);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('b');
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('holds a selection until blur for updateOn blur controls', () => {
    const fixture = TestBed.createComponent(FormRadioHost);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll(
      'input',
    ) as NodeListOf<HTMLInputElement>;
    inputs[2].dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('b');
    expect(fixture.componentInstance.control.touched).toBeFalse();
    inputs[2].dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('c');
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('applies external writes and disabled state without user outputs', () => {
    const fixture = TestBed.createComponent(FormRadioHost);
    fixture.detectChanges();
    const radio = radioInstances(fixture)[2];
    let selected = 0;
    radio.select.subscribe(() => selected++);
    fixture.componentInstance.control.setValue('c');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll(
      'input',
    ) as NodeListOf<HTMLInputElement>;
    expect(inputs[2].checked).toBeTrue();
    expect(Array.from(inputs).every((input) => input.disabled)).toBeTrue();
    expect(selected).toBe(0);
    fixture.componentInstance.control.enable();
    fixture.componentInstance.control.reset('b');
    fixture.detectChanges();
    expect(inputs[1].checked).toBeTrue();
  });

  it('emits child selection outputs once for keyboard navigation with the original event', () => {
    const fixture = TestBed.createComponent(FormRadioHost);
    fixture.detectChanges();
    const group = fixture.debugElement.query(
      (d) => d.componentInstance instanceof RadioGroupComponent,
    ).componentInstance as RadioGroupComponent;
    const radios = radioInstances(fixture);
    let selected = 0;
    let clickedEvent: Event | undefined;
    radios[2].select.subscribe(() => selected++);
    radios[2].onClick.subscribe(
      (event) => (clickedEvent = event.originalEvent),
    );
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    });
    group.handleKeydown(event, radios[1]);
    expect(selected).toBe(1);
    expect(clickedEvent).toBe(event);
    expect(group.value()).toBe('c');
  });

  it('emits native click selection and group change exactly once', () => {
    const fixture = TestBed.createComponent(FormRadioHost);
    fixture.detectChanges();
    const group = fixture.debugElement.query(
      (d) => d.componentInstance instanceof RadioGroupComponent,
    ).componentInstance as RadioGroupComponent;
    const radio = radioInstances(fixture)[2];
    const input = fixture.nativeElement.querySelectorAll(
      'input',
    )[2] as HTMLInputElement;
    let selected = 0;
    let changes = 0;
    radio.select.subscribe(() => selected++);
    group.onChange.subscribe(() => changes++);
    input.click();
    fixture.detectChanges();
    expect(selected).toBe(1);
    expect(changes).toBe(1);
  });

  it('follows projected DOM order after reorder and removes destroyed radios', () => {
    const fixture = TestBed.createComponent(ReorderRadioHost);
    fixture.detectChanges();
    fixture.componentInstance.items.set(['c', 'b', 'a']);
    fixture.detectChanges();
    const group = fixture.debugElement.query(
      (d) => d.componentInstance instanceof RadioGroupComponent,
    ).componentInstance as RadioGroupComponent;
    const radios = radioInstances(fixture);
    group.handleKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowRight' }),
      radios[0],
    );
    expect(group.value()).toBe('b');
    fixture.componentInstance.items.set(['b']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(1);
  });

  it('preserves registration order when radio elements are disconnected', () => {
    const fixture = TestBed.createComponent(ReorderRadioHost);
    fixture.detectChanges();
    const group = fixture.debugElement.query(
      (d) => d.componentInstance instanceof RadioGroupComponent,
    ).componentInstance as RadioGroupComponent;
    const radios = radioInstances(fixture);
    fixture.nativeElement
      .querySelectorAll('input')
      .forEach((input: HTMLInputElement) => input.remove());
    group.handleKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowRight' }),
      radios[0],
    );
    expect(group.value()).toBe('b');
  });

  it('keeps standalone radios with the same name visually exclusive', () => {
    const fixture = TestBed.createComponent(StandaloneRadioHost);
    fixture.detectChanges();
    const radios = radioInstances(fixture);
    radios[0].onSelect(new Event('change'));
    radios[1].onSelect(new Event('change'));
    fixture.detectChanges();
    expect(radios[0].isChecked()).toBeFalse();
    expect(radios[1].isChecked()).toBeTrue();
  });

  it('isolates same-name standalone radios by native form owner', () => {
    const fixture = TestBed.createComponent(FormOwnedStandaloneRadioHost);
    fixture.detectChanges();
    const radios = radioInstances(fixture);
    radios[0].onSelect(new Event('change'));
    radios[1].onSelect(new Event('change'));
    fixture.detectChanges();
    expect(radios[0].isChecked()).toBeTrue();
    expect(radios[1].isChecked()).toBeTrue();
  });

  it('rekeys standalone same-name peers when a name changes at runtime', () => {
    const fixture = TestBed.createComponent(RenamedStandaloneRadioHost);
    fixture.detectChanges();
    const radios = radioInstances(fixture);
    radios[0].onSelect(new Event('change'));
    fixture.componentInstance.secondName.set('other');
    fixture.detectChanges();
    radios[1].onSelect(new Event('change'));
    fixture.detectChanges();
    expect(radios[0].isChecked()).toBeTrue();
    expect(radios[1].isChecked()).toBeTrue();
    fixture.componentInstance.secondName.set('same');
    fixture.detectChanges();
    radios[1].onSelect(new Event('change'));
    fixture.detectChanges();
    expect(radios[0].isChecked()).toBeFalse();
    expect(radios[1].isChecked()).toBeTrue();
  });

  it('projects content once in both explicit and implicit label modes', () => {
    const fixture = TestBed.createComponent(ProjectedRadioHost);
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll(
      '.orc-radio__content',
    );
    expect(labels.length).toBe(2);
    expect(
      fixture.nativeElement.querySelectorAll('.projected-label').length,
    ).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Explicit');
  });

  it('keeps all-disabled groups out of the keyboard entry point', () => {
    const fixture = TestBed.createComponent(AllDisabledRadioHost);
    fixture.detectChanges();
    const group = fixture.debugElement.query(
      (d) => d.componentInstance instanceof RadioGroupComponent,
    ).componentInstance as RadioGroupComponent;
    const radios = radioInstances(fixture);
    const inputs = fixture.nativeElement.querySelectorAll(
      'input',
    ) as NodeListOf<HTMLInputElement>;
    expect(
      Array.from(inputs).every((input) => input.tabIndex === -1),
    ).toBeTrue();
    group.handleKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowRight' }),
      radios[0],
    );
    expect(group.value()).toBeNull();
  });

  it('applies size and variant classes and exposes programmatic focus', () => {
    const fixture = TestBed.createComponent(StandaloneRadioHost);
    fixture.componentInstance.size = 'large';
    fixture.componentInstance.variant = 'filled';
    fixture.detectChanges();
    const first = radioInstances(fixture)[0];
    const label = fixture.nativeElement.querySelector(
      '.orc-radio',
    ) as HTMLElement;
    expect(label.classList.contains('orc-radio--large')).toBeTrue();
    expect(label.classList.contains('orc-radio--filled')).toBeTrue();
    first.focus();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('input'),
    );
  });
});
