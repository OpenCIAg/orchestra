import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectComponent } from './select.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  imports: [SelectComponent, ModalComponent],
  template: `<orc-modal header="Choose">
    <orc-select label="Size" [options]="options" />
  </orc-modal>`,
})
class DialogHost {
  readonly options = [
    { label: 'Small', value: 's' },
    { label: 'Large', value: 'l' },
  ];
}

describe('Select panel containment in native modals', () => {
  function expectHit(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    expect(hit === element || element.contains(hit))
      .withContext('panel content accepts pointer input')
      .toBeTrue();
  }

  async function openInModal() {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as ModalComponent;
    modal.show();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    for (const animation of dialog.getAnimations({ subtree: true }))
      animation.finish();
    const select = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    select.openPanel();
    fixture.detectChanges();
    return { fixture, modal, dialog, select };
  }

  it('keeps the dropdown panel interactive inside a native modal', async () => {
    const { fixture, modal, dialog, select } = await openInModal();
    try {
      const pane = dialog.querySelector<HTMLElement>('.cdk-overlay-pane');
      expect(pane)
        .withContext('the panel renders inside the owning dialog')
        .not.toBeNull();
      const option = pane!.querySelector<HTMLElement>('[role="option"]')!;
      expect(option).not.toBeNull();
      expectHit(option);

      option.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
      fixture.detectChanges();
      expect(select.isOpen()).toBeFalse();
      expect(modal.isOpen()).toBeTrue();
    } finally {
      fixture.destroy();
    }
  });

  it('closes the panel when the owning modal closes', async () => {
    const { fixture, modal, dialog, select } = await openInModal();
    try {
      expect(select.isOpen()).toBeTrue();
      modal.close();
      fixture.detectChanges();
      TestBed.tick();
      await fixture.whenStable();
      expect(select.isOpen()).toBeFalse();
      expect(dialog.querySelector('.cdk-overlay-pane')).toBeNull();
    } finally {
      fixture.destroy();
    }
  });
});
