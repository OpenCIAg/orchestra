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
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      expect(dialog.style.zIndex).toBe('1000');
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
      fixture.componentRef.setInput(
        'styleClass',
        'consumer-modal another-class',
      );
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;

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
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;

      for (const size of sizes) {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();

        expect(dialog.classList).toContain(`orc-modal--size-${size}`);
      }
    });

    it('applies the configured close glyph and a normalized close-button tabindex', () => {
      fixture.componentRef.setInput('closeIcon', '× custom');
      fixture.componentRef.setInput('closeTabindex', '-1');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector(
        '.orc-modal__close-icon',
      ) as HTMLElement;
      const button = fixture.nativeElement.querySelector(
        '.orc-modal__close-btn button',
      ) as HTMLButtonElement;

      expect(icon.textContent?.trim()).toBe('× custom');
      expect(button.tabIndex).toBe(-1);

      fixture.componentRef.setInput('closeTabindex', 'invalid');
      fixture.detectChanges();
      expect(button.tabIndex).toBe(0);
    });

    it('applies the public modal presentation and accessible-name inputs', () => {
      fixture.componentRef.setInput('header', 'Preferences');
      fixture.componentRef.setInput('id', 'preferences-dialog');
      fixture.componentRef.setInput('role', 'alertdialog');
      fixture.componentRef.setInput('position', 'bottomright');
      fixture.componentRef.setInput('ariaLabel', 'Preferences dialog');
      fixture.componentRef.setInput('ariaDescribedBy', 'preferences-help');
      fixture.componentRef.setInput('showCloseButton', false);
      fixture.componentRef.setInput('closable', true);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      expect(dialog.id).toBe('preferences-dialog');
      expect(dialog.getAttribute('role')).toBe('alertdialog');
      expect(dialog.getAttribute('aria-label')).toBe('Preferences dialog');
      expect(dialog.getAttribute('aria-describedby')).toBe('preferences-help');
      expect(dialog.classList).toContain('orc-modal--position-bottomright');
      expect(
        fixture.nativeElement.querySelector('.orc-modal__close-btn'),
      ).toBeNull();

      fixture.componentRef.setInput('showCloseButton', true);
      fixture.componentRef.setInput('closable', false);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.orc-modal__close-btn'),
      ).toBeNull();
    });

    it('applies inline style objects and content styling inputs', () => {
      fixture.componentRef.setInput('style', { width: '31rem', color: 'red' });
      fixture.componentRef.setInput('contentStyle', {
        color: 'blue',
        padding: '2px',
      });
      fixture.componentRef.setInput('contentStyleClass', 'consumer-content');
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      const body = fixture.nativeElement.querySelector(
        '.orc-modal__body',
      ) as HTMLElement;
      expect(dialog.style.width).toBe('31rem');
      expect(dialog.style.color).toBe('red');
      expect(body.style.color).toBe('blue');
      expect(body.style.padding).toBe('2px');
      expect(body.classList).toContain('consumer-content');
    });

    it('uses configured title and control labels and glyphs', async () => {
      fixture.componentRef.setInput('header', 'Actions');
      fixture.componentRef.setInput('closeAriaLabel', 'Dismiss actions');
      fixture.componentRef.setInput('maximizable', true);
      fixture.componentRef.setInput('maximizeIcon', 'Expand');
      fixture.componentRef.setInput('minimizeIcon', 'Collapse');
      fixture.componentRef.setInput('maximizeAriaLabel', 'Expand actions');
      fixture.componentRef.setInput('restoreAriaLabel', 'Restore actions');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      const close = fixture.nativeElement.querySelector(
        '.orc-modal__close-btn button',
      ) as HTMLButtonElement;
      const maximize = fixture.nativeElement.querySelector(
        '.orc-modal__maximize',
      ) as HTMLButtonElement;
      expect(dialog.getAttribute('aria-labelledby')).toBe(component.titleId);
      expect(close.getAttribute('aria-label')).toBe('Dismiss actions');
      expect(maximize.getAttribute('aria-label')).toBe('Expand actions');
      expect(maximize.textContent?.trim()).toBe('Expand');

      component.toggleMaximize();
      fixture.detectChanges();
      expect(maximize.getAttribute('aria-label')).toBe('Restore actions');
      expect(maximize.textContent?.trim()).toBe('Collapse');
    });

    it('allows ariaLabelledBy and visible to control accessible naming and visibility', () => {
      fixture.componentRef.setInput('ariaLabelledBy', 'external-title');
      fixture.componentRef.setInput('ariaLabel', 'Ignored when labelled by');
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      expect(dialog.getAttribute('aria-labelledby')).toBe('external-title');
      expect(dialog.hasAttribute('aria-label')).toBeFalse();
      expect(dialog.open).toBeTrue();
    });

    it('closes on backdrop clicks when dismissal is enabled', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;

      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.isOpen()).toBeFalse();
    });

    it('closes on genuine pointer backdrop clicks (press and release on the mask)', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;

      dialog.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, detail: 1 }),
      );
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: 1 }),
      );
      expect(component.isOpen()).toBeFalse();
    });

    it('ignores a completion click that retargets from a control opened mid-gesture', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;

      // A picker inside the modal opens from focus: the press landed on its
      // input, the detached backdrop painted before the release, so the
      // closing click retargets to the nearest common ancestor — the dialog.
      const input = document.createElement('input');
      dialog.querySelector('.orc-modal__body')!.appendChild(input);
      input.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, detail: 1 }),
      );
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: 1 }),
      );
      expect(component.isOpen()).toBeTrue();
    });

    it('does not let a press on another layer’s backdrop (outside the dialog) arm a stale mask dismissal', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;

      // A sibling picker's full-viewport backdrop is portaled to the body:
      // its pointerdown never crosses the dialog, so the modal must not
      // fall back to a stale gesture record when the completion click
      // retargets to the dialog element.
      const foreignBackdrop = document.createElement('div');
      document.body.appendChild(foreignBackdrop);
      foreignBackdrop.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, detail: 1 }),
      );
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: 1 }),
      );
      expect(component.isOpen()).toBeTrue();
      foreignBackdrop.remove();
    });

    it('does not close on backdrop clicks when dismissableMask is disabled', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('dismissableMask', false);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.isOpen()).toBeTrue();
    });

    it('does not close on backdrop clicks when closeOnBackdropClick is disabled', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('closeOnBackdropClick', false);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.isOpen()).toBeTrue();
    });

    it('opens a native dialog when visibility is true before view initialization', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      expect(
        (fixture.nativeElement.querySelector('dialog') as HTMLDialogElement)
          .open,
      ).toBeTrue();
    });

    it('reconciles native modality and scroll locking when inputs change while open', () => {
      let shown = 0;
      let hidden = 0;
      component.onShow.subscribe(() => shown++);
      component.onHide.subscribe(() => hidden++);
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      const originalOverflow = document.body.style.getPropertyValue('overflow');
      fixture.componentRef.setInput('blockScroll', false);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      expect(dialog.open).toBeTrue();
      expect(dialog.matches(':modal')).toBeTrue();
      expect(shown).toBe(1);
      expect(document.body.style.getPropertyValue('overflow')).toBe(
        originalOverflow,
      );

      fixture.componentRef.setInput('blockScroll', true);
      fixture.detectChanges();
      expect(document.body.style.getPropertyValue('overflow')).toBe('hidden');

      fixture.componentRef.setInput('modal', false);
      fixture.detectChanges();
      expect(dialog.open).toBeTrue();
      expect(dialog.matches(':modal')).toBeFalse();
      expect(document.body.style.getPropertyValue('overflow')).toBe(
        originalOverflow,
      );

      fixture.componentRef.setInput('modal', true);
      fixture.detectChanges();
      expect(dialog.open).toBeTrue();
      expect(dialog.matches(':modal')).toBeTrue();
      expect(document.body.style.getPropertyValue('overflow')).toBe('hidden');
      expect(shown).toBe(1);
      expect(hidden).toBe(0);

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      expect(document.body.style.getPropertyValue('overflow')).toBe(
        originalOverflow,
      );
      expect(hidden).toBe(1);
    });

    it('switches between inline and native presentation without leaking modal state', () => {
      let shown = 0;
      let hidden = 0;
      component.onShow.subscribe(() => shown++);
      component.onHide.subscribe(() => hidden++);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      expect(dialog.matches(':modal')).toBeTrue();

      fixture.componentRef.setInput('inline', true);
      fixture.detectChanges();
      expect(dialog.open).toBeTrue();
      expect(dialog.matches(':modal')).toBeFalse();
      expect(document.body.style.getPropertyValue('overflow')).not.toBe(
        'hidden',
      );

      fixture.componentRef.setInput('inline', false);
      fixture.detectChanges();
      expect(dialog.open).toBeTrue();
      expect(dialog.matches(':modal')).toBeTrue();
      expect(document.body.style.getPropertyValue('overflow')).toBe('hidden');
      expect(shown).toBe(1);
      expect(hidden).toBe(0);

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      expect(hidden).toBe(1);
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
      const first = fixture.nativeElement.querySelector(
        '.orc-modal__close-btn button',
      ) as HTMLElement;
      const last = fixture.nativeElement.querySelector(
        '.orc-modal__maximize',
      ) as HTMLElement;
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

    it('restores focus to the pointer opener when the browser leaves focus on the document root', () => {
      const body = document.body;
      const previousTabIndex = body.getAttribute('tabindex');
      const opener = document.createElement('button');
      opener.textContent = 'Open modal';
      body.appendChild(opener);
      body.setAttribute('tabindex', '-1');
      body.focus();

      try {
        opener.dispatchEvent(
          new MouseEvent('click', { bubbles: true, detail: 1 }),
        );
        expect(document.activeElement).toBe(body);

        component.isOpen.set(true);
        fixture.detectChanges();
        component['focusInitialElement']();
        component.isOpen.set(false);
        fixture.detectChanges();

        expect(document.activeElement).toBe(opener);
      } finally {
        fixture.destroy();
        opener.remove();
        if (previousTabIndex === null) body.removeAttribute('tabindex');
        else body.setAttribute('tabindex', previousTabIndex);
      }
    });

    it('prefers the captured pointer opener over stale focus elsewhere in the document', () => {
      const staleFocus = document.createElement('button');
      const opener = document.createElement('button');
      staleFocus.textContent = 'Previously focused';
      opener.textContent = 'Open modal';
      document.body.append(staleFocus, opener);
      staleFocus.focus();

      try {
        opener.dispatchEvent(
          new MouseEvent('click', { bubbles: true, detail: 1 }),
        );
        expect(document.activeElement).toBe(staleFocus);

        component.isOpen.set(true);
        fixture.detectChanges();
        component.isOpen.set(false);
        fixture.detectChanges();

        expect(document.activeElement).toBe(opener);
      } finally {
        fixture.destroy();
        staleFocus.remove();
        opener.remove();
      }
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

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostModalComponent],
      }).compileComponents();

      hostFixture = TestBed.createComponent(HostModalComponent);
      hostFixture.detectChanges();
    });

    it('should project modal header and body', () => {
      const headerEl =
        hostFixture.nativeElement.querySelector('[modal-header]');
      const bodyEl = hostFixture.nativeElement.querySelector('[modal-body]');

      expect(headerEl.textContent).toContain('Título do Modal');
      expect(bodyEl.textContent).toContain('Conteúdo do modal de teste');
    });
  });
});
