// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { ComponentPageData } from '../../../models/component-page.model';
import { DOC } from '../../../content/components/button/button.doc';
import { ButtonBasicExampleComponent } from '../../../content/components/button/examples/basic.example';
import { ButtonVariantsExampleComponent } from '../../../content/components/button/examples/variants.example';
import { ButtonSizesExampleComponent } from '../../../content/components/button/examples/sizes.example';
import { ButtonIconsExampleComponent } from '../../../content/components/button/examples/icons.example';
import { ButtonStatesExampleComponent } from '../../../content/components/button/examples/states.example';

export const PAGE: ComponentPageData = {
  doc: DOC,
  examples: [
    {
      slug: 'basic',
      file: 'examples/basic.example.ts',
      component: ButtonBasicExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component, signal } from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\n\n@Component({\n  selector: \'doc-button-basic-example\',\n  imports: [ButtonComponent],\n  template: `\n    <orc-button (click)="saves.set(saves() + 1)">Salvar alterações</orc-button>\n    <p class="hint" aria-live="polite">Salvo {{ saves() }} vez(es).</p>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 0.75rem;\n    }\n    .hint {\n      margin: 0;\n      font-size: 0.875rem;\n      color: var(--orc-text-muted);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ButtonBasicExampleComponent {\n  readonly saves = signal(0);\n}\n',
    },
    {
      slug: 'variants',
      file: 'examples/variants.example.ts',
      component: ButtonVariantsExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\n\n@Component({\n  selector: \'doc-button-variants-example\',\n  imports: [ButtonComponent],\n  template: `\n    <orc-button variant="primary">Publicar</orc-button>\n    <orc-button variant="secondary">Salvar rascunho</orc-button>\n    <orc-button variant="outline">Pré-visualizar</orc-button>\n    <orc-button variant="ghost">Cancelar</orc-button>\n    <orc-button variant="link">Ver histórico</orc-button>\n    <orc-button variant="danger">Excluir</orc-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      justify-content: center;\n      gap: 0.75rem;\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ButtonVariantsExampleComponent {}\n',
    },
    {
      slug: 'sizes',
      file: 'examples/sizes.example.ts',
      component: ButtonSizesExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\n\n@Component({\n  selector: \'doc-button-sizes-example\',\n  imports: [ButtonComponent],\n  template: `\n    <orc-button size="sm">Pequeno</orc-button>\n    <orc-button size="md">Médio</orc-button>\n    <orc-button size="lg">Grande</orc-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      justify-content: center;\n      gap: 0.75rem;\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ButtonSizesExampleComponent {}\n',
    },
    {
      slug: 'icons',
      file: 'examples/icons.example.ts',
      component: ButtonIconsExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\nimport { IconComponent } from \'@ciag/orchestra/icon\';\n\n@Component({\n  selector: \'doc-button-icons-example\',\n  imports: [ButtonComponent, IconComponent],\n  template: `\n    <orc-button>\n      <orc-icon iconLeft name="add" size="sm" />\n      Novo projeto\n    </orc-button>\n    <orc-button variant="outline">\n      Continuar\n      <orc-icon iconRight name="arrow_forward" size="sm" />\n    </orc-button>\n    <orc-button variant="ghost" iconOnly ariaLabel="Excluir projeto">\n      <orc-icon iconLeft name="delete" size="sm" />\n    </orc-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      justify-content: center;\n      gap: 0.75rem;\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ButtonIconsExampleComponent {}\n',
    },
    {
      slug: 'states',
      file: 'examples/states.example.ts',
      component: ButtonStatesExampleComponent,
      source:
        "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\nimport { ButtonComponent } from '@ciag/orchestra/button';\n\n@Component({\n  selector: 'doc-button-states-example',\n  imports: [ButtonComponent],\n  template: `\n    <orc-button [loading]=\"sending()\" (click)=\"send()\">\n      {{ sending() ? 'Enviando…' : 'Enviar relatório' }}\n    </orc-button>\n    <orc-button variant=\"secondary\" disabled>Sem permissão</orc-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      justify-content: center;\n      gap: 0.75rem;\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ButtonStatesExampleComponent {\n  readonly sending = signal(false);\n\n  send(): void {\n    this.sending.set(true);\n    // Simula uma requisição de 1,5 s.\n    setTimeout(() => this.sending.set(false), 1500);\n  }\n}\n",
    },
  ],
};
