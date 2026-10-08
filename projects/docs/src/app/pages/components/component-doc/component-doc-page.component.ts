import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { IconComponent } from '@ciag/orchestra/icon';
import {
  ComponentCatalogService,
  categoryLabel,
} from '../../../services/component-catalog.service';
import { COMPONENT_API_LOADERS } from '../../../generated/component-api.registry.generated';
import { COMPONENT_EXAMPLES } from './examples';
import type { ComponentApiMember } from '../../../models/component-api.model';
import type { ComponentEntry } from '../../../models/component-entry.model';
import type { ComponentUsageDoc } from '../../../models/component-doc.model';
import { ScrollTopComponent } from '@ciag/orchestra/scroll-top';

type ExampleLoad = 'none' | 'loading' | 'ready';

/** Live examples may declare a `stateChange` output; it feeds the inspector. */
interface ExampleInstanceState {
  stateChange?: {
    subscribe(callback: (state: Record<string, unknown>) => void): void;
  };
}

const STATUS_LABELS: Record<ComponentEntry['status'], string> = {
  stable: 'Estável',
  beta: 'Beta',
  experimental: 'Experimental',
  deprecated: 'Descontinuado',
};

/**
 * Slim, data-driven documentation renderer for the `components/:componentId`
 * route. All content comes from the docs data spine:
 *
 * - catalog entry (`src/app/catalog/<id>.catalog.ts`): name, category, status,
 *   description;
 * - usage doc (colocated `*_USAGE_DOC`): quick-start snippet, guidance,
 *   covered variations;
 * - generated API reference (`generated/component-api/<id>.generated.ts`,
 *   built from docs/quality/inventory.json): inputs, models and outputs;
 * - live example (`examples/<id>-example.component.ts`): lazy chunk that
 *   dogfoods the real packaged components; families without an authored
 *   example render a graceful empty state.
 */
@Component({
  selector: 'app-component-doc-page',
  standalone: true,
  imports: [
    JsonPipe,
    RouterModule,
    FooterComponent,
    IconComponent,
    ScrollTopComponent,
  ],
  templateUrl: './component-doc-page.component.html',
  styleUrl: './component-doc-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDocPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(ComponentCatalogService);
  private readonly exampleHost = viewChild('exampleHost', {
    read: ViewContainerRef,
  });
  private readonly destroyRef = inject(DestroyRef);
  private exampleRef: ComponentRef<unknown> | null = null;
  private destroyed = false;

  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly componentId = computed(
    () => this.routeParams().get('componentId') ?? '',
  );
  readonly entry = computed<ComponentEntry | undefined>(() =>
    this.catalog.byId(this.componentId()),
  );
  readonly usageDoc = computed<ComponentUsageDoc | undefined>(() =>
    this.catalog.usageDoc(this.componentId()),
  );
  readonly packagePath = computed(
    () =>
      this.usageDoc()?.packagePath ?? `@ciag/orchestra/${this.componentId()}`,
  );

  readonly apiMembers = signal<readonly ComponentApiMember[] | null>(null);
  readonly apiMissing = signal(false);
  readonly exampleLoad = signal<ExampleLoad>('loading');
  readonly liveState = signal<Record<string, unknown> | null>(null);

  /** Receives state emitted by the live example, when it declares one. */
  readonly stateChange = output<Record<string, unknown>>();

  readonly statusLabel = computed(() =>
    this.entry() ? STATUS_LABELS[this.entry()!.status] : '',
  );

  readonly categoryLabel = categoryLabel;

  readonly usageSnippet = computed<string | null>(() => {
    const authored = this.usageDoc()?.usage;
    if (authored) return authored;
    const member = this.apiMembers()?.[0];
    if (!member) return null;
    const selector = (member.selector ?? `orc-${this.componentId()}`)
      .split(',')[0]
      .trim();
    return `import { ${member.component} } from '${this.packagePath()}';\n\n<${selector}></${selector}>`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.exampleRef?.destroy();
      this.exampleRef = null;
    });

    effect(() => {
      const id = this.componentId();
      const anchor = this.exampleHost();
      if (!anchor) {
        // Unknown ids render the not-found hero, which has no example host.
        this.exampleLoad.set('none');
        return;
      }

      this.exampleRef?.destroy();
      this.exampleRef = null;
      this.apiMembers.set(null);
      this.apiMissing.set(false);
      this.exampleLoad.set('loading');
      this.liveState.set(null);

      let cancelled = false;
      const apiLoader = COMPONENT_API_LOADERS[id];
      const exampleLoader = COMPONENT_EXAMPLES[id];

      void Promise.all([
        apiLoader ? apiLoader() : Promise.resolve(null),
        exampleLoader ? exampleLoader() : Promise.resolve(null),
      ]).then(([api, example]) => {
        if (cancelled || this.destroyed || id !== this.componentId()) return;
        if (api) this.apiMembers.set(api);
        else this.apiMissing.set(!apiLoader);

        if (example) {
          const ref = anchor.createComponent(example.type);
          for (const [key, value] of Object.entries(example.inputs ?? {})) {
            ref.setInput(key, value);
          }
          const instance = ref.instance as ExampleInstanceState;
          instance.stateChange?.subscribe((state) => this.liveState.set(state));
          this.exampleRef = ref;
          ref.changeDetectorRef.markForCheck();
          this.exampleLoad.set('ready');
        } else {
          this.exampleLoad.set('none');
        }
      });

      return () => {
        cancelled = true;
      };
    });
  }
}
