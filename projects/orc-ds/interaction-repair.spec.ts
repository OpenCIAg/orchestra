import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider/slider.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';

describe('Interaction control repairs', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderComponent, FileUploaderComponent],
    }).compileComponents();
  });

  it('preserves zero as a valid range endpoint and renders vertical thumbs on the vertical axis', () => {
    const fixture: ComponentFixture<SliderComponent> =
      TestBed.createComponent(SliderComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('range', true);
    fixture.componentRef.setInput('orientation', 'vertical');
    component.writeValue([0, 0]);
    fixture.detectChanges();
    expect(component.currentEndValue()).toBe(0);
    expect(
      (
        fixture.nativeElement.querySelector(
          '.orc-slider-thumb--end',
        ) as HTMLElement
      ).style.bottom,
    ).toBe('0%');
  });

  it('renders and removes selected files through the CVA-backed list', () => {
    const fixture: ComponentFixture<FileUploaderComponent> =
      TestBed.createComponent(FileUploaderComponent);
    const component = fixture.componentInstance;
    const file = new File(['data'], 'report.txt', { type: 'text/plain' });
    component['handleFiles']([file]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-file-item__name').textContent,
    ).toContain('report.txt');
    const id = component.files()[0].id;
    component.onRemoveFile(id);
    expect(component.files()).toEqual([]);
  });
});
