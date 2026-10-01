import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { ComponentDocPageComponent } from './component-doc-page.component';

describe('Editor documentation', () => {
  beforeEach(() => {
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
  });

  it('documents the editor package and renders named toolbar actions', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
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
    expect(text).toContain('ControlValueAccessor');
    expect(text).toContain('formats');
    expect(text).toContain('modules');
    expect(text).toContain('bounds');
    expect(text).toContain('scrollingContainer');
    expect(text).toContain('debug');
    expect(text).toContain('deprecated');
    expect(text).toContain('execCommand');
    expect(text).toContain('Quill');
  });

  it('keeps controlled content and text-change state connected to the preview', () => {
    const fixture = TestBed.createComponent(ComponentDocPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const surface = root.querySelector('orc-editor .surface') as HTMLElement;

    expect(surface.innerHTML).toContain('Safe content');
    expect(
      root.querySelector('[data-testid="editor-text-state"]')?.textContent,
    ).toContain('Nenhuma alteração');

    surface.innerHTML = '<p>Updated project brief</p>';
    surface.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.editorContent()).toContain(
      'Updated project brief',
    );
    expect(
      root.querySelector('[data-testid="editor-text-state"]')?.textContent,
    ).toContain('Updated project brief');
    expect(root.textContent).toContain('Inicializado via onInit.');
  });
});
