import type { ComponentDocSource } from '../../../models/component-page.model';

/** Fonte única da página do Select (veja docs/overhaul/GUIA-DOCS.md). */
export const DOC: ComponentDocSource = {
  id: 'select',
  name: 'Select',
  group: 'selection',
  status: 'stable',
  icon: 'arrow_drop_down_circle',
  packagePath: '@ciag/orchestra/select',
  tags: ['seleção', 'dropdown', 'lista', 'opções', 'formulário', 'select'],
  examples: ['basic', 'options', 'multiple', 'forms', 'states'],
  i18n: {
    'pt-BR': {
      description:
        'Campo para escolher uma ou várias opções de uma lista fechada. Abre um painel com navegação por teclado, busca opcional e integração com formulários do Angular.',
      whenToUse: [
        'Para escolher um valor de uma lista conhecida com mais de cinco opções (projeto, estado, responsável).',
        'Para seleção múltipla compacta com `multiple`, quando a lista não cabe em checkboxes.',
        'Em formulários: funciona com `formControlName`, `ngModel` e `[(value)]`.',
      ],
      whenNotToUse: [
        {
          text: 'Para até cinco opções sempre visíveis, em que comparar as escolhas importa.',
          alternative: 'radio',
        },
        {
          text: 'Quando a pessoa digita para buscar em uma lista grande ou remota.',
          alternative: 'autocomplete',
        },
        {
          text: 'Quando os itens são texto livre criado pela própria pessoa (etiquetas).',
          alternative: 'tags-input',
        },
        {
          text: 'Para disparar ações em vez de escolher um valor.',
          alternative: 'menu',
        },
      ],
      anatomy: [
        {
          part: 'orc-select',
          description:
            'Host e gatilho (`role="combobox"`). Mostra o valor selecionado ou o `placeholder`.',
        },
        {
          part: 'orc-option',
          description:
            'Opção projetada para listas estáticas (`value`, `label`, `description`, `disabled`).',
        },
        {
          part: '[options]',
          description:
            'Alternativa ao `orc-option`: lista de `SelectOption` (`{ label, value, description?, disabled? }`).',
        },
        {
          part: 'painel',
          description:
            'Lista de opções (`role="listbox"`), com campo de busca quando `searchable`.',
        },
        {
          part: 'label / helperText / errorMessage',
          description:
            'Rótulo, texto de apoio e mensagem de erro ligados ao gatilho por `aria-labelledby` e `aria-describedby`.',
        },
      ],
      accessibility: {
        keyboard: [
          {
            keys: 'Enter / Espaço',
            action:
              'Abre o painel; com o painel aberto, seleciona a opção ativa.',
          },
          {
            keys: 'Seta para baixo / Seta para cima',
            action:
              'Abre o painel ou move a opção ativa, pulando desabilitadas.',
          },
          {
            keys: 'Esc',
            action: 'Fecha o painel e devolve o foco ao gatilho.',
          },
          {
            keys: 'Tab',
            action: 'Fecha o painel e segue para o próximo campo.',
          },
        ],
        aria: [
          'Gatilho com `role="combobox"`, `aria-expanded`, `aria-controls` e `aria-activedescendant` apontando para a opção ativa.',
          'Painel com `role="listbox"` e `aria-multiselectable` quando `multiple`; cada opção tem `role="option"` e `aria-selected`.',
          '`required`, `disabled` e erro viram `aria-required`, `aria-disabled` e `aria-invalid`.',
          'Mudanças de resultado da busca são anunciadas numa região `role="status"`.',
        ],
        notes: [
          'Sempre dê um nome ao campo: `label` visível ou `ariaLabel`.',
          'Mensagens de erro devem dizer como corrigir ("Selecione uma categoria"), não só "Inválido".',
        ],
      },
      migration: [
        {
          before: '`<orc-multi-select>` (`@ciag/orchestra/multi-select`)',
          after: '`<orc-select multiple>` (`@ciag/orchestra/select`)',
          note: 'multi-select é fundido em select (DECISOES §1).',
        },
        {
          before: '`(onChange)`, `(selectionChange)`',
          after: '`(valueChange)` ou `[(value)]`',
          note: 'Estado de duas vias é `model()` e outputs não têm prefixo `on` (DECISOES §3.4 e §3.5).',
        },
        {
          before:
            '`styleClass`, `panelStyleClass`, `appendTo`, `inputId`, `tooltip*`',
          after: '`class` no host; o painel usa o overlay do CDK',
          note: 'Inputs proibidos e overlays sobre `@angular/cdk/overlay` (DECISOES §3.6 e §3.9).',
        },
        {
          before: '`size="small"` / `size="large"`',
          after: '`size="sm"` / `size="lg"`',
          note: 'Escala única `sm | md | lg` (DECISOES §3.7).',
        },
        {
          before:
            'Textos por input (`searchPlaceholder`, `emptyFilterMessage`…)',
          after: '`provideOrcLabels({...})`, com padrão pt-BR',
          note: 'Rótulos vêm de `injectOrcLabels()` (DECISOES §3.11).',
        },
      ],
      examples: {
        basic: {
          title: 'Uso básico',
          description:
            'Projete `orc-option` para listas estáticas e leia o valor com `[(value)]`.',
        },
        options: {
          title: 'Lista de dados com busca',
          description:
            'Passe `[options]` para listas vindas de código. `searchable` adiciona busca e `clearable` permite limpar.',
        },
        multiple: {
          title: 'Seleção múltipla',
          description:
            'Com `multiple`, o valor é um array e as escolhas aparecem como chips no gatilho.',
        },
        forms: {
          title: 'Reactive Forms',
          description:
            'O Select é um `ControlValueAccessor`: use `formControlName` e as validações do Angular.',
        },
        states: {
          title: 'Erro e desabilitado',
          description:
            '`status="error"` com `errorMessage` sinaliza o problema; `disabled` bloqueia a interação.',
        },
      },
    },
  },
};
