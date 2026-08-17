import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let fixture: ComponentFixture<TextareaComponent>;
  let component: TextareaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextareaComponent] }).compileComponents();
    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('retains text entered into the native textarea', () => {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'A browser-authored note';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(textarea.value).toBe('A browser-authored note');
    expect(component.value()).toBe('A browser-authored note');
  });

  describe('template-driven forms', () => {
    @Component({
      standalone: true,
      imports: [FormsModule, TextareaComponent],
      template: `<orc-textarea [(ngModel)]="value" name="notes" label="Notes" />`,
    })
    class HostComponent {
      value = '';
    }

    it('updates ngModel without clearing the browser value', async () => {
      const hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const textarea: HTMLTextAreaElement = hostFixture.nativeElement.querySelector('textarea');
      textarea.value = 'Persisted notes';
      textarea.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(textarea.value).toBe('Persisted notes');
      expect(hostFixture.componentInstance.value).toBe('Persisted notes');
    });
  });
});
