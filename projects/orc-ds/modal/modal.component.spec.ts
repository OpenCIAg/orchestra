import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  describe('Standalone Unit Tests', () => {
    let component: ModalComponent;
    let fixture: ComponentFixture<ModalComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ModalComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create modal component', () => {
      expect(component).toBeTruthy();
    });

    it('should emit closed output and update isOpen on onClose', () => {
      let closedEmitted = false;
      component.isOpen.set(true);
      component.closed.subscribe(() => {
        closedEmitted = true;
      });

      component.onClose();
      expect(component.isOpen()).toBeFalse();
      expect(closedEmitted).toBeTrue();
    });
  });

  describe('Host Integration Tests', () => {
    @Component({
      standalone: true,
      imports: [ModalComponent],
      template: `
        <orc-modal [(isOpen)]="isOpen" [inline]="true">
          <div modal-header>Título do Modal</div>
          <p modal-body>Conteúdo do modal de teste</p>
        </orc-modal>
      `,
    })
    class HostModalComponent {
      readonly isOpen = signal<boolean>(true);
    }

    let hostFixture: ComponentFixture<HostModalComponent>;
    let hostComponent: HostModalComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostModalComponent],
      }).compileComponents();

      hostFixture = TestBed.createComponent(HostModalComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should project modal header and body', () => {
      const headerEl = hostFixture.nativeElement.querySelector('[modal-header]');
      const bodyEl = hostFixture.nativeElement.querySelector('[modal-body]');

      expect(headerEl.textContent).toContain('Título do Modal');
      expect(bodyEl.textContent).toContain('Conteúdo do modal de teste');
    });
  });
});
