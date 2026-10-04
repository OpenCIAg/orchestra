import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { lockDocumentScroll } from '@ciag/orchestra/internal';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `<button id="opener">Open</button
    ><orc-modal [isOpen]="open"
      ><h2 modal-header>Details</h2>
      <p class="plain-body">Default content</p>
      <button class="body-action">Action</button></orc-modal
    >`,
})
class ModalContentHost {
  open = false;
}

describe('Modal lifecycle and projection', () => {
  it('keeps both visibility models synchronized when either is controlled', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(fixture.nativeElement.querySelector('dialog').open).toBeFalse();
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.isOpen()).toBeFalse();
  });

  it('synchronizes native dialog close and emits the close lifecycle once', async () => {
    const fixture = TestBed.createComponent(ModalComponent);
    const modal = fixture.componentInstance;
    const closed = jasmine.createSpy();
    const hidden = jasmine.createSpy();
    modal.closed.subscribe(closed);
    modal.onHide.subscribe(hidden);
    modal.show();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    dialog.close();
    await new Promise((resolve) => setTimeout(resolve, 30));
    fixture.detectChanges();
    expect(modal.isOpen()).toBeFalse();
    expect(modal.visible()).toBeFalse();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(hidden).toHaveBeenCalledTimes(1);
  });

  it('preserves consumer scroll state across overlapping locks and repeated release', () => {
    const original = document.body.style.getPropertyValue('overflow');
    const priority = document.body.style.getPropertyPriority('overflow');
    document.body.style.setProperty('overflow', 'scroll', 'important');
    const first = lockDocumentScroll(document);
    const second = lockDocumentScroll(document);
    first();
    first();
    expect(document.body.style.overflow).toBe('hidden');
    second();
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.style.getPropertyPriority('overflow')).toBe(
      'important',
    );
    if (original)
      document.body.style.setProperty('overflow', original, priority);
    else document.body.style.removeProperty('overflow');
  });

  it('projects ordinary body content, names the dialog from its header, and restores focus on destroy', async () => {
    const fixture = TestBed.createComponent(ModalContentHost);
    fixture.detectChanges();
    const opener = fixture.nativeElement.querySelector(
      '#opener',
    ) as HTMLButtonElement;
    opener.focus();
    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    expect(dialog.querySelector('.plain-body')?.textContent).toBe(
      'Default content',
    );
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(
      document.getElementById(dialog.getAttribute('aria-labelledby')!)
        ?.textContent,
    ).toContain('Details');
    fixture.componentInstance.open = false;
    fixture.detectChanges();
    expect(document.activeElement).toBe(opener);
  });

  it('hides a configured hidden header and does not reserve empty footer space', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('inline', true);
    fixture.componentRef.setInput('showHeader', false);
    fixture.detectChanges();
    expect(
      getComputedStyle(fixture.nativeElement.querySelector('header')).display,
    ).toBe('none');
    expect(
      getComputedStyle(fixture.nativeElement.querySelector('footer')).display,
    ).toBe('none');
  });

  it('does not name the dialog from a hidden header', async () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('header', 'Hidden title');
    fixture.componentRef.setInput('showHeader', false);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;

    expect(dialog.getAttribute('aria-labelledby')).toBeNull();
    expect(dialog.getAttribute('aria-label')).toBe('Dialog');
  });
});
