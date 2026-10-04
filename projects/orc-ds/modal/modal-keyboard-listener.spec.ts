import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { DrawerComponent } from '../drawer/drawer.component';
import { OverlayPanelComponent } from '../overlay-panel/overlay-panel.component';

describe('Overlay keyboard listener ownership', () => {
  it('does not dispatch document key events to closed modal, drawer or overlay instances', () => {
    const modal = TestBed.createComponent(ModalComponent);
    const drawer = TestBed.createComponent(DrawerComponent);
    const overlay = TestBed.createComponent(OverlayPanelComponent);
    for (const fixture of [modal, drawer, overlay]) fixture.detectChanges();
    TestBed.tick();
    const modalKey = spyOn(
      modal.componentInstance,
      'trapFocus',
    ).and.callThrough();
    const drawerKey = spyOn(
      drawer.componentInstance,
      'onKeydown',
    ).and.callThrough();
    const overlayKey = spyOn(
      overlay.componentInstance,
      'onDocumentKeydown',
    ).and.callThrough();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    );
    expect(modalKey).not.toHaveBeenCalled();
    expect(drawerKey).not.toHaveBeenCalled();
    expect(overlayKey).not.toHaveBeenCalled();
    document.body.append(modal.nativeElement);
    modal.componentRef.setInput('isOpen', true);
    modal.detectChanges();
    TestBed.tick();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    );
    expect(modalKey).toHaveBeenCalledTimes(1);
    modal.componentRef.setInput('isOpen', false);
    modal.detectChanges();
    TestBed.tick();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    );
    expect(modalKey).toHaveBeenCalledTimes(1);
    for (const fixture of [modal, drawer, overlay]) fixture.destroy();
  });
});
