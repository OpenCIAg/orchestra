import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { ProgressPageComponent } from './progress-page.component';

describe('Progress documentation deep links', () => {
  it('opens the Stepper playground from the catalog URL', () => {
    const queryParamMap = convertToParamMap({ tab: 'stepper' });
    TestBed.configureTestingModule({
      imports: [ProgressPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap } },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProgressPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain(
      'Progress & Stepper',
    );
    expect(root.querySelector('orc-stepper')).not.toBeNull();
    expect(
      Array.from(root.querySelectorAll<HTMLButtonElement>('.segment-btn')).find(
        (button) => button.textContent?.trim() === 'Stepper',
      )?.classList,
    ).toContain('segment-btn--active');
  });
});
