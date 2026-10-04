import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DrawerComponent } from './drawer.component';
import { OverlayPanelComponent } from '../overlay-panel/overlay-panel.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { focusElement } from '../../../tools/quality/test-focus-events';
import { testBedTick } from '../../../tools/quality/test-bed-tick';

@Component({
  imports: [
    DrawerComponent,
    OverlayPanelComponent,
    DropdownComponent,
    TooltipDirective,
  ],
  template: `<button #trigger class="open-drawer" (click)="drawer.show()">
      Open drawer</button
    ><button class="background">Background</button>
    <orc-drawer #drawer label="Editor">
      <button class="inside" orcTooltip="Edit the name" [showDelay]="0">
        Edit name
      </button>
      <button
        #nestedTrigger
        class="nested-trigger"
        (click)="nested.show($event, nestedTrigger)"
      >
        Open nested
      </button>
      <orc-dropdown label="Layout" [options]="options" />
      <orc-overlay-panel
        #nested
        [modal]="true"
        appendTo="body"
        header="Nested editor"
        ><input aria-label="Nested name"
      /></orc-overlay-panel>
    </orc-drawer>`,
})
class Host {
  options = [
    { label: 'Grid', value: 'grid' },
    { label: 'List', value: 'list' },
  ];
}

describe('Custom modal integration', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    testBedTick();
    const trigger = fixture.nativeElement.querySelector(
      '.open-drawer',
    ) as HTMLButtonElement;
    focusElement(trigger);
    trigger.click();
    fixture.detectChanges();
    testBedTick();
    const drawer = fixture.debugElement.query(By.directive(DrawerComponent))
      .componentInstance as DrawerComponent;
    const nested = fixture.debugElement.query(
      By.directive(OverlayPanelComponent),
    ).componentInstance as OverlayPanelComponent;
    return {
      fixture,
      drawer,
      nested,
      trigger,
      panel: drawer.panel()!.nativeElement,
    };
  }

  it('blocks background focus while allowing backdrop dismissal and restoring trigger focus', () => {
    const { fixture, drawer, trigger, panel } = setup();
    const background: HTMLButtonElement =
      fixture.nativeElement.querySelector('.background');
    focusElement(background);
    expect(panel.contains(document.activeElement)).toBeTrue();
    const backdrop: HTMLElement = fixture.nativeElement.querySelector(
      '.orc-drawer__backdrop',
    );
    expect(backdrop.closest('[inert]')).toBeNull();
    backdrop.click();
    fixture.detectChanges();
    testBedTick();
    expect(drawer.open()).toBeFalse();
    expect(background.closest('[inert]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('isolates a nested body-attached modal, then returns ownership and focus to the drawer', () => {
    const { fixture, drawer, nested, panel } = setup();
    const inside: HTMLButtonElement =
      fixture.nativeElement.querySelector('.inside');
    const nestedTrigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('.nested-trigger');
    focusElement(nestedTrigger);
    nestedTrigger.click();
    fixture.detectChanges();
    testBedTick();
    const nestedPanel = nested.panel()!.nativeElement;
    expect(nestedPanel.parentElement).toBe(document.body);
    expect(nestedPanel.contains(document.activeElement)).toBeTrue();
    focusElement(inside);
    expect(nestedPanel.contains(document.activeElement)).toBeTrue();
    nested.hide();
    fixture.detectChanges();
    testBedTick();
    expect(drawer.open()).toBeTrue();
    expect(panel.closest('[inert]')).toBeNull();
    expect(document.activeElement).toBe(nestedTrigger);
    expect(
      (
        fixture.nativeElement.querySelector('.background') as HTMLElement
      ).closest('[inert]'),
    ).not.toBeNull();
  });

  it('allows a dropdown opened from the modal and excludes tooltip layers from keyboard ownership', async () => {
    const { fixture, panel } = setup();
    const inside: HTMLButtonElement =
      fixture.nativeElement.querySelector('.inside');
    inside.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    testBedTick();
    await fixture.whenStable();
    const tooltip = document.querySelector('orc-tooltip-overlay')!;
    expect(tooltip).not.toBeNull();
    expect(tooltip.closest('[inert]')).toBeNull();
    const dropdown: HTMLButtonElement = panel.querySelector(
      '.orc-dropdown-trigger',
    )!;
    focusElement(dropdown);
    dropdown.click();
    fixture.detectChanges();
    testBedTick();
    await fixture.whenStable();
    const option = document.querySelector<HTMLButtonElement>(
      '.orc-dropdown-menu [role="option"]',
    )!;
    expect(option.closest('[inert]')).toBeNull();
    focusElement(option);
    expect(document.activeElement).toBe(option);
    option.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    testBedTick();
    expect(document.activeElement).toBe(dropdown);
    expect(panel.closest('[inert]')).toBeNull();
  });

  it('removes isolation and detached content when the owning view is destroyed', () => {
    const { fixture, nested } = setup();
    nested.show();
    fixture.detectChanges();
    testBedTick();
    const extra = document.createElement('button');
    document.body.append(extra);
    const panel = nested.panel()!.nativeElement;
    fixture.destroy();
    expect(panel.isConnected).toBeFalse();
    focusElement(extra);
    expect(document.activeElement).toBe(extra);
    expect(extra.closest('[inert]')).toBeNull();
    extra.remove();
  });
});
