import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalComponent } from './modal.component';
import { OverlayPanelComponent } from '../overlay-panel/overlay-panel.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SelectComponent } from '../select/select.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { focusElement } from '../../../tools/quality/test-focus-events';

@Component({
  imports: [
    ModalComponent,
    OverlayPanelComponent,
    DropdownComponent,
    SelectComponent,
    TooltipDirective,
  ],
  template: `<button class="opener" (click)="modal.show()">Edit</button>
    <orc-modal #modal header="Editor">
      <button class="help" orcTooltip="Editor help" [showDelay]="0">
        Help
      </button>
      <button
        #anchor
        class="popup-trigger"
        (click)="popup.show($event, anchor)"
      >
        Details
      </button>
      <orc-overlay-panel
        #popup
        appendTo="body"
        header="Details"
        [modal]="popupModal"
        [closeOnEscape]="popupEscape"
        ><input aria-label="Details"
      /></orc-overlay-panel>
      <orc-dropdown label="Layout" [options]="options" />
      <orc-select ariaLabel="Layout" [options]="options" [filter]="true" />
    </orc-modal>`,
})
class Host {
  popupEscape = true;
  popupModal = false;
  options = [
    { label: 'Grid', value: 'grid' },
    { label: 'List', value: 'list' },
  ];
}

describe('Native modal popup integration', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const opener: HTMLButtonElement =
      fixture.nativeElement.querySelector('.opener');
    focusElement(opener);
    opener.click();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    const dialog: HTMLDialogElement =
      fixture.nativeElement.querySelector('dialog');
    // Geometry should represent the settled modal, not its opening animation.
    for (const animation of dialog.getAnimations({ subtree: true }))
      animation.finish();
    const modal = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as ModalComponent;
    return { fixture, dialog, modal, opener };
  }

  function expectInteractive(element: HTMLElement) {
    focusElement(element);
    expect(document.activeElement)
      .withContext('popup control accepts native focus')
      .toBe(element);
    const bounds = element.getBoundingClientRect();
    const hit = document.elementFromPoint(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
    );
    expect(element === hit || element.contains(hit))
      .withContext(
        'popup is above the modal backdrop and accepts pointer input',
      )
      .toBeTrue();
  }

  it('keeps a body-requested panel interactive and returns focus without closing its modal', async () => {
    const { fixture, dialog, modal } = await setup();
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('.popup-trigger');
    focusElement(trigger);
    trigger.click();
    fixture.detectChanges();
    TestBed.tick();
    const popup = fixture.debugElement.query(
      By.directive(OverlayPanelComponent),
    ).componentInstance as OverlayPanelComponent;
    const panel = popup.panel()!.nativeElement;
    expectInteractive(panel.querySelector('input')!);
    panel.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(popup.open()).toBeFalse();
    expect(modal.isOpen()).toBeTrue();
    expect(dialog.open).toBeTrue();
    expect(document.activeElement).toBe(trigger);
  });

  it('allows dropdown option activation and keeps the parent open', async () => {
    const { fixture, modal } = await setup();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.orc-dropdown-trigger',
    );
    focusElement(trigger);
    trigger.click();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    const option = document.querySelector<HTMLButtonElement>(
      '.orc-dropdown-menu [role="option"]',
    )!;
    expectInteractive(option);
    option.click();
    fixture.detectChanges();
    TestBed.tick();
    const dropdown = fixture.debugElement.query(By.directive(DropdownComponent))
      .componentInstance as DropdownComponent;
    expect(dropdown.value()).toBe('grid');
    expect(dropdown.isOpen()).toBeFalse();
    expect(modal.isOpen()).toBeTrue();
    expect(document.activeElement).toBe(trigger);
  });

  it('allows filtering in Select and handles Escape only in the popup', async () => {
    const { fixture, modal } = await setup();
    const select = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    const trigger = select.triggerEl()!.nativeElement;
    focusElement(trigger);
    select.openPanel();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    const search = document.querySelector<HTMLInputElement>(
      '.orc-select-search-input',
    )!;
    expect(search).not.toBeNull();
    expectInteractive(search);
    search.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    TestBed.tick();
    expect(select.isOpen()).toBeFalse();
    expect(modal.isOpen()).toBeTrue();
    expect(document.activeElement).toBe(trigger);
  });

  it('renders tooltip content within the native modal top layer and removes it on destroy', async () => {
    const { fixture, dialog } = await setup();
    const help: HTMLButtonElement =
      fixture.nativeElement.querySelector('.help');
    help.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    const tooltip = document.querySelector<HTMLElement>('orc-tooltip-overlay')!;
    expect(tooltip).not.toBeNull();
    expect(dialog.contains(tooltip)).toBeTrue();
    fixture.destroy();
    expect(tooltip.isConnected).toBeFalse();
  });

  it('does not let native cancellation close the parent of an active popup', async () => {
    const { fixture, modal, dialog } = await setup();
    const popupDebug = fixture.debugElement.query(
      By.directive(OverlayPanelComponent),
    );
    fixture.componentInstance.popupEscape = false;
    (
      fixture.nativeElement.querySelector('.popup-trigger') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    TestBed.tick();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    TestBed.tick();
    expect(modal.isOpen()).toBeTrue();
    expect(
      (popupDebug.componentInstance as OverlayPanelComponent).open(),
    ).toBeTrue();
  });

  it('closes active descendant popups when the parent dialog closes', async () => {
    const { fixture, modal } = await setup();
    const select = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    select.openPanel();
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    modal.close();
    fixture.detectChanges();
    TestBed.tick();
    expect(select.isOpen()).toBeFalse();
    expect(document.querySelector('.orc-select-search-input')).toBeNull();
    modal.show();
    fixture.detectChanges();
    TestBed.tick();
    expect(document.querySelector('.orc-select-search-input')).toBeNull();
  });

  it('closes a nested modal panel and tooltip, releases isolation, and restores the original opener', async () => {
    const { fixture, modal, opener } = await setup();
    fixture.componentInstance.popupModal = true;
    (
      fixture.nativeElement.querySelector('.popup-trigger') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    TestBed.tick();
    const popup = fixture.debugElement.query(
      By.directive(OverlayPanelComponent),
    ).componentInstance as OverlayPanelComponent;
    modal.close();
    fixture.detectChanges();
    TestBed.tick();
    expect(popup.open()).toBeFalse();
    expect(document.activeElement).toBe(opener);
    modal.show();
    fixture.detectChanges();
    TestBed.tick();
    (
      fixture.nativeElement.querySelector('.help') as HTMLButtonElement
    ).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    expect(document.querySelector('orc-tooltip-overlay')).not.toBeNull();
    modal.close();
    fixture.detectChanges();
    TestBed.tick();
    expect(document.querySelector('orc-tooltip-overlay')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
