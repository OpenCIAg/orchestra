import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorComponent } from '@ciag/orchestra/editor';
import { expectConsoleWarning } from '../../tools/quality/browser-diagnostics';

function textNodes(root: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const visit = (node: Node): void => {
    if (node.nodeType === 3) {
      nodes.push(node as Text);
      return;
    }
    for (let child = node.firstChild; child; child = child.nextSibling)
      visit(child);
  };
  visit(root);
  return nodes;
}

describe('EditorComponent selection contract', () => {
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
  });

  function surfaceOf(target = fixture): HTMLElement {
    return target.nativeElement.querySelector('.surface') as HTMLElement;
  }

  function editorOf(target = fixture) {
    return target.componentInstance.getQuill()!;
  }

  function select(
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number,
  ): void {
    const ownerDocument = startNode.ownerDocument!;
    const range = ownerDocument.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    const selection = ownerDocument.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  it('maps a range across descendant rich-text nodes to a plain-text offset', () => {
    const surface = surfaceOf();
    surface.innerHTML = '<p>Hello <strong>world</strong>!</p>';
    const nodes = textNodes(surface);

    select(nodes[0], 6, nodes[1], 5);

    expect(editorOf().getSelection()).toEqual({ index: 6, length: 5 });
  });

  it('maps element boundary points as well as text-node boundary points', () => {
    const surface = surfaceOf();
    surface.innerHTML = '<p>Hello <strong>world</strong>!</p>';
    const paragraph = surface.firstElementChild!;

    select(paragraph, 1, paragraph, 2);

    expect(editorOf().getSelection()).toEqual({ index: 6, length: 5 });
  });

  it('preserves explicit breaks and rendered paragraph separators in text offsets', () => {
    const surface = surfaceOf();
    surface.innerHTML = '<p>one<br>two</p>';
    const breakHtml = surface.innerHTML;
    const breakEditor = editorOf();
    expect(breakEditor.getText()).toBe('one\ntwo');
    expect(breakEditor.getLength()).toBe(7);
    breakEditor.setSelection(4, 3);
    expect(surface.innerHTML).toBe(breakHtml);
    expect(breakEditor.getSelection()).toEqual({ index: 4, length: 3 });

    surface.innerHTML = '<p>one</p><p>two</p>';
    const paragraphHtml = surface.innerHTML;
    const paragraphEditor = editorOf();
    expect(paragraphEditor.getText()).toBe('one\n\ntwo');
    expect(paragraphEditor.getLength()).toBe(8);
    const secondText = surface.lastElementChild!.firstChild!;
    select(secondText, 0, secondText, 3);
    expect(paragraphEditor.getSelection()).toEqual({ index: 5, length: 3 });
    paragraphEditor.setSelection(5, 3);
    expect(surface.innerHTML).toBe(paragraphHtml);
    expect(paragraphEditor.getSelection()).toEqual({ index: 5, length: 3 });
  });

  it('maps collapsed element boundaries across rendered separators', () => {
    const surface = surfaceOf();
    surface.innerHTML = '<p>one</p><p>two</p>';
    const paragraphHtml = surface.innerHTML;
    const paragraph = editorOf();

    select(surface, 1, surface, 1);

    expect(paragraph.getSelection()).toEqual({ index: 5, length: 0 });
    expect(surface.innerHTML).toBe(paragraphHtml);

    surface.innerHTML = '<p>one<br>two</p>';
    const breakHtml = surface.innerHTML;
    const paragraphNode = surface.firstElementChild!;

    select(paragraphNode, 1, paragraphNode, 1);
    expect(paragraph.getSelection()).toEqual({ index: 3, length: 0 });
    select(paragraphNode, 2, paragraphNode, 2);
    expect(paragraph.getSelection()).toEqual({ index: 4, length: 0 });
    expect(surface.innerHTML).toBe(breakHtml);
  });

  it('writes nested selections without replacing or flattening rich DOM', () => {
    const surface = surfaceOf();
    surface.innerHTML = '<p>Hello <strong>world</strong>!</p>';
    const html = surface.innerHTML;

    editorOf().setSelection(6, 5);

    expect(surface.innerHTML).toBe(html);
    expect(editorOf().getSelection()).toEqual({ index: 6, length: 5 });
  });

  it('clamps negative and oversized selection requests to the editor text', () => {
    const surface = surfaceOf();
    surface.innerHTML = '<p>Hello <strong>world</strong>!</p>';
    const editor = editorOf();

    editor.setSelection(-10, 1000);
    expect(editor.getSelection()).toEqual({ index: 0, length: 12 });

    editor.setSelection(1000, 4);
    expect(editor.getSelection()).toEqual({ index: 12, length: 0 });
  });

  it('returns null when the active browser selection is outside this editor root', () => {
    const surface = surfaceOf();
    surface.textContent = 'inside';
    const outside = surface.ownerDocument!.createElement('div');
    outside.textContent = 'outside';
    surface.ownerDocument!.body.appendChild(outside);
    const outsideText = outside.firstChild!;

    select(outsideText, 0, outsideText, outsideText.textContent!.length);

    expect(editorOf().getSelection()).toBeNull();
    outside.remove();
  });

  it('handles empty content and keeps an empty selection inside the root', () => {
    const surface = surfaceOf();
    surface.innerHTML = '';

    editorOf().setSelection(10, 4);

    expect(editorOf().getText()).toBe('');
    expect(editorOf().getLength()).toBe(0);
    expect(editorOf().getSelection()).toEqual({ index: 0, length: 0 });
  });

  it('isolates selection reads across multiple editor instances', () => {
    const secondFixture = TestBed.createComponent(EditorComponent);
    secondFixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    document.body.appendChild(secondFixture.nativeElement);
    const firstSurface = surfaceOf();
    const secondSurface = surfaceOf(secondFixture);
    firstSurface.textContent = 'first';
    secondSurface.textContent = 'second';
    const firstText = firstSurface.firstChild!;

    select(firstText, 1, firstText, 4);

    expect(editorOf().getSelection()).toEqual({ index: 1, length: 3 });
    expect(editorOf(secondFixture).getSelection()).toBeNull();

    editorOf(secondFixture).setSelection(2, 2);
    expect(editorOf(secondFixture).getSelection()).toEqual({
      index: 2,
      length: 2,
    });
    expect(editorOf().getSelection()).toBeNull();
    secondFixture.destroy();
  });

  it('sanitizes unsafe pasted markup before updating the model and text output', () => {
    const surface = surfaceOf();
    const editor = fixture.componentInstance;
    const changes: string[] = [];
    const textChanges: Array<{ html: string; text: string }> = [];
    editor.registerOnChange((value: string) => changes.push(value));
    editor.onTextChange.subscribe((event) => textChanges.push(event));

    expectConsoleWarning(/sanitizing unsafe URL value javascript:bad\(\)/);
    expectConsoleWarning(/sanitizing HTML stripped some content/);
    surface.innerHTML =
      '<p>Safe</p><script>window.bad()</script><div onclick="window.bad()">Clicked</div><a href="javascript:bad()">Link</a>';
    surface.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(surface.innerHTML).not.toContain('<script');
    expect(surface.innerHTML).not.toContain('onclick');
    expect(surface.innerHTML).not.toContain('href="javascript:');
    expect(editor.value()).toBe(surface.innerHTML);
    expect(changes).toEqual([surface.innerHTML]);
    expect(textChanges[0].html).toBe(surface.innerHTML);
    expect(textChanges[0].text).toContain('Safe');
  });

  it('sanitizes model writes before rendering the editable surface', () => {
    const editor = fixture.componentInstance;
    expectConsoleWarning(/sanitizing HTML stripped some content/);
    editor.writeValue(
      '<p>Safe</p><img onerror="window.bad()"><script>window.bad()</script>',
    );
    fixture.detectChanges();

    expect(editor.value()).not.toContain('onerror');
    expect(editor.value()).not.toContain('<script');
    expect(surfaceOf().innerHTML).toBe(editor.value());
  });

  it('restores the saved surface selection before toolbar commands execute', () => {
    fixture.componentRef.setInput('actions', [
      { command: 'bold', icon: 'B', label: 'Bold' },
    ]);
    fixture.detectChanges();
    const surface = surfaceOf();
    surface.innerHTML = '<p>Hello world</p>';
    const text = surface.querySelector('p')!.firstChild!;
    select(text, 6, text, 11);
    fixture.componentInstance.emitSelectionChange(new Event('selectionchange'));

    const button = fixture.nativeElement.querySelector(
      '.toolbar button',
    ) as HTMLButtonElement;
    const mousedown = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(mousedown);
    expect(mousedown.defaultPrevented).toBeTrue();
    surface.dispatchEvent(
      new FocusEvent('blur', { bubbles: false, relatedTarget: button }),
    );

    const ownerDocument = surface.ownerDocument;
    const execCommand = spyOn(ownerDocument, 'execCommand').and.returnValue(
      true,
    );
    button.click();

    expect(execCommand).toHaveBeenCalledWith('bold');
    expect(editorOf().getSelection()).toEqual({ index: 6, length: 5 });
  });

  it('remembers selections set through the compatibility API for subsequent formatting', () => {
    const surface = surfaceOf();
    surface.textContent = 'Hello world';
    const editor = editorOf();
    editor.setSelection(6, 5);
    const outside = surface.ownerDocument!.createElement('span');
    outside.textContent = 'outside';
    surface.ownerDocument!.body.appendChild(outside);
    select(outside.firstChild!, 0, outside.firstChild!, 7);

    const execCommand = spyOn(
      surface.ownerDocument!,
      'execCommand',
    ).and.returnValue(true);
    editor.format('bold', true);

    expect(execCommand).toHaveBeenCalledWith('bold', false, 'true');
    expect(editor.getSelection()).toEqual({ index: 6, length: 5 });
    outside.remove();
  });

  it('labels the toolbar and unlabeled actions with useful defaults', () => {
    fixture.componentRef.setInput('actions', [{ command: 'bold', icon: 'B' }]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('[role="toolbar"]')
        ?.getAttribute('aria-label'),
    ).toBe('Text editor formatting');
    expect(
      fixture.nativeElement
        .querySelector('.toolbar button')
        ?.getAttribute('aria-label'),
    ).toBe('bold');
    expect(
      fixture.nativeElement
        .querySelector('[role="textbox"]')
        ?.getAttribute('aria-label'),
    ).toBe('Text editor');
    expect(
      fixture.nativeElement
        .querySelector('[role="textbox"]')
        ?.getAttribute('aria-multiline'),
    ).toBe('true');
  });

  it('exposes readonly and disabled editor state on the textbox', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector(
      '[role="textbox"]',
    ) as HTMLElement;
    expect(surface.getAttribute('contenteditable')).toBe('false');
    expect(surface.getAttribute('aria-readonly')).toBe('true');
    expect(surface.getAttribute('aria-disabled')).toBeNull();

    fixture.componentRef.setInput('readonly', false);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(surface.getAttribute('contenteditable')).toBe('false');
    expect(surface.getAttribute('aria-readonly')).toBeNull();
    expect(surface.getAttribute('aria-disabled')).toBe('true');
  });
});
