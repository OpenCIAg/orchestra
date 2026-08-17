import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxChangeEvent } from './checkbox.types';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create checkbox component', () => {
    expect(component).toBeTruthy();
  });

  it('should write checked state via writeValue', () => {
    component.writeValue(true);
    expect(component.checked()).toBeTrue();

    component.writeValue(false);
    expect(component.checked()).toBeFalse();
  });

  it('should toggle state and emit change on toggle', () => {
    let emitted = false;
    component.change.subscribe((event: CheckboxChangeEvent) => {
      emitted = true;
      expect(event.checked).toBeTrue();
    });

    component.toggle();
    expect(component.checked()).toBeTrue();
    expect(emitted).toBeTrue();
  });
});
