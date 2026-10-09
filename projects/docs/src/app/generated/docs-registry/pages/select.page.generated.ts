// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { ComponentPageData } from '../../../models/component-page.model';
import { DOC } from '../../../content/components/select/select.doc';
import { SelectBasicExampleComponent } from '../../../content/components/select/examples/basic.example';
import { SelectOptionsExampleComponent } from '../../../content/components/select/examples/options.example';
import { SelectMultipleExampleComponent } from '../../../content/components/select/examples/multiple.example';
import { SelectFormsExampleComponent } from '../../../content/components/select/examples/forms.example';
import { SelectStatesExampleComponent } from '../../../content/components/select/examples/states.example';

export const PAGE: ComponentPageData = {
  doc: DOC,
  examples: [
    {
      slug: 'basic',
      file: 'examples/basic.example.ts',
      component: SelectBasicExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component, signal } from \'@angular/core\';\nimport { OptionComponent, SelectComponent } from \'@ciag/orchestra/select\';\n\n@Component({\n  selector: \'doc-select-basic-example\',\n  imports: [SelectComponent, OptionComponent],\n  template: `\n    <orc-select label="Prioridade" placeholder="Selecione" [(value)]="priority">\n      <orc-option value="baixa" label="Baixa" />\n      <orc-option value="media" label="Média" />\n      <orc-option value="alta" label="Alta" />\n    </orc-select>\n    <p class="hint">Valor: {{ priority() ?? \'nenhum\' }}</p>\n  `,\n  styles: `\n    :host {\n      display: grid;\n      gap: 0.75rem;\n      width: min(100%, 20rem);\n    }\n    .hint {\n      margin: 0;\n      font-size: 0.875rem;\n      color: var(--orc-text-muted);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class SelectBasicExampleComponent {\n  readonly priority = signal<string | undefined>(undefined);\n}\n',
    },
    {
      slug: 'options',
      file: 'examples/options.example.ts',
      component: SelectOptionsExampleComponent,
      source:
        "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\nimport { SelectComponent, type SelectOption } from '@ciag/orchestra/select';\n\n@Component({\n  selector: 'doc-select-options-example',\n  imports: [SelectComponent],\n  template: `\n    <orc-select\n      label=\"Projeto\"\n      placeholder=\"Selecione um projeto\"\n      helperText=\"Digite para filtrar a lista.\"\n      searchable\n      clearable\n      [options]=\"projects\"\n      [(value)]=\"project\"\n    />\n  `,\n  styles: `\n    :host {\n      display: block;\n      width: min(100%, 22rem);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class SelectOptionsExampleComponent {\n  readonly project = signal<string | undefined>('orchestra');\n\n  readonly projects: SelectOption<string>[] = [\n    { value: 'orchestra', label: 'Orchestra', description: 'Design system' },\n    { value: 'gestao', label: 'Gestão de Projetos', description: 'Portal' },\n    { value: 'campo', label: 'App de Campo', description: 'Mobile' },\n    { value: 'bi', label: 'Painéis de BI', description: 'Relatórios' },\n    { value: 'legado', label: 'Sistema legado', disabled: true },\n  ];\n}\n",
    },
    {
      slug: 'multiple',
      file: 'examples/multiple.example.ts',
      component: SelectMultipleExampleComponent,
      source:
        "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\nimport { SelectComponent, type SelectOption } from '@ciag/orchestra/select';\n\n@Component({\n  selector: 'doc-select-multiple-example',\n  imports: [SelectComponent],\n  template: `\n    <orc-select\n      label=\"Responsáveis\"\n      placeholder=\"Selecione pessoas\"\n      multiple\n      clearable\n      [options]=\"people\"\n      [(value)]=\"owners\"\n    />\n    <p class=\"hint\">{{ owners().length }} pessoa(s) selecionada(s).</p>\n  `,\n  styles: `\n    :host {\n      display: grid;\n      gap: 0.75rem;\n      width: min(100%, 24rem);\n    }\n    .hint {\n      margin: 0;\n      font-size: 0.875rem;\n      color: var(--orc-text-muted);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class SelectMultipleExampleComponent {\n  readonly owners = signal<string[]>(['ana', 'carla']);\n\n  readonly people: SelectOption<string>[] = [\n    { value: 'ana', label: 'Ana Silva', description: 'Design' },\n    { value: 'bruno', label: 'Bruno Souza', description: 'Front-end' },\n    { value: 'carla', label: 'Carla Lima', description: 'Produto' },\n    { value: 'diego', label: 'Diego Alves', description: 'Back-end' },\n  ];\n}\n",
    },
    {
      slug: 'forms',
      file: 'examples/forms.example.ts',
      component: SelectFormsExampleComponent,
      source:
        "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\nimport {\n  FormControl,\n  FormGroup,\n  ReactiveFormsModule,\n  Validators,\n} from '@angular/forms';\nimport { ButtonComponent } from '@ciag/orchestra/button';\nimport { SelectComponent, type SelectOption } from '@ciag/orchestra/select';\n\n@Component({\n  selector: 'doc-select-forms-example',\n  imports: [ReactiveFormsModule, SelectComponent, ButtonComponent],\n  template: `\n    <form [formGroup]=\"form\" (ngSubmit)=\"submit()\">\n      <orc-select\n        formControlName=\"category\"\n        label=\"Categoria\"\n        placeholder=\"Selecione uma categoria\"\n        required\n        [options]=\"categories\"\n        [status]=\"showError() ? 'error' : 'default'\"\n        [errorMessage]=\"\n          showError() ? 'Selecione uma categoria para continuar.' : ''\n        \"\n      />\n      <orc-button type=\"submit\">Salvar</orc-button>\n      @if (saved()) {\n        <p class=\"hint\" role=\"status\">Salvo: {{ form.value.category }}</p>\n      }\n    </form>\n  `,\n  styles: `\n    form {\n      display: grid;\n      gap: 1rem;\n      justify-items: start;\n      width: min(100%, 22rem);\n    }\n    orc-select {\n      width: 100%;\n    }\n    .hint {\n      margin: 0;\n      font-size: 0.875rem;\n      color: var(--orc-text-muted);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class SelectFormsExampleComponent {\n  readonly form = new FormGroup({\n    category: new FormControl<string | null>(null, Validators.required),\n  });\n  readonly submitted = signal(false);\n  readonly saved = signal(false);\n\n  readonly categories: SelectOption<string>[] = [\n    { value: 'bug', label: 'Defeito' },\n    { value: 'feature', label: 'Nova funcionalidade' },\n    { value: 'docs', label: 'Documentação' },\n  ];\n\n  showError(): boolean {\n    return this.submitted() && this.form.controls.category.invalid;\n  }\n\n  submit(): void {\n    this.submitted.set(true);\n    this.saved.set(this.form.valid);\n  }\n}\n",
    },
    {
      slug: 'states',
      file: 'examples/states.example.ts',
      component: SelectStatesExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { OptionComponent, SelectComponent } from \'@ciag/orchestra/select\';\n\n@Component({\n  selector: \'doc-select-states-example\',\n  imports: [SelectComponent, OptionComponent],\n  template: `\n    <orc-select\n      label="Estado"\n      placeholder="Selecione"\n      status="error"\n      errorMessage="Este campo é obrigatório."\n    >\n      <orc-option value="sp" label="São Paulo" />\n      <orc-option value="pr" label="Paraná" />\n    </orc-select>\n    <orc-select label="Filial" placeholder="Matriz" disabled>\n      <orc-option value="matriz" label="Matriz" />\n    </orc-select>\n  `,\n  styles: `\n    :host {\n      display: grid;\n      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n      gap: 1.25rem;\n      width: min(100%, 32rem);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class SelectStatesExampleComponent {}\n',
    },
  ],
};
