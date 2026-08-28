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

    it('supports PrimeNG baseZIndex and autoZIndex inputs', () => {
      fixture.componentRef.setInput('baseZIndex', 2000);
      fixture.componentRef.setInput('zIndex', 1000);
      fixture.componentRef.setInput('autoZIndex', true);
      expect(component.effectiveZIndex()).toBe(2000);
      fixture.componentRef.setInput('autoZIndex', false);
      expect(component.effectiveZIndex()).toBe(1000);
    });

    it('reflects maximized state in the modal classes', () => {
      fixture.componentRef.setInput('maximizable', true);
      component.toggleMaximize();
      expect(component.maximized()).toBeTrue();
      expect(component.modalClasses()['orc-modal--maximized']).toBeTrue();
    });

    it('renders the active modal class map instead of coercing it to an object string', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('status', 'danger');
      fixture.componentRef.setInput('styleClass', 'consumer-modal another-class');
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

      expect(dialog.classList).toContain('p-dialog');
      expect(dialog.classList).toContain('p-component');
      expect(dialog.classList).toContain('orc-modal');
      expect(dialog.classList).toContain('orc-modal--size-lg');
      expect(dialog.classList).toContain('orc-modal--status-danger');
      expect(dialog.classList).toContain('consumer-modal');
      expect(dialog.classList).toContain('another-class');
      expect(dialog.className).not.toContain('[object Object]');
    });

    it('renders the size class for every modal size', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'custom', 'fullScreen'] as const;
      const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

      for (const size of sizes) {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();

        expect(dialog.classList).toContain(`orc-modal--size-${size}`);
      }
    });

    it('opens a native dialog when visibility is true before view initialization', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect((fixture.nativeElement.querySelector('dialog') as HTMLDialogElement).open).toBeTrue();
    });

    it('prevents native Escape from closing when closeOnEscape is disabled', () => {
      component.isOpen.set(true);
      fixture.componentRef.setInput('closeOnEscape', false);
      const event = new Event('cancel');
      spyOn(event, 'preventDefault');

      component.onCancel(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isOpen()).toBeTrue();
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

    it('cycles Tab focus within an open dialog', () => {
      fixture.componentRef.setInput('inline', true);
      component.isOpen.set(true);
      fixture.componentRef.setInput('maximizable', true);
      fixture.detectChanges();
      const first = fixture.nativeElement.querySelector('.orc-modal__close-btn button') as HTMLElement;
      const last = fixture.nativeElement.querySelector('.orc-modal__maximize') as HTMLElement;
      expect(first).toBeTruthy();
      expect(last).toBeTruthy();
      last.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');
      component.trapFocus(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(first);
    });

    it('focuses the first eligible control when focusOnShow is enabled', async () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('focusOnShow', true);
      fixture.componentRef.setInput('showCloseButton', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      component['focusInitialElement']();
      expect(document.activeElement?.tagName).toBe('BUTTON');
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
