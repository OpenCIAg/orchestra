import type { ComponentDocSource } from '../../../models/component-page.model';

/** Fonte única da página do Modal (veja docs/overhaul/GUIA-DOCS.md). */
export const DOC: ComponentDocSource = {
  id: 'modal',
  name: 'Modal',
  group: 'overlays',
  status: 'stable',
  icon: 'picture_in_picture',
  packagePath: '@ciag/orchestra/modal',
  tags: ['diálogo', 'janela', 'confirmação', 'overlay', 'dialog', 'popup'],
  examples: ['basic', 'confirm', 'service'],
  i18n: {
    'pt-BR': {
      description:
        'Janela de diálogo sobre a página, com fundo escurecido, foco preso dentro dela e fechamento por Esc. Para decisões e tarefas curtas que pedem atenção total.',
      whenToUse: [
        'Para confirmar uma ação destrutiva ou irreversível antes de executá-la.',
        'Para uma tarefa curta e focada (editar um item, preencher poucos campos) sem sair da tela.',
        'Para informações bloqueantes que a pessoa precisa reconhecer antes de continuar.',
      ],
      whenNotToUse: [
        {
          text: 'Para conteúdo longo ou fluxos de várias etapas ao lado da página: prefira um painel lateral.',
          alternative: 'drawer',
        },
        {
          text: 'Para avisos que não exigem resposta (salvo com sucesso, erro de rede).',
          alternative: 'toast',
        },
        {
          text: 'Para detalhes contextuais ancorados a um elemento.',
          alternative: 'popover',
        },
        {
          text: 'Para mensagens permanentes na própria página.',
          alternative: 'alert',
        },
      ],
      anatomy: [
        {
          part: 'orc-modal',
          description:
            'Host. `[(isOpen)]` controla a abertura; `size` define a largura (`sm`, `md`, `lg`…).',
        },
        {
          part: '[modal-header]',
          description:
            'Título do diálogo. Também serve de nome acessível (`aria-labelledby`).',
        },
        {
          part: '[modal-body]',
          description: 'Conteúdo principal, com rolagem própria quando longo.',
        },
        {
          part: '[modal-footer]',
          description:
            'Ações. A principal fica à direita; a de cancelar, à esquerda dela.',
        },
        {
          part: 'botão Fechar',
          description:
            'Exibido por padrão; some com `[showCloseButton]="false"`.',
        },
        {
          part: 'ModalService',
          description:
            'Abre um componente como modal por código: `open(Componente)` devolve um `ModalRef`.',
        },
      ],
      accessibility: {
        keyboard: [
          {
            keys: 'Tab / Shift + Tab',
            action: 'Circula o foco só entre os elementos do modal.',
          },
          {
            keys: 'Esc',
            action: 'Fecha o modal (desligável com `[closeOnEscape]="false"`).',
          },
        ],
        aria: [
          'Usa o `<dialog>` nativo aberto com `showModal()`: `role="dialog"` e `aria-modal="true"`, nomeado pelo cabeçalho.',
          'Ao abrir, o foco vai para dentro do modal; ao fechar, volta ao elemento que o abriu.',
          'O conteúdo de fundo fica inerte e a rolagem da página é bloqueada enquanto o modal está aberto.',
        ],
        notes: [
          'Todo modal precisa de título: use `[modal-header]` ou `ariaLabel`.',
          'Se desligar Esc e o clique no fundo, ofereça uma ação explícita para sair.',
        ],
      },
      migration: [
        {
          before: '`[(isOpen)]` / `[(visible)]`',
          after: '`[(open)]`',
          note: 'Overlays usam `model()` chamado `open` (DECISOES §3.4).',
        },
        {
          before: '`<orc-dialog>`, `<orc-dynamic-dialog>`',
          after: '`<orc-modal>`',
          note: 'Um seletor por componente, sem aliases (DECISOES §3.1).',
        },
        {
          before: '`<orc-confirm-dialog>`',
          after: '`OrcDialogService.confirm()`',
          note: 'confirm-dialog é fundido em modal (DECISOES §1).',
        },
        {
          before: '`(onShow)`, `(onHide)`',
          after: '`(opened)`, `(closed)`',
          note: 'Outputs sem prefixo `on` (DECISOES §3.5).',
        },
        {
          before:
            '`style`, `styleClass`, `appendTo`, `baseZIndex`, `autoZIndex`, `transitionOptions`',
          after: 'tokens `--orc-*` e overlay do CDK',
          note: 'Inputs proibidos e overlays sobre `@angular/cdk/dialog` (DECISOES §3.6 e §3.9).',
        },
        {
          before: '`closeAriaLabel`',
          after: '`provideOrcLabels({...})`, padrão "Fechar"',
          note: 'Rótulos pt-BR vêm do provider (DECISOES §3.11).',
        },
      ],
      examples: {
        basic: {
          title: 'Uso básico',
          description:
            'Controle a abertura com `[(isOpen)]` e preencha os slots `modal-header`, `modal-body` e `modal-footer`.',
        },
        confirm: {
          title: 'Confirmação destrutiva',
          description:
            'Para ações irreversíveis: `size="sm"`, ação `danger` e nenhum fechamento acidental pelo fundo.',
        },
        service: {
          title: 'Aberto por código',
          description:
            '`ModalService.open()` cria o modal a partir de um componente e devolve um `ModalRef` para fechá-lo.',
        },
      },
    },
  },
};
