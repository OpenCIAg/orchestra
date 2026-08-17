import { TestBed } from '@angular/core/testing';
import { DrawerComponent } from './drawer/drawer.component';
import { PopoverComponent } from './popover/popover.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { ListComponent, ListItem } from './list/list.component';
import { TreeViewComponent } from './tree-view/tree-view.component';

describe('P0 foundation components', () => {
  it('opens and dismisses the drawer', () => {
    const fixture = TestBed.createComponent(DrawerComponent);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    fixture.componentInstance.onEscape();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('toggles the popover state', () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentInstance.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('does not select a disabled list item', () => {
    const fixture = TestBed.createComponent(ListComponent);
    const item: ListItem = { id: 'disabled', label: 'Disabled', disabled: true };
    let selected = false;
    fixture.componentInstance.itemSelect.subscribe(() => selected = true);
    fixture.componentInstance.select(item);
    expect(selected).toBeFalse();
  });

  it('expands tree nodes and creates form primitives', () => {
    const tree = TestBed.createComponent(TreeViewComponent);
    const node = { id: 'root', label: 'Root', children: [{ id: 'child', label: 'Child' }] };
    tree.componentRef.setInput('nodes', [node]);
    tree.componentInstance.toggle(node);
    expect(tree.componentInstance.visibleNodes().length).toBe(2);
    expect(TestBed.createComponent(DatePickerComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(FormFieldComponent).componentInstance).toBeTruthy();
  });
});
