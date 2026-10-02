import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const EDITOR_CATALOG_ENTRY: ComponentEntry = {
  id: 'editor',
  name: 'Editor',
  description:
    'Editor de texto rico com conteúdo seguro, toolbar e integração a formulários.',
  category: 'Inputs',
  status: 'beta',
  tags: ['editor', 'rich text', 'contenteditable', 'forms'],
  icon: '✎',
  route: '/components/editor',
};

export const EDITOR_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/editor',
  usage: `<orc-editor
  [(value)]="content"
  [actions]="actions"
  ariaLabel="Descrição do projeto"
  (onTextChange)="onTextChange($event)"
/>`,
  guidance: `Use value para conteúdo HTML controlado e actions para configurar a toolbar. O conteúdo é sanitizado antes de entrar no modelo; a formatação usa a API execCommand do navegador e nenhum engine Quill é carregado. O componente implementa ControlValueAccessor para ngModel e Reactive Forms.`,
  variations: [
    {
      label: 'Safe formatted content',
      description: 'Renderiza conteúdo HTML sanitizado com marcação permitida.',
    },
    {
      label: 'Toolbar actions',
      description:
        'Ações configuráveis recebem nomes acessíveis e preservam a seleção.',
    },
    {
      label: 'Controlled value',
      description:
        'value é sincronizado por model e também funciona com ControlValueAccessor.',
    },
    { label: 'Readonly', description: 'Impede edição e oculta a toolbar.' },
  ],
};
