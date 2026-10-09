import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '@ciag/orchestra/icon';
import { map } from 'rxjs';
import { CATALOG_ENTRIES } from '../../catalog';
import { DOCS_LOCALE, docsUi } from '../../i18n/docs-ui';
import type {
  ComponentApiKind,
  ComponentApiMember,
} from '../../models/component-api.model';
import type {
  ComponentDocContent,
  ComponentPageData,
} from '../../models/component-page.model';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { DocTextComponent } from '../../shared/doc-text/doc-text.component';
import {
  DocsSidebarComponent,
  groupRegistry,
} from '../../shared/docs-sidebar/docs-sidebar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

type ExampleView = 'preview' | 'code';

const API_KINDS: readonly ComponentApiKind[] = ['input', 'model', 'output'];

/** Ids das seções (âncoras estáveis, independentes do idioma). */
export const SECTION_IDS = {
  usage: 'quando-usar',
  examples: 'exemplos',
  anatomy: 'anatomia',
  api: 'api',
  accessibility: 'acessibilidade',
  migration: 'migracao',
} as const;

/**
 * Template ÚNICO de página de componente. Todo o conteúdo vem do registro
 * gerado: `DOC` + exemplos (com código-fonte embutido) de
 * `content/components/<id>/` e a API gerada do inventário. A página não tem
 * nada específico de família.
 */
@Component({
  selector: 'app-component-page',
  standalone: true,
  imports: [
    NgComponentOutlet,
    RouterLink,
    IconComponent,
    CodeBlockComponent,
    DocTextComponent,
    DocsSidebarComponent,
    FooterComponent,
  ],
  templateUrl: './component-page.component.html',
  styleUrl: './component-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly ui = docsUi();
  protected readonly sections = SECTION_IDS;
  protected readonly apiKinds = API_KINDS;
  protected readonly exampleTabs: readonly ExampleView[] = ['preview', 'code'];

  private readonly data = toSignal(
    this.route.data.pipe(
      map((data) => ({
        page: data['page'] as ComponentPageData,
        api: (data['api'] ?? []) as readonly ComponentApiMember[],
      })),
    ),
    {
      initialValue: {
        page: this.route.snapshot.data['page'] as ComponentPageData,
        api: (this.route.snapshot.data['api'] ??
          []) as readonly ComponentApiMember[],
      },
    },
  );

  readonly doc = computed(() => this.data().page.doc);
  readonly examples = computed(() => this.data().page.examples);
  readonly api = computed(() => this.data().api);
  readonly text = computed<ComponentDocContent>(
    () => this.doc().i18n[DOCS_LOCALE] ?? this.doc().i18n['pt-BR'],
  );
  readonly groupLabel = computed(() => this.ui.groups[this.doc().group]);
  readonly experimental = computed(() => this.doc().status === 'experimental');

  /** `import { A, B } from '@ciag/orchestra/x';` a partir da API gerada. */
  readonly importSnippet = computed(() => {
    const names = [...new Set(this.api().map((member) => member.component))];
    return names.length
      ? `import { ${names.join(', ')} } from '${this.doc().packagePath}';`
      : `import { … } from '${this.doc().packagePath}';`;
  });

  readonly sourceDir = computed(
    () => `projects/docs/src/app/content/components/${this.doc().id}/`,
  );

  readonly toc = computed(() => {
    const s = this.ui.page.sections;
    return [
      { id: SECTION_IDS.usage, label: s.usage, children: [] },
      {
        id: SECTION_IDS.examples,
        label: s.examples,
        children: this.examples().map((example) => ({
          id: this.exampleAnchor(example.slug),
          label: this.text().examples[example.slug]?.title ?? example.slug,
        })),
      },
      { id: SECTION_IDS.anatomy, label: s.anatomy, children: [] },
      { id: SECTION_IDS.api, label: s.api, children: [] },
      { id: SECTION_IDS.accessibility, label: s.accessibility, children: [] },
      { id: SECTION_IDS.migration, label: s.migration, children: [] },
    ];
  });

  /** Vizinhos na ordem da navegação lateral. */
  readonly neighbours = computed(() => {
    const ordered = groupRegistry(CATALOG_ENTRIES).flatMap(
      (group) => group.entries,
    );
    const index = ordered.findIndex((entry) => entry.id === this.doc().id);
    return {
      previous: index > 0 ? ordered[index - 1] : null,
      next:
        index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
    };
  });

  private readonly views = signal<Readonly<Record<string, ExampleView>>>({});

  view(slug: string): ExampleView {
    return this.views()[slug] ?? 'preview';
  }

  setView(slug: string, view: ExampleView): void {
    this.views.update((views) => ({ ...views, [slug]: view }));
  }

  /** Setas, Home e End alternam entre Prévia e Código (padrão WAI-ARIA Tabs). */
  onTabKeydown(event: KeyboardEvent, slug: string): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next: ExampleView;
    if (event.key === 'Home') next = 'preview';
    else if (event.key === 'End') next = 'code';
    else next = this.view(slug) === 'preview' ? 'code' : 'preview';
    this.setView(slug, next);
    const tablist = (event.currentTarget as HTMLElement).closest(
      '[role="tablist"]',
    );
    tablist?.querySelector<HTMLElement>(`[data-view="${next}"]`)?.focus();
  }

  exampleAnchor(slug: string): string {
    return `exemplo-${slug}`;
  }

  entriesOf(member: ComponentApiMember, kind: ComponentApiKind) {
    return member.entries.filter((entry) => entry.kind === kind);
  }

  /** Divide `Shift + Tab` / `Enter / Espaço` em teclas para `<kbd>`. */
  keyParts(keys: string): { key: string; separator: string }[] {
    return keys
      .split(/(\s[+/]\s)/)
      .reduce<{ key: string; separator: string }[]>((parts, piece) => {
        if (/^\s[+/]\s$/.test(piece)) {
          if (parts.length) parts[parts.length - 1].separator = piece.trim();
        } else if (piece.trim()) {
          parts.push({ key: piece.trim(), separator: '' });
        }
        return parts;
      }, []);
  }

  alternativeName(id: string): string {
    return CATALOG_ENTRIES.find((entry) => entry.id === id)?.name ?? id;
  }
}
