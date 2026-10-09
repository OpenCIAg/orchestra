import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  SecurityContext,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

export interface EditorAction {
  command: string;
  icon?: string;
  label?: string;
}

interface EditorTextPosition {
  node: Text;
  start: number;
  end: number;
}

const EDITOR_BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TBODY',
  'TD',
  'TFOOT',
  'TH',
  'THEAD',
  'TR',
  'UL',
]);

@Component({
  selector: 'orc-editor',
  standalone: true,
  templateUrl: './editor.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
})
export class EditorComponent implements ControlValueAccessor, AfterViewInit {
  readonly value = model('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  /** @deprecated Compatibility-only no-op; formatting uses the browser execCommand API and no Quill engine is loaded. */
  readonly formats = input<string[] | undefined>(undefined);
  /** @deprecated Compatibility-only no-op; editor modules are not loaded because this component does not use Quill. */
  readonly modules = input<Record<string, unknown> | undefined>(undefined);
  /** @deprecated Compatibility-only no-op; the browser contenteditable surface determines its own bounds. */
  readonly bounds = input<HTMLElement | string | undefined>(undefined);
  /** @deprecated Compatibility-only no-op; scrolling is managed by the surrounding layout. */
  readonly scrollingContainer = input<HTMLElement | string | undefined>(
    undefined,
  );
  /** @deprecated Compatibility-only no-op; this editor has no Quill debug channel. */
  readonly debug = input<string | undefined>(undefined);

  readonly ariaLabel = input<string | undefined>(undefined);
  readonly actions = input<EditorAction[]>([]);
  readonly blur = output<string>();
  readonly onInit = output<unknown>();
  readonly onTextChange = output<{
    html: string;
    text: string;
    delta?: unknown;
    source?: string;
    editor?: unknown;
  }>();
  readonly onSelectionChange = output<{
    range: { index: number; length: number } | null;
    oldRange?: { index: number; length: number } | null;
    source?: string;
  }>();
  readonly editorSurface = viewChild<ElementRef<HTMLElement>>('surface');
  private readonly sanitizer = inject(DomSanitizer);
  private onModelChange: (value: string) => void = () => {};
  private onModelTouched: () => void = () => {};
  private savedSelection: { index: number; length: number } | null = null;
  readonly cvaDisabled = signal(false);
  readonly activeFormats = signal<Set<string>>(new Set());

  writeValue(value: unknown): void {
    this.value.set(this.sanitizeHtml(value == null ? '' : String(value)));
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  private updateActiveFormats(): void {
    const ownerDocument = this.editorSurface()?.nativeElement.ownerDocument;
    if (!ownerDocument || typeof ownerDocument.queryCommandState !== 'function')
      return;

    const formats = new Set<string>();
    for (const action of this.actions()) {
      try {
        if (ownerDocument.queryCommandState(action.command)) {
          formats.add(action.command);
        }
      } catch {
        // Commands without a toggle state (e.g. insertImage) throw in some engines.
      }
    }
    this.activeFormats.set(formats);
  }

  onInput(event: Event): void {
    if (this.readonly() || this.cvaDisabled()) return;
    const root = event.target as HTMLElement;
    const selection = this.readSelection(root);
    const html = this.sanitizeHtml(root.innerHTML);
    if (root.innerHTML !== html) root.innerHTML = html;
    if (selection) {
      this.savedSelection = selection;
      this.writeSelection(root, selection.index, selection.length);
    }
    const text = this.plainText(root);
    this.value.set(html);
    this.onModelChange(html);
    this.updateActiveFormats();
    this.onTextChange.emit({
      html,
      text,
      source: 'user',
      editor: this.getQuill(),
    });
  }
  handleBlur(): void {
    this.saveSelection();
    this.onModelTouched();
    this.updateActiveFormats();
    this.blur.emit(this.value());
  }
  preserveToolbarSelection(event: Event): void {
    this.saveSelection();
    event.preventDefault();
  }
  exec(command: string): void {
    if (this.readonly() || this.cvaDisabled()) return;
    const root = this.editorSurface()?.nativeElement;
    const ownerDocument = root?.ownerDocument;
    if (!root || typeof ownerDocument?.execCommand !== 'function') return;
    this.restoreSelection(root);
    ownerDocument.execCommand(command);
    this.updateActiveFormats();
  }
  emitSelectionChange(_event: Event): void {
    const root = this.editorSurface()?.nativeElement;
    if (!root) return;
    const range = this.readSelection(root);
    if (range) this.savedSelection = range;
    this.updateActiveFormats();
    this.onSelectionChange.emit({ range, oldRange: null, source: 'user' });
  }
  ngAfterViewInit(): void {
    this.onInit.emit({ editor: this.getQuill() });
  }
  getQuill(): {
    root: HTMLElement;
    getText: () => string;
    getHTML: () => string;
    getLength: () => number;
    format: (name: string, value: unknown) => void;
    insertText: (index: number, text: string) => void;
    getSelection: () => { index: number; length: number } | null;
    setSelection: (index: number, length?: number) => void;
  } | null {
    const root = this.editorSurface()?.nativeElement;
    if (!root) return null;
    return {
      root,
      getText: () => this.plainText(root),
      getHTML: () => root.innerHTML,
      getLength: () => this.plainText(root).length,
      format: (name, value) => {
        const ownerDocument = root.ownerDocument;
        if (
          !this.readonly() &&
          !this.cvaDisabled() &&
          typeof ownerDocument?.execCommand === 'function'
        ) {
          this.restoreSelection(root);
          ownerDocument.execCommand(name, false, String(value));
        }
      },
      insertText: (index, text) => {
        if (this.readonly() || this.cvaDisabled()) return;
        const content = this.plainText(root);
        const insertionPoint = this.clampOffset(index, content.length);
        const next =
          content.slice(0, insertionPoint) +
          text +
          content.slice(insertionPoint);
        root.textContent = next;
        this.onInput({ target: root } as unknown as Event);
      },
      getSelection: () => this.readSelection(root),
      setSelection: (index, length = 0) =>
        this.writeSelection(root, index, length),
    };
  }

  private sanitizeHtml(value: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
  }

  private saveSelection(): void {
    const root = this.editorSurface()?.nativeElement;
    if (!root) return;
    const selection = this.readSelection(root);
    if (selection) this.savedSelection = selection;
  }

  private restoreSelection(root: HTMLElement): void {
    const selection = this.savedSelection;
    if (selection) this.writeSelection(root, selection.index, selection.length);
  }

  private plainText(root: HTMLElement): string {
    return typeof root.innerText === 'string'
      ? root.innerText
      : this.fallbackPlainText(root);
  }

  private textNodes(root: HTMLElement): Text[] {
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

  private fallbackPlainText(root: HTMLElement): string {
    let text = '';
    const visit = (node: Node): void => {
      if (node.nodeType === 3) {
        text += node.nodeValue || '';
        return;
      }
      if (node.nodeType === 1 && (node as HTMLElement).tagName === 'BR') {
        text += '\n';
        return;
      }
      const element = node.nodeType === 1 ? (node as HTMLElement) : null;
      const isBlock = !!element && EDITOR_BLOCK_TAGS.has(element.tagName);
      for (let child = node.firstChild; child; child = child.nextSibling)
        visit(child);
      if (isBlock && text && !text.endsWith('\n'))
        text += element?.tagName === 'P' ? '\n\n' : '\n';
    };
    visit(root);
    return text.replace(/\n+$/, '');
  }

  private ownerSelection(root: HTMLElement): Selection | null {
    const ownerDocument = root.ownerDocument;
    if (!ownerDocument) return null;
    if (typeof ownerDocument.getSelection === 'function') {
      const selection = ownerDocument.getSelection();
      if (selection) return selection;
    }
    const view = ownerDocument.defaultView;
    return view && typeof view.getSelection === 'function'
      ? view.getSelection()
      : null;
  }

  private readSelection(
    root: HTMLElement,
  ): { index: number; length: number } | null {
    const selection = this.ownerSelection(root);
    if (
      !selection ||
      typeof selection.getRangeAt !== 'function' ||
      selection.rangeCount === 0
    )
      return null;
    const range = selection.getRangeAt(0);
    const positions = this.textPositions(root);
    const start = this.offsetBeforeBoundary(
      root,
      range.startContainer,
      range.startOffset,
      positions,
    );
    const end = this.offsetBeforeBoundary(
      root,
      range.endContainer,
      range.endOffset,
      positions,
    );
    if (start === null || end === null) return null;
    return { index: start, length: Math.max(0, end - start) };
  }

  private textPositions(root: HTMLElement): EditorTextPosition[] {
    const rendered = this.plainText(root);
    const positions: EditorTextPosition[] = [];
    let searchFrom = 0;
    for (const node of this.textNodes(root)) {
      const raw = node.nodeValue || '';
      if (!raw) continue;
      const match = rendered.indexOf(raw, searchFrom);
      const start = match >= 0 ? match : searchFrom;
      const end = Math.min(rendered.length, start + raw.length);
      positions.push({ node, start, end });
      searchFrom = end;
    }
    return positions;
  }

  private offsetBeforeBoundary(
    root: HTMLElement,
    container: Node,
    offset: number,
    positions: EditorTextPosition[],
  ): number | null {
    if (container !== root && !root.contains(container)) return null;
    const safeOffset = Number.isFinite(offset)
      ? Math.max(0, Math.trunc(offset))
      : 0;
    if (container.nodeType === 3) {
      const position = positions.find(
        (candidate) => candidate.node === container,
      );
      if (!position) return null;
      return (
        position.start + Math.min(safeOffset, position.end - position.start)
      );
    }
    if (
      container.nodeType === 1 &&
      (container as HTMLElement).tagName === 'BR'
    ) {
      const parent = container.parentNode;
      if (parent && root.contains(parent)) {
        const childOffset = Array.prototype.indexOf.call(
          parent.childNodes,
          container,
        );
        return this.offsetBeforeBoundary(root, parent, childOffset, positions);
      }
      return null;
    }
    const childOffset = Math.min(safeOffset, container.childNodes.length);
    const children = Array.from(container.childNodes);
    const preceding = children.slice(0, childOffset);
    const following = children.slice(childOffset);
    const previousText = this.lastTextPosition(preceding, positions);
    const nextText = this.firstTextPosition(following, positions);
    if (previousText) {
      const previousOffset =
        previousText.end + this.breakCountAfter(preceding, previousText.node);
      return nextText && this.hasBlockBoundary(preceding, following)
        ? nextText.start
        : previousOffset;
    }
    if (nextText) return nextText.start;
    return 0;
  }

  private hasBlockBoundary(preceding: Node[], following: Node[]): boolean {
    const previous = preceding[preceding.length - 1];
    const next = following[0];
    const isBlock = (node: Node | undefined): boolean =>
      node?.nodeType === 1 &&
      EDITOR_BLOCK_TAGS.has((node as HTMLElement).tagName);
    return isBlock(previous) || isBlock(next);
  }

  private firstTextPosition(
    nodes: Node[],
    positions: EditorTextPosition[],
  ): EditorTextPosition | undefined {
    return positions.find((position) =>
      nodes.some(
        (node) =>
          node === position.node ||
          (node.nodeType === 1 &&
            (node as HTMLElement).contains(position.node)),
      ),
    );
  }

  private lastTextPosition(
    nodes: Node[],
    positions: EditorTextPosition[],
  ): EditorTextPosition | undefined {
    let result: EditorTextPosition | undefined;
    for (const position of positions) {
      if (
        nodes.some(
          (node) =>
            node === position.node ||
            (node.nodeType === 1 &&
              (node as HTMLElement).contains(position.node)),
        )
      )
        result = position;
    }
    return result;
  }

  private breakCountAfter(nodes: Node[], target: Text): number {
    let found = false;
    let breaks = 0;
    const visit = (node: Node): void => {
      if (node === target) {
        found = true;
        return;
      }
      if (
        found &&
        node.nodeType === 1 &&
        (node as HTMLElement).tagName === 'BR'
      )
        breaks++;
      for (let child = node.firstChild; child; child = child.nextSibling)
        visit(child);
    };
    for (const node of nodes) visit(node);
    return breaks;
  }

  private clampOffset(value: number, total: number): number {
    if (value === Number.POSITIVE_INFINITY) return total;
    if (!Number.isFinite(value)) return 0;
    return Math.min(total, Math.max(0, Math.trunc(value)));
  }

  private boundaryAt(
    root: HTMLElement,
    offset: number,
    positions: EditorTextPosition[],
  ): { container: Node; offset: number } {
    if (positions.length === 0) return { container: root, offset: 0 };
    for (const position of positions) {
      if (offset < position.start)
        return { container: position.node, offset: 0 };
      if (offset <= position.end)
        return { container: position.node, offset: offset - position.start };
    }
    const last = positions[positions.length - 1];
    return { container: last.node, offset: last.end - last.start };
  }

  private writeSelection(
    root: HTMLElement,
    index: number,
    length: number,
  ): void {
    const ownerDocument = root.ownerDocument;
    const selection = this.ownerSelection(root);
    if (
      !ownerDocument ||
      !selection ||
      typeof ownerDocument.createRange !== 'function'
    )
      return;
    if (
      typeof selection.removeAllRanges !== 'function' ||
      typeof selection.addRange !== 'function'
    )
      return;
    const positions = this.textPositions(root);
    const total = this.plainText(root).length;
    const start = this.clampOffset(index, total);
    const requestedLength =
      length === Number.POSITIVE_INFINITY
        ? total - start
        : Number.isFinite(length)
          ? Math.max(0, Math.trunc(length))
          : 0;
    const end = this.clampOffset(start + requestedLength, total);
    const startBoundary = this.boundaryAt(root, start, positions);
    const endBoundary = this.boundaryAt(root, end, positions);
    try {
      const range = ownerDocument.createRange();
      range.setStart(startBoundary.container, startBoundary.offset);
      range.setEnd(endBoundary.container, endBoundary.offset);
      selection.removeAllRanges();
      selection.addRange(range);
      this.savedSelection = { index: start, length: end - start };
    } catch {
      // Detached or incomplete DOM implementations can reject range mutations.
    }
  }
}
