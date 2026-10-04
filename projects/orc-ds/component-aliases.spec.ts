import { TestBed } from '@angular/core/testing';
import { TagComponent } from './tag/tag.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import {
  TagComponent as P2Tag,
  EmptyStateComponent as P2EmptyState,
} from './p2/p2-data-components';

describe('Canonical component aliases', () => {
  it('resolves both Tag import paths to one component and preserves removal outputs', () => {
    expect(P2Tag).toBe(TagComponent);
    const fixture = TestBed.createComponent(P2Tag);
    fixture.componentRef.setInput('value', 'Finance');
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    const removed = jasmine.createSpy('removed');
    const onRemove = jasmine.createSpy('onRemove');
    fixture.componentInstance.removed.subscribe(removed);
    fixture.componentInstance.onRemove.subscribe(onRemove);
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Remove Finance');
    button.click();
    expect(removed).toHaveBeenCalledOnceWith('Finance');
    expect(onRemove).toHaveBeenCalledOnceWith({ value: 'Finance' });
    expect(
      fixture.nativeElement.querySelector('.orc-tag.orc-p2-tag'),
    ).not.toBeNull();
  });

  it('resolves both EmptyState import paths to one component without an empty heading', () => {
    expect(P2EmptyState).toBe(EmptyStateComponent);
    const fixture = TestBed.createComponent(P2EmptyState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2')).toBeNull();
    fixture.componentRef.setInput('title', 'No invoices');
    fixture.componentRef.setInput('actionLabel', 'Create invoice');
    fixture.detectChanges();
    const action = jasmine.createSpy('action');
    fixture.componentInstance.action.subscribe(action);
    fixture.nativeElement.querySelector('button').click();
    expect(action).toHaveBeenCalledTimes(1);
    expect(
      fixture.nativeElement.querySelector(
        '.orc-empty-state.orc-p2-empty-state',
      ),
    ).not.toBeNull();
  });
});
