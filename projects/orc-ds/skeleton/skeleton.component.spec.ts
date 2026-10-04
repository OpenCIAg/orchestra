import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent accessibility DOM contract', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [SkeletonComponent] }),
  );

  function create(): ComponentFixture<SkeletonComponent> {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('hides the default decorative placeholder from assistive technology', () => {
    const fixture = create();
    const skeleton = fixture.nativeElement.querySelector(
      '.orc-skeleton',
    ) as HTMLElement;

    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.getAttribute('role')).toBeNull();
    expect(skeleton.getAttribute('aria-busy')).toBeNull();
    expect(skeleton.getAttribute('aria-label')).toBeNull();
  });

  it('announces an explicitly labeled loading placeholder as a status', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Loading profile');
    fixture.detectChanges();
    const skeleton = fixture.nativeElement.querySelector(
      '.orc-skeleton',
    ) as HTMLElement;

    expect(skeleton.getAttribute('aria-hidden')).toBeNull();
    expect(skeleton.getAttribute('role')).toBe('status');
    expect(skeleton.getAttribute('aria-busy')).toBe('true');
    expect(skeleton.getAttribute('aria-label')).toBe('Loading profile');
    expect(skeleton.querySelector('.sr-only')?.textContent).toContain(
      'Loading profile',
    );
  });
});
