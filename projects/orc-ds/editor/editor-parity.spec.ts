import { TestBed } from '@angular/core/testing';
import { EditorComponent } from '@ciag/orchestra/p2';
import type { EditorAction } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the editor. The specs import the component
 * through the public `@ciag/orchestra/p2` surface and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('Editor behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.componentRef.setInput('ariaLabel', 'Article');
    fixture.detectChanges();
    return fixture;
  }

  function surface(fixture: ReturnType<typeof create>): HTMLElement {
    return fixture.nativeElement.querySelector(
      '[role="textbox"]',
    ) as HTMLElement;
  }

  function type(fixture: ReturnType<typeof create>, html: string): void {
    const root = surface(fixture);
    root.innerHTML = html;
    root.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  it('sanitizes forms values before display', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(
      '<p>Hello</p><script>alert(1)</script>',
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toContain('<p>Hello</p>');
    expect(fixture.componentInstance.value()).not.toContain('script');
    expect(surface(fixture).innerHTML).toContain('Hello');
  });

  it('reports text changes through onTextChange and blur through the blur output', () => {
    const fixture = create();
    const texts: string[] = [];
    const htmls: string[] = [];
    const blurred: string[] = [];
    fixture.componentInstance.onTextChange.subscribe((event) => {
      texts.push(event.text);
      htmls.push(event.html);
    });
    fixture.componentInstance.blur.subscribe((value) => blurred.push(value));

    type(fixture, '<p>First line</p>');
    expect(texts.length).toBe(1);
    expect(texts[0]).toContain('First line');
    expect(htmls[0]).toContain('First line');

    surface(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(blurred.length).toBe(1);
  });

  it('executes toolbar actions through execCommand and skips them while readonly', () => {
    const fixture = create();
    fixture.componentRef.setInput('actions', [
      { command: 'bold', icon: 'B', label: 'Bold' },
    ] satisfies EditorAction[]);
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector(
      '[role="toolbar"]',
    ) as HTMLElement;
    expect(toolbar.querySelectorAll('button').length).toBe(1);

    type(fixture, '<p>selectable text</p>');
    const selection = fixture.nativeElement.ownerDocument.getSelection();
    const range = fixture.nativeElement.ownerDocument.createRange();
    range.selectNodeContents(surface(fixture));
    selection?.removeAllRanges();
    selection?.addRange(range);

    const boldButton = toolbar.querySelector('button') as HTMLButtonElement;
    boldButton.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value().toLowerCase()).toContain('<b>');

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    type(fixture, '<p>plain</p>');
    // The surface is no longer editable and the toolbar is hidden by CSS.
    expect(surface(fixture).getAttribute('contenteditable')).toBe('false');
    const readonlyToolbar = fixture.nativeElement.querySelector(
      '[role="toolbar"]',
    ) as HTMLElement;
    expect(getComputedStyle(readonlyToolbar).display).toBe('none');
  });

  it('exposes the compatibility Quill-like surface through getQuill', () => {
    const fixture = create();
    type(fixture, '<p>surface</p>');
    const quill = fixture.componentInstance.getQuill();
    expect(quill).not.toBeNull();
    expect(quill!.getText()).toContain('surface');
    expect(quill!.getHTML()).toContain('surface');
    expect(quill!.getLength()).toBeGreaterThan(0);

    quill!.insertText(0, 'Hi ');
    fixture.detectChanges();
    expect(surface(fixture).textContent).toContain('Hi surface');
  });

  it('reports onInit after the view initializes', () => {
    const inits: unknown[] = [];
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.componentInstance.onInit.subscribe((event) => inits.push(event));
    fixture.detectChanges();
    expect(inits.length).toBe(1);
    expect((inits[0] as { editor: unknown }).editor).not.toBeNull();
  });
});
