import { TestBed } from '@angular/core/testing';
import { EditorComponent } from './editor.component';

describe('EditorComponent active toolbar state', () => {
  it('starts without a toolbar unless actions are provided', () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('.toolbar button').length,
    ).toBe(0);
  });

  it('marks the applied format as pressed after executing it', () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.componentRef.setInput('actions', [
      { command: 'bold', label: 'Bold', icon: 'B' },
      { command: 'italic', label: 'Italic', icon: 'I' },
    ]);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);

    const surface = fixture.nativeElement.querySelector(
      '.surface',
    ) as HTMLElement;
    surface.innerHTML = 'texto';
    surface.focus();
    const range = document.createRange();
    range.selectNodeContents(surface);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    fixture.componentInstance.emitSelectionChange(new Event('select'));

    const [bold, italic] = Array.from(
      fixture.nativeElement.querySelectorAll('.toolbar button'),
    ) as HTMLButtonElement[];
    bold.click();
    fixture.detectChanges();

    expect(bold.getAttribute('aria-pressed')).toBe('true');
    expect(bold.classList).toContain('active');
    expect(italic.getAttribute('aria-pressed')).toBe('false');
    fixture.nativeElement.remove();
  });
});
