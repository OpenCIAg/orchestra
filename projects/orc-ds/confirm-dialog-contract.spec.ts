import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  ConfirmDialogComponent,
  ConfirmationService,
} from '@ciag/orchestra/confirm-dialog';
import { lockDocumentScroll } from './internal/overlay-lifecycle';

describe('ConfirmDialog policy contract', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let service: ConfirmationService;
  let originalOverflow: string;
  let originalPriority: string;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    service = TestBed.inject(ConfirmationService);
    originalOverflow = document.body.style.getPropertyValue('overflow');
    originalPriority = document.body.style.getPropertyPriority('overflow');
  });

  afterEach(() => {
    service.close();
    fixture.destroy();
    if (originalOverflow)
      document.body.style.setProperty(
        'overflow',
        originalOverflow,
        originalPriority,
      );
    else document.body.style.removeProperty('overflow');
  });

  it('locks document scrolling while open and restores inline overflow on close', () => {
    document.body.style.setProperty('overflow', 'scroll', 'important');
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    service.close();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.style.getPropertyPriority('overflow')).toBe(
      'important',
    );
  });

  it('does not lock scrolling when blockScroll is disabled', () => {
    document.body.style.overflow = 'auto';
    fixture.componentRef.setInput('blockScroll', false);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('cooperates with another document-scoped scroll lock', () => {
    document.body.style.overflow = 'scroll';
    const releaseOtherLock = lockDocumentScroll(document);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    service.close();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    releaseOtherLock();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('sets RTL direction and keeps Tab focus within the alertdialog', () => {
    fixture.componentRef.setInput('rtl', true);
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    const buttons = Array.from(
      dialog.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(dialog.getAttribute('dir')).toBe('rtl');
    expect(buttons.length).toBe(2);

    buttons[1].focus();
    const forward = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    buttons[1].dispatchEvent(forward);
    expect(forward.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].focus();
    const backward = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
      shiftKey: true,
    });
    buttons[0].dispatchEvent(backward);
    expect(backward.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('releases the document lock when destroyed while open', () => {
    document.body.style.overflow = 'scroll';
    service.confirm({ message: 'Continue?' });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.destroy();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('captures, traps, scroll-locks, and restores focus in the host iframe', fakeAsync(() => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const ownerDocument = frame.contentDocument!;
    const opener = ownerDocument.createElement('button');
    ownerDocument.body.append(opener);
    opener.focus();
    ownerDocument.body.style.overflow = 'scroll';
    const parentOverflow = document.body.style.overflow;
    ownerDocument.body.append(fixture.nativeElement);

    try {
      service.confirm({ message: 'Continue?' });
      fixture.detectChanges();
      tick();

      const dialog = ownerDocument.querySelector(
        '[role="alertdialog"]',
      ) as HTMLElement;
      const buttons = Array.from(
        dialog.querySelectorAll('button'),
      ) as HTMLButtonElement[];
      expect(buttons.length).toBe(2);
      expect(ownerDocument.body.style.overflow).toBe('hidden');
      expect(document.body.style.overflow).toBe(parentOverflow);

      buttons[1].focus();
      const KeyboardEventConstructor = ownerDocument.defaultView!.KeyboardEvent;
      const tab = new KeyboardEventConstructor('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      buttons[1].dispatchEvent(tab);
      expect(tab.defaultPrevented).toBeTrue();
      expect(ownerDocument.activeElement).toBe(buttons[0]);

      service.close();
      fixture.detectChanges();
      tick();
      expect(ownerDocument.activeElement).toBe(opener);
      expect(ownerDocument.body.style.overflow).toBe('scroll');
    } finally {
      service.close();
      fixture.destroy();
      ownerDocument.body.style.removeProperty('overflow');
      frame.remove();
    }
  }));
});
