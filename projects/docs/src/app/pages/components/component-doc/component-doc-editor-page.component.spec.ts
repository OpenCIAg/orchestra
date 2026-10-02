import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { ComponentDocPageComponent } from './component-doc-page.component';
import { EditorExampleComponent } from './examples/editor-example.component';

/**
 * The renderer lazy-loads the family's API reference and live example chunks
 * after the route param lands; poll until the preview settles before
 * asserting.
 */
async function renderEditorDoc(): Promise<
  ComponentFixture<ComponentDocPageComponent>
> {
  const paramMap = convertToParamMap({ componentId: 'editor' });
  TestBed.configureTestingModule({
    imports: [ComponentDocPageComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(paramMap), snapshot: { paramMap } },
      },
    ],
  });
  const fixture = TestBed.createComponent(ComponentDocPageComponent);
  fixture.detectChanges();
  const start = Date.now();
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    fixture.detectChanges();
    const load = fixture.componentInstance.exampleLoad();
    if (load === 'ready' || load === 'none') break;
    if (Date.now() - start > 5_000) {
      throw new Error('editor example did not settle in time');
    }
  }
  return fixture;
}

describe('Editor documentation', () => {
  it('documents the editor package and renders named toolbar actions', async () => {
    const fixture = await renderEditorDoc();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent ?? '';
    const toolbar = root.querySelector('orc-editor [role="toolbar"]');

    expect(root.querySelector('h1')?.textContent).toContain('Editor');
    expect(root.querySelector('orc-editor')).not.toBeNull();
    expect(toolbar?.getAttribute('aria-label')).toBe(
      'Descrição do projeto formatting',
    );
    expect(toolbar?.querySelectorAll('button')).toHaveSize(3);
    expect(
      toolbar?.querySelector('button[aria-label="Negrito"]'),
    ).not.toBeNull();
    expect(
      toolbar?.querySelector('button[aria-label="Itálico"]'),
    ).not.toBeNull();
    expect(text).toContain('@ciag/orchestra/editor');
    expect(text).toContain('EditorAction[]');
    expect(text).toContain('onTextChange');
    expect(text).toContain('onSelectionChange');
    expect(text).toContain('execCommand');
    expect(text).toContain('Quill');
    fixture.destroy();
  });

  it('keeps controlled content and text-change state connected to the preview', async () => {
    const fixture = await renderEditorDoc();
    const root = fixture.nativeElement as HTMLElement;
    const surface = root.querySelector('orc-editor .surface') as HTMLElement;

    expect(surface.innerHTML).toContain('Safe content');
    expect(
      root.querySelector('[data-testid="editor-text-state"]')?.textContent,
    ).toContain('Nenhuma alteração');

    surface.innerHTML = '<p>Updated project brief</p>';
    surface.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const example = fixture.debugElement.query(
      By.directive(EditorExampleComponent),
    ).componentInstance as EditorExampleComponent;
    expect(example.content()).toContain('Updated project brief');
    expect(
      root.querySelector('[data-testid="editor-text-state"]')?.textContent,
    ).toContain('Updated project brief');
    expect(root.textContent).toContain('Inicializado via onInit.');
    fixture.destroy();
  });
});
