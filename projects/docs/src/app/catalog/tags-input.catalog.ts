import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TAGS_INPUT_CATALOG_ENTRY: ComponentEntry = {
  id: 'tags-input',
  name: 'Tags Input',
  description:
    'Campo controlado ou CVA de tags com sugestões, limites, teclado e remoção acessível.',
  category: 'Inputs',
  status: 'beta',
  tags: ['tags', 'input', 'chips', 'suggestions', 'cva'],
  icon: 'label',
  route: '/components/tags-input',
};

export const TAGS_INPUT_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/tags-input',
  usage: `<orc-tags-input
  label="Tecnologias"
  [(value)]="technologies"
  [suggestions]="technologySuggestions"
  separator=","
  [maxTags]="8"
  removeAriaLabel="Remover tag"
  showClear
  clearAriaLabel="Limpar todas as tags"
/>`,
  guidance: `Enter confirma o rascunho; separator pode confirmar uma tecla e também define como texto colado é dividido. Sem separator, o paste reconhece vírgulas e quebras de linha. addOnTab confirma sem cancelar a navegação nativa por Tab; addOnBlur confirma quando o campo perde foco. max substitui maxTags quando ambos são definidos; maxLength limita cada tag. Duplicatas são ignoradas sem diferenciar maiúsculas/minúsculas por padrão. removeAriaLabel habilita os botões de remoção e showClear com clearAriaLabel habilita Limpar. Sugestões são correspondências por substring e mostram até oito opções. O nome acessível vem de label ou ariaLabel.`,
  variations: [
    {
      label: 'Controlled value',
      description:
        'value/valueChange oferece binding e integra com [(ngModel)] e Reactive Forms.',
    },
    {
      label: 'Suggestions',
      description:
        'Setas percorrem as sugestões; Enter aceita a opção ativa e Escape fecha a lista.',
    },
    {
      label: 'Limits and duplicates',
      description:
        'maxTags/max e maxLength limitam a coleção e o tamanho de cada tag.',
    },
    {
      label: 'Paste and separators',
      description:
        'Texto colado é dividido por separadores configurados ou, por padrão, vírgulas e linhas.',
    },
    {
      label: 'Keyboard navigation',
      description:
        'addOnTab adiciona o rascunho e mantém a navegação nativa para o próximo controle.',
    },
  ],
};
