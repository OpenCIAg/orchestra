import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { TreeSelectComponent } from '@ciag/orchestra/tree-select';

describe('TreeSelect lifecycle contract', () => {
  it('cancels deferred blur work when the component is destroyed', fakeAsync(() => {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const touched = jasmine.createSpy('touched');
    const blurEmit = spyOn(component.onBlur, 'emit').and.callThrough();
    component.registerOnTouched(touched);

    component.onHostFocusOut(new FocusEvent('focusout'));
    fixture.destroy();
    flushMicrotasks();

    expect(touched).not.toHaveBeenCalled();
    expect(blurEmit).not.toHaveBeenCalled();
  }));
});
