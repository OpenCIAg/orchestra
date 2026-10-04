import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ButtonComponent } from './button.component';
import { axe, toHaveNoViolations } from 'jasmine-axe';

describe('ButtonComponent', () => {
  beforeEach(() => {
    jasmine.addMatchers(toHaveNoViolations);
  });

  describe('Standalone unit tests', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ButtonComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ButtonComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('ariaLabel', 'Ação');
      fixture.detectChanges();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should calculate disabled state when disabled or loading', () => {
      expect(component.isDisabled()).toBeFalse();

      fixture.componentRef.setInput('disabled', true);
      expect(component.isDisabled()).toBeTrue();

      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('loading', true);
      expect(component.isDisabled()).toBeTrue();
    });

    it('should emit click event when not disabled', () => {
      let emitted = false;
      component.click.subscribe(() => {
        emitted = true;
      });

      const event = new MouseEvent('click');
      component.handleClick(event);
      expect(emitted).toBeTrue();
    });

    it('should not emit click event when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      let emitted = false;
      component.click.subscribe(() => {
        emitted = true;
      });

      const event = new MouseEvent('click');
      component.handleClick(event);
      expect(emitted).toBeFalse();
    });

    it('should pass basic accessibility audit', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Integration in host component', () => {
    @Component({
      standalone: true,
      imports: [ButtonComponent],
      template: `
        <orc-button
          [variant]="variant()"
          [size]="size()"
          [disabled]="disabled()"
          (click)="onClick()"
        >
          Salvar
        </orc-button>
      `,
    })
    class HostTestComponent {
      readonly variant = signal<'primary' | 'secondary'>('primary');
      readonly size = signal<'sm' | 'md' | 'lg'>('md');
      readonly disabled = signal<boolean>(false);
      clicked = 0;

      onClick() {
        this.clicked += 1;
      }
    }

    let hostFixture: ComponentFixture<HostTestComponent>;
    let hostComponent: HostTestComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostTestComponent],
      }).compileComponents();

      hostFixture = TestBed.createComponent(HostTestComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should render button text correctly', () => {
      const buttonEl = hostFixture.nativeElement.querySelector('button');
      expect(buttonEl.textContent.trim()).toContain('Salvar');
    });

    it('should trigger host click handler', () => {
      const buttonEl = hostFixture.nativeElement.querySelector('button');
      buttonEl.click();
      expect(hostComponent.clicked).toBe(1);
    });
  });
});
