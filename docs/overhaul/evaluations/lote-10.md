# Lote 10: tipografia, utilitários e transversal

Avaliação somente leitura conforme `docs/overhaul/README.md` §3–§6. Os dados completos (notas, evidências com arquivo:linha, `targetApi`, defeitos e impacto no consumidor) estão em `lote-10.json`, com 53 entradas: 13 famílias, 19 diretivas, 4 serviços, 12 entry points sem família e 5 de infraestrutura. Os entry points `p2` e `internal` são cobertos por `infra-p2` e `infra-internal`.

**Contagem:** REMOVE 25 · KEEP-REDESIGN 20 · KEEP 3 · EXPERIMENTAL 3 · MERGE 2

| id                            | veredito                | motivo                                                                                                  |
| ----------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `text`                        | KEEP-REDESIGN           | Única primitiva de texto; absorve typography, escala por tokens, host inline                            |
| `typography`                  | MERGE → `text`          | Duplica orc-text; `as` migra, `color` livre e peso numérico saem                                        |
| `kbd`                         | KEEP-REDESIGN           | Vira projeção de conteúdo (+ orc-kbd-group); sai padrão '⌘ K' e aria-label inválido                     |
| `link`                        | KEEP-REDESIGN           | Precisa de routerLink e `external` acessível; sai href padrão '#' e output `activated`                  |
| `code`                        | KEEP-REDESIGN           | Enxuto e testado; rótulos vão para o provider e `copiedEvent` vira `copied`                             |
| `icon`                        | KEEP-REDESIGN           | 272 usos; tirar @import de 3 fontes Google (decisão 5) e enxugar eixos                                  |
| `visually-hidden`             | KEEP-REDESIGN           | O próprio host fica oculto; nova variante `focusable` para skip-link                                    |
| `scroll-top`                  | REMOVE                  | Paridade PrimeNG trivial; a docs ganha receita com orc-button                                           |
| `terminal`                    | EXPERIMENTAL            | Nicho; remove `onCommand` duplicado, `styleClass` e textos em inglês                                    |
| `chart`                       | EXPERIMENTAL            | SVG próprio; anuncia 8 tipos e renderiza 4, tem inputs Chart.js no-op e achata a pizza                  |
| `editor`                      | EXPERIMENTAL            | contenteditable+execCommand com imitação de Quill; limpar a API e usar CvaControl                       |
| `file-upload`                 | MERGE → `file-uploader` | Só alias (entry + seletor); orc-file-uploader é o canônico                                              |
| `file-uploader`               | KEEP-REDESIGN           | Clone do p-fileUpload (44 inputs, 11 on*, HTTP embutido); vira seletor de arquivos e o app faz o upload |
| `directive-defer`             | REMOVE                  | Duplica @defer (on viewport)                                                                            |
| `directive-draggable`         | REMOVE                  | Duplica @angular/cdk/drag-drop                                                                          |
| `directive-droppable`         | REMOVE                  | Duplica cdkDropList; usa aria-dropeffect obsoleto                                                       |
| `directive-input-mask`        | KEEP-REDESIGN           | Motor útil (CPF/CNPJ); vira `mask` em orc-input (decisão 9)                                             |
| `directive-key-filter`        | REMOVE                  | Conflita com PatternValidator e ngModelChange; anti-padrão de a11y                                      |
| `directive-autofocus`         | REMOVE                  | Foca host não focável e engole o Escape quando desabilitada                                             |
| `directive-splitter-panel`    | KEEP                    | Marcador de slot correto                                                                                |
| `directive-ripple`            | REMOVE                  | Fora da identidade CIAg, sem uso interno                                                                |
| `directive-style-class`       | REMOVE                  | Paridade pStyleClass com querySelector global                                                           |
| `directive-use-style`         | REMOVE                  | Duplica [style]                                                                                         |
| `directive-animate-on-scroll` | REMOVE                  | Decorativa; CSS resolve                                                                                 |
| `directive-focus-trap`        | REMOVE                  | Reimplementa cdkTrapFocus                                                                               |
| `directive-cell-def`          | KEEP-REDESIGN           | Marcador correto; sai alias appCellDef                                                                  |
| `directive-header-cell-def`   | KEEP-REDESIGN           | Marcador correto; sai alias appHeaderCellDef                                                            |
| `directive-column`            | KEEP-REDESIGN           | API certa; sai `app-column` (o consumidor tem 13 usos)                                                  |
| `directive-table-footer`      | KEEP                    | Marcador de slot correto                                                                                |
| `directive-row-expansion`     | KEEP                    | Marcador de slot correto                                                                                |
| `directive-toolbar-item`      | KEEP-REDESIGN           | Útil; trocar ngOnChanges/stateChange por signal + FocusKeyManager                                       |
| `directive-tooltip`           | KEEP-REDESIGN           | Núcleo; 24 inputs com aliases app/ui e pares duplicados                                                 |
| `service-confirmation`        | KEEP-REDESIGN           | Unificar diálogo e popup num OrcConfirmService com Promise<boolean>                                     |
| `service-confirm-popup`       | REMOVE                  | Cópia do ConfirmationService                                                                            |
| `service-modal`               | KEEP-REDESIGN           | Exige <orc-modal> dentro do componente aberto; passar a usar CDK Dialog                                 |
| `service-toast`               | KEEP-REDESIGN           | Bom núcleo; mistura vocabulário PrimeNG e usa setters globais                                           |
| `entry-avatar-group`          | REMOVE                  | Alias de avatar                                                                                         |
| `entry-input-group-addon`     | REMOVE                  | Entry separado; o addon passa para input-group                                                          |
| `entry-message`               | REMOVE                  | Alias de alert/messages                                                                                 |
| `entry-pagination`            | REMOVE                  | Alias de paginator                                                                                      |
| `entry-sidebar`               | REMOVE                  | Alias de drawer                                                                                         |
| `entry-text-input`            | REMOVE                  | Alias de input                                                                                          |
| `entry-toggle`                | REMOVE                  | Alias de switch                                                                                         |
| `entry-defer`                 | REMOVE                  | Ver directive-defer                                                                                     |
| `entry-drag-drop`             | REMOVE                  | Ver drag-drop (CDK)                                                                                     |
| `entry-input-mask`            | REMOVE                  | Vira orc-input [mask]                                                                                   |
| `entry-key-filter`            | REMOVE                  | Ver directive-key-filter                                                                                |
| `entry-icons`                 | REMOVE                  | 5,5 MB de metadados usados só pela docs; vai para projects/docs                                         |
| `infra-styles`                | KEEP-REDESIGN           | Publicar CSS puro; nomenclatura única --orc-*; reset opt-in; fallbacks com a paleta CIAg                |
| `infra-p2`                    | REMOVE                  | Monólito de 10,8 mil linhas com ciclos; zerar p2/, aliases e o barril raiz                              |
| `infra-internal`              | KEEP-REDESIGN           | Manter privado (ɵ); CvaControl obrigatório; sem ponte P2; overlays via CDK                              |
| `infra-tooling`               | KEEP-REDESIGN           | Remover alias-parity, gate-23 e deprecation-guard; criar orçamento de bundle e verify:no-legacy/labels  |
| `infra-i18n`                  | KEEP-REDESIGN           | Criar ORC_LABELS + provideOrcLabels pt-BR; cerca de 80 literais hoje, quase todos em inglês             |

## Observações transversais

1. **O CSS do consumidor exige Sass hoje (viola a decisão 6).** O pacote exporta só `styles/*.scss` (`projects/orc-ds/package.json:20-51`, `ng-package.json:8-11`). O gestao-de-projetos faz `@import` do `index.scss` dentro de um `.css` (`src/styles.css:6`). O RC precisa gerar `styles/orchestra.css`, `tokens.css` e `reset.css` (este último opt-in) e um `verify:package` que prove a importação sem Sass.
2. **Há quatro camadas de nomes para a mesma cor, e os fallbacks fogem da identidade CIAg.** As camadas são: primitivos (`--orc-bg`), aliases legados (`--bg-app`, `--text-primary`), semânticos (`--orc-surface`) e a ponte de componente (`--orc-component-*`). Os fallbacks hex da ponte são Tailwind (`#2563eb`, em `internal/p2-shared.ts:43`), não o `#1c6aed` CIAg. Proposta: só primitivos `--orc-color-*` mais semânticos `--orc-*`, e componentes lendo os semânticos sem ponte. O reset global (`styles/reset.scss`) sai do index.
3. **O `:host { display: block }` do `P2_SHARED_STYLES` (`internal/p2-shared.ts:130-131`) quebra as primitivas inline.** Afeta `orc-text`, `orc-link`, `orc-kbd` e `orc-typography`. O `P2_SHARED_STYLES` é repetido em 34 componentes; deve sumir junto com o p2.
4. **`orc-icon` baixa três fontes do Google Fonts por conta própria** (`icon/icon.component.scss:1-3`, com `display=block`). Pela decisão 5, quem carrega a fonte é o app: tirar o `@import` e definir uma família só, via `provideOrcIcons`. O consumidor precisa adicionar o `<link>` da fonte. O catálogo `icons/` (5,5 MB) sai do pacote e vai para a docs.
5. **O p2 é o maior débito estrutural.** São 35 famílias declaradas em `p2/`, 34 entries cujo chunk depende dele e ciclos p2 ↔ terminal/editor/password/meter-group. O barril raiz `public-api.ts` reexporta 163 entries, incluindo aliases. Meta do RC: `projects/orc-ds/p2/` vazio, zero entries alias e barril raiz sem componentes.
6. **Diretivas: sobram só os marcadores de slot e o tooltip.** Todas as diretivas utilitárias duplicam o Angular ou o CDK (`@defer`, `cdk/drag-drop`, `cdkTrapFocus`, `[style]`) ou são paridade PrimeNG (ripple, styleClass, keyFilter, autoFocus). `input-mask` sobrevive como `mask` de `orc-input`. `key-filter` tem dois bugs reais de integração com o Angular: o input `pattern` ativa o PatternValidator e o output `ngModelChange` sequestra o evento do ngModel.
7. **Serviços.** Os dois serviços de confirmação viram um `OrcConfirmService.confirm(): Promise<boolean>`. `ModalService` deixa de exigir `<orc-modal>` dentro do componente aberto e passa para CDK Dialog. `ToastService` perde o vocabulário PrimeNG e os setters globais, que viram `provideOrcToast`.
8. **i18n.** Não há token de rótulos. São cerca de 80 literais padrão, quase todos em inglês ('Close', 'Loading', 'No results found', 'Previous page'…), alguns misturados com pt-BR no mesmo componente (paginator). A proposta completa de `ORC_LABELS`/`provideOrcLabels` e a lista arquivo:linha estão em `infra-i18n`.
9. **Tooling pós-compatibilidade.**
   - **Remover:** `alias-parity` (gerador de 496 linhas, spec de 1.301), `gate-manifest` (lib de 1.366 linhas, 820 entradas) e `deprecation-guard`. O manifesto gate-23 serve uma última vez como checklist de remoção do RC e depois é apagado. Também saem `score:compatibility` e os specs `*-parity`.
   - **Manter:** `verify:package`, `verify:ssr`, temas, `docs-api`, `llms`, `sitemap`, `docs-coverage`, changesets e `publish-guard`.
   - **Falta criar:**
     - `verify:bundle-budget`, promovendo `tools/overhaul/measure-families.mjs`;
     - `verify:no-legacy`: aliases p*/app*/ui*, classes `p-*`, `@deprecated`, imports de p2;
     - `verify:labels`;
     - religar `no-output-on-prefix` e as cinco regras de a11y de template (`eslint.config.mjs:182,196-203`), hoje desligadas sob a justificativa de "suites axe" que existem em só 7 specs.

## Impacto no consumidor (gestao-de-projetos)

- `orc-icon` (272 usos): a API de uso não muda. O app passa a carregar a fonte Material Symbols Rounded no `index.html`.
- `orc-file-uploader` (4 usos), no novo nome entre parênteses:
  - outputs: `onSelect` (`filesSelected`), `onRemove` (`fileRemoved`), `onClear` (`filesChange`), `onError` (`rejected`);
  - `mode="basic"` vira `variant="button"`, e `choose()` vira `open()`;
  - saem `customUpload`, `showUploadButton`, `showCancelButton` e `styleClass`;
  - o `<ng-template #empty>` de `new-guild`, hoje ignorado em silêncio, passa a funcionar como `orcFileUploaderEmpty`.
- `<app-column>`: renomear os 13 usos para `<orc-column>`.
- Remover o import morto de `TooltipDirective` e o `tooltipPosition` órfão em `components/table/table.component.html:51`.
- Trocar o `@import` do `index.scss` por `@ciag/orchestra/styles/orchestra.css`. Se o app depende do reset, importar `reset.css`.
