import type { ComponentDocSource } from '../../../models/component-page.model';

/**
 * Fonte única da página do Button. Literal puro: o gerador lê este arquivo
 * de forma estática (veja docs/overhaul/GUIA-DOCS.md).
 */
export const DOC: ComponentDocSource = {
  id: 'button',
  name: 'Button',
  group: 'actions',
  status: 'stable',
  icon: 'smart_button',
  packagePath: '@ciag/orchestra/button',
  tags: ['botão', 'ação', 'cta', 'submit', 'action', 'click'],
  examples: ['basic', 'variants', 'sizes', 'icons', 'states'],
  i18n: {
    'pt-BR': {
      description:
        'Dispara uma ação: enviar um formulário, abrir um diálogo, confirmar uma operação. Tem variantes de ênfase, três tamanhos, ícones e estado de carregamento.',
      whenToUse: [
        'Para a ação principal de um formulário ou diálogo, com `variant="primary"` e no máximo uma ação primária por área.',
        'Para ações secundárias ao lado da principal, com ênfase menor (`secondary`, `outline` ou `ghost`).',
        'Para ações destrutivas, com `variant="danger"`, de preferência confirmadas em um modal.',
        'Para ações compactas em barras de ferramentas, só com ícone (`iconOnly` e `ariaLabel`).',
      ],
      whenNotToUse: [
        {
          text: 'Para navegar para outra rota ou página. Um botão não é link: use `<a routerLink>`.',
          alternative: 'link',
        },
        {
          text: 'Para ligar e desligar um estado que permanece visível.',
          alternative: 'toggle-button',
        },
        {
          text: 'Para escolher uma entre poucas opções mutuamente exclusivas.',
          alternative: 'segmented-control',
        },
        {
          text: 'Para esconder várias ações secundárias atrás de um único gatilho.',
          alternative: 'menu',
        },
      ],
      anatomy: [
        {
          part: 'orc-button',
          description:
            'Host do componente. Renderiza um `<button>` nativo, que recebe o foco e o clique.',
        },
        {
          part: 'conteúdo padrão',
          description:
            'Rótulo visível. Com `iconOnly`, o rótulo some e o nome acessível vem de `ariaLabel`.',
        },
        {
          part: '[iconLeft]',
          description:
            'Slot do ícone antes do rótulo: `<orc-icon iconLeft name="add" />`.',
        },
        {
          part: '[iconRight]',
          description: 'Slot do ícone depois do rótulo.',
        },
        {
          part: '.orc-button__spinner',
          description:
            'Indicador exibido com `loading`. Fica oculto para leitores de tela; o botão anuncia `aria-busy`.',
        },
      ],
      accessibility: {
        keyboard: [
          {
            keys: 'Tab',
            action:
              'Move o foco para o botão. Botões com `disabled` saem da ordem de foco.',
          },
          {
            keys: 'Enter / Espaço',
            action: 'Aciona o botão (comportamento nativo de `<button>`).',
          },
        ],
        aria: [
          'Renderiza `<button type="button">` nativo. Dentro de formulários, use `type="submit"` na ação de envio.',
          '`disabled` aplica o atributo nativo `disabled` e `aria-disabled="true"`.',
          '`loading` aplica `aria-busy="true"`; o spinner é `aria-hidden`.',
          'Os ícones dos slots ficam em um contêiner `aria-hidden`: o nome acessível vem só do rótulo.',
        ],
        notes: [
          'Botão só com ícone precisa de `ariaLabel` descritivo em pt-BR, como "Excluir projeto", e não só "Excluir".',
          'Não coloque `(click)` em `orc-icon`, `div` ou `span`: use `orc-button`, que já tem foco e teclado.',
        ],
      },
      migration: [
        {
          before: '`severity="danger"`',
          after: '`variant="danger"`',
          note: '`severity` sai de toda a biblioteca (DECISOES §3.7).',
        },
        {
          before: '`<orc-close-button>`',
          after: '`<orc-button variant="close">`',
          note: 'close-button é fundido em button (DECISOES §1).',
        },
        {
          before:
            '`icon`, `iconLeft`, `iconRight` e `loadingIcon` com classe CSS ou SVG em string',
          after: '`<orc-icon>` projetado no slot do botão',
          note: 'Nada de SVG/HTML em string (DECISOES §3.13).',
        },
        {
          before: '`style`, `styleClass`, `fluid`',
          after: '`class` no host, tokens `--orc-*` e `fullWidth`',
          note: 'Inputs proibidos (DECISOES §3.6).',
        },
        {
          before: '`[id]`, `[tabindex]` como inputs',
          after: 'atributos nativos',
          note: 'Inputs com nome de atributo global HTML saem (DECISOES §3.6).',
        },
        {
          before: '`(onFocus)`, `(onBlur)`',
          after: '`(focusin)`, `(focusout)` nativos',
          note: 'Outputs sem prefixo `on` (DECISOES §3.5).',
        },
      ],
      examples: {
        basic: {
          title: 'Uso básico',
          description:
            'O rótulo é o conteúdo do componente. Use `(click)` como em um `<button>` nativo.',
        },
        variants: {
          title: 'Variantes',
          description:
            'Da maior para a menor ênfase: `primary`, `secondary`, `outline`, `ghost` e `link`. `danger` é reservado para ações destrutivas.',
        },
        sizes: {
          title: 'Tamanhos',
          description:
            '`sm`, `md` (padrão) e `lg`. Use o mesmo tamanho dos campos ao lado.',
        },
        icons: {
          title: 'Com ícones',
          description:
            'Projete `<orc-icon>` nos slots `iconLeft` e `iconRight`. Só com ícone, use `iconOnly` e um `ariaLabel` em pt-BR.',
        },
        states: {
          title: 'Carregando e desabilitado',
          description:
            '`loading` mostra o spinner e marca o botão como ocupado; `disabled` bloqueia a ação.',
        },
      },
    },
  },
};
