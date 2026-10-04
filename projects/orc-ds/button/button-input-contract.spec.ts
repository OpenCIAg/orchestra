import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent public input and output contract', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  it('maps variant, severity, size, and visual modifiers to classes', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(
      button.classList.contains('orc-button--variant-secondary'),
    ).toBeTrue();
    expect(button.classList.contains('orc-button--size-lg')).toBeTrue();

    fixture.componentRef.setInput('severity', 'danger');
    fixture.componentRef.setInput('link', true);
    fixture.componentRef.setInput('text', true);
    fixture.componentRef.setInput('outlined', true);
    fixture.componentRef.setInput('raised', true);
    fixture.componentRef.setInput('rounded', true);
    fixture.componentRef.setInput('plain', true);
    fixture.componentRef.setInput('fullWidth', true);
    fixture.componentRef.setInput('fluid', true);
    fixture.detectChanges();

    expect(button.classList.contains('orc-button--variant-link')).toBeTrue();
    expect(button.classList.contains('orc-button--text')).toBeTrue();
    expect(button.classList.contains('orc-button--outlined')).toBeTrue();
    expect(button.classList.contains('orc-button--raised')).toBeTrue();
    expect(button.classList.contains('orc-button--rounded')).toBeTrue();
    expect(button.classList.contains('orc-button--plain')).toBeTrue();
    expect(button.classList.contains('orc-button--full-width')).toBeTrue();
    expect(button.classList.contains('orc-button--fluid')).toBeTrue();

    fixture.componentRef.setInput('link', false);
    fixture.detectChanges();
    expect(button.classList.contains('orc-button--variant-danger')).toBeTrue();
  });

  it('binds native, form, ARIA, style, and custom class inputs', () => {
    fixture.componentRef.setInput('id', 'save-action');
    fixture.componentRef.setInput('tabindex', 4);
    fixture.componentRef.setInput('type', 'submit');
    fixture.componentRef.setInput('form', 'edit-form');
    fixture.componentRef.setInput('ariaLabel', 'Save changes');
    fixture.componentRef.setInput('ariaLabelledBy', 'save-heading');
    fixture.componentRef.setInput('ariaExpanded', true);
    fixture.componentRef.setInput('ariaControls', 'save-panel');
    fixture.componentRef.setInput('styleClass', 'consumer-button');
    fixture.componentRef.setInput('style', { '--audit-marker': 'visible' });
    fixture.detectChanges();

    expect(button.id).toBe('save-action');
    expect(button.getAttribute('tabindex')).toBe('4');
    expect(button.type).toBe('submit');
    expect(button.getAttribute('form')).toBe('edit-form');
    expect(button.getAttribute('aria-label')).toBe('Save changes');
    expect(button.getAttribute('aria-labelledby')).toBe('save-heading');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('save-panel');
    expect(button.classList.contains('consumer-button')).toBeTrue();
    expect(button.style.getPropertyValue('--audit-marker')).toBe('visible');
  });

  it('renders configured icon positions, badge content, and loading icons', () => {
    fixture.componentRef.setInput('icon', 'pi pi-download');
    fixture.componentRef.setInput('iconPos', 'right');
    fixture.componentRef.setInput('iconLeft', 'pi pi-check');
    fixture.componentRef.setInput('iconRight', 'pi pi-arrow-right');
    fixture.componentRef.setInput('badge', 3);
    fixture.componentRef.setInput('badgeClass', 'count-badge');
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingIcon', 'pi pi-refresh');
    fixture.detectChanges();

    expect(button.querySelector('.orc-button__icon--left i')?.className).toBe(
      'pi pi-check',
    );
    expect(button.querySelector('.orc-button__icon--right i')?.className).toBe(
      'pi pi-arrow-right',
    );
    expect(button.classList.contains('orc-button--icon-right')).toBeTrue();
    expect(button.querySelector('.orc-button__badge')?.textContent).toBe('3');
    expect(
      button
        .querySelector('.orc-button__badge')
        ?.classList.contains('count-badge'),
    ).toBeTrue();
    const badge = button.querySelector('.orc-button__badge')!;
    expect(getComputedStyle(badge).minWidth).toBe('20px');
    expect(getComputedStyle(badge).borderRadius).toBe('9999px');
    expect(
      button
        .querySelector('.orc-button__loading-icon')
        ?.classList.contains('pi'),
    ).toBeTrue();
    expect(button.querySelector('.orc-button__spinner-svg')).toBeNull();
  });

  it('sanitizes a custom SVG loading icon and keeps the default when unset', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(button.querySelector('.orc-button__spinner-svg')).not.toBeNull();

    fixture.componentRef.setInput(
      'loadingIcon',
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><path d="M1 1h2v2z" /></svg>',
    );
    fixture.detectChanges();
    const spinnerIcon = button.querySelector('.orc-button__spinner svg');
    expect(spinnerIcon).not.toBeNull();
    expect(spinnerIcon?.querySelector('script')).toBeNull();
    expect(spinnerIcon?.hasAttribute('onload')).toBeFalse();
    expect(spinnerIcon?.querySelector('path')).not.toBeNull();
    expect(button.querySelector('.orc-button__spinner-svg')).toBeNull();
  });

  it('emits the component click, focus, and blur outputs from native events', () => {
    const clicks: MouseEvent[] = [];
    const focuses: FocusEvent[] = [];
    const blurs: FocusEvent[] = [];
    component.click.subscribe((event) => clicks.push(event));
    component.onFocus.subscribe((event) => focuses.push(event));
    component.onBlur.subscribe((event) => blurs.push(event));

    button.click();
    const focus = new FocusEvent('focus');
    const blur = new FocusEvent('blur');
    button.dispatchEvent(focus);
    button.dispatchEvent(blur);

    expect(clicks.length).toBe(1);
    expect(focuses).toEqual([focus]);
    expect(blurs).toEqual([blur]);
  });
});
