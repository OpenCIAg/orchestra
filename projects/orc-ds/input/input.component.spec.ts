import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';
import { axe, toHaveNoViolations } from 'jasmine-axe';

describe('InputComponent', () => {
  beforeEach(() => {
    jasmine.addMatchers(toHaveNoViolations);
  });

  describe('ControlValueAccessor & Signals Unit Tests', () => {
    let component: InputComponent;
    let fixture: ComponentFixture<InputComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [InputComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(InputComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create the input component', () => {
      expect(component).toBeTruthy();
    });

    it('should write value via writeValue', () => {
      component.writeValue('Teste Orchestra');
      expect(component.value()).toBe('Teste Orchestra');
    });

    it('should update disabled state via setDisabledState', () => {
      expect(component.effectiveDisabled()).toBeFalse();
      component.setDisabledState(true);
      expect(component.effectiveDisabled()).toBeTrue();
    });

    it('should calculate char count correctly', () => {
      component.writeValue('12345');
      expect(component.charCount()).toBe(5);
    });

    it('should retain text entered into an uncontrolled native input', () => {
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      inputEl.value = 'typed value';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(inputEl.value).toBe('typed value');
      expect(component.value()).toBe('typed value');
    });

    it('should pass basic accessibility audit with label', async () => {
      fixture.componentRef.setInput('label', 'Nome completo');
      fixture.detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Template-driven Forms Integration', () => {
    @Component({
      standalone: true,
      imports: [FormsModule, InputComponent],
      template: `<orc-input [(ngModel)]="value" name="email" label="Email" />`,
    })
    class TemplateHostComponent {
      value = '';
    }

    it('should retain typed text and update ngModel', async () => {
      const hostFixture = TestBed.createComponent(TemplateHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const inputEl: HTMLInputElement = hostFixture.nativeElement.querySelector('input');
      inputEl.value = 'template@ciag.com';
      inputEl.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(inputEl.value).toBe('template@ciag.com');
      expect(hostFixture.componentInstance.value).toBe('template@ciag.com');
    });
  });

  describe('Reactive Forms Integration', () => {
    @Component({
      standalone: true,
      imports: [InputComponent, ReactiveFormsModule],
      template: `
        <orc-input
          [formControl]="control"
          label="Email do Usuário"
          placeholder="email@dominio.com"
        />
      `,
    })
    class ReactiveHostComponent {
      readonly control = new FormControl('admin@ciag.com');
    }

    let hostFixture: ComponentFixture<ReactiveHostComponent>;
    let hostComponent: ReactiveHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveHostComponent],
      }).compileComponents();

      hostFixture = TestBed.createComponent(ReactiveHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should initialize input with form control value', () => {
      const inputEl = hostFixture.nativeElement.querySelector('input');
      expect(inputEl.value).toBe('admin@ciag.com');
    });

    it('should update form control when input value changes', () => {
      const inputEl = hostFixture.nativeElement.querySelector('input');
      inputEl.value = 'novo@ciag.com';
      inputEl.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();

      expect(hostComponent.control.value).toBe('novo@ciag.com');
    });
  });
});
