# Lote 09: Exibição/feedback

Avaliação das 17 famílias, seguindo `docs/overhaul/README.md`. Detalhes, evidências `arquivo:linha` e `targetApi` estão em `lote-09.json`.

**Contagem:** KEEP 0 · KEEP-REDESIGN 8 · MERGE 5 · REMOVE 0 · EXPERIMENTAL 4

| id            | veredito         | motivo                                                                                                                                                                                          |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avatar        | KEEP-REDESIGN    | Primitivo essencial. Saem os aliases name/label/initials, o modo clicável (reimplementa um botão) e os rótulos em inglês. O AvatarGroup fica no mesmo entry, só por composição.                 |
| badge         | KEEP-REDESIGN    | **Rótulo estático canônico** (status, contador, ponto). Absorve Tag e OverlayBadge; perde dismissible (vai para o Chip), as severidades de domínio e os SVGs embutidos.                         |
| overlay-badge | MERGE → badge    | Badge posicionado. Hoje mora no p2 e o entry puxa o chunk p2 inteiro (~600 KB brutos). Vira `orc-overlay-badge` no entry badge, compondo um `orc-badge`.                                        |
| tag           | MERGE → badge    | Mesma função do Badge com outro nome. É o maior impacto do lote (26 usos), mas a migração é mecânica: `value` vira conteúdo, `rounded` vira `pill`.                                             |
| chip          | KEEP-REDESIGN    | **Token interativo** (selecionável/removível); passa a ser o token do chip-input. Saem style/styleClass/removeIcon/onRemove.                                                                    |
| alert         | KEEP-REDESIGN    | Feedback inline canônico (29 usos). Absorve Messages; elimina 6 pares de alias, `life`, o seletor `orc-message` e o input `title` que vaza tooltip nativo.                                      |
| messages      | MERGE → alert    | `p-messages` do PrimeNG: um `@for` sobre `orc-alert dismissible`. CSS de severidade paralelo e código no p2.                                                                                    |
| empty-state   | KEEP-REDESIGN    | Muito usado (25). Ação passa a ser slot com `orc-button`, ícone vira Material Symbol (hoje recebe emojis), sai o landmark `region` e o `h2` fixo, e `title` vira `heading`.                     |
| progress      | KEEP-REDESIGN    | Família de medição: `orc-progress-bar`, `orc-progress-circle` e `orc-meter`. Saem 4 formas de cor, 3 de sufixo, o template `#content`, o `orc-progress-spinner` e 2 entries alias. Ganha `max`. |
| meter-group   | MERGE → progress | Vira `orc-meter` (role=meter) no entry progress. Aliases values/value, cor hex fixa, percentual errado com `min≠0`, rótulos só em `title`.                                                      |
| skeleton      | KEEP-REDESIGN    | Deveria ser um div simples. Saem shape/size/borderRadius/fitContent/style e o role=status por placeholder; corrige a largura aplicada duas vezes.                                               |
| spinner       | KEEP-REDESIGN    | Spinner canônico; absorve `orc-progress-spinner`. O modo tela cheia vai para block-ui. Remove o listener global de Escape e renomeia `LoadingSpinnerComponent` para `SpinnerComponent`.         |
| image         | EXPERIMENTAL     | Sem o preview é só um `<img>` com CSS. O lightbox tem valor, mas é nicho e depende do modal. Saem os 3 no-ops e os outputs `on*`.                                                               |
| image-compare | EXPERIMENTAL     | Nicho, pequeno e funcional. Saem `onSlide`, o tabindex duplicado e o entry alias `imagecompare`.                                                                                                |
| galleria      | EXPERIMENTAL     | Por decisão do produto. Absorve o Carousel com template de item genérico; saem o seletor `orc-gallery`, os 4 no-ops, o listener global e o focus trap caseiro (→ CDK).                          |
| carousel      | MERGE → galleria | Não é genérico: um slide fixo label/imagem por vez, `numVisible`/`responsiveOptions` sem efeito, autoplay sem botão de pausa. Na prática é uma galleria sem thumbnails.                         |
| inplace       | EXPERIMENTAL     | Nicho, mas a gestão de foco é boa e bem testada (445 linhas). Sai do p2; perde `onActivate`/`onDeactivate`; slots viram `ng-template`.                                                          |

## Decisões de fronteira

- **Tag vs Chip vs Badge.** Ficam dois componentes. `orc-badge` cobre tudo que é estático (status, categoria, contador, ponto, sobreposto). `orc-chip` cobre tudo que é interativo (selecionável com `aria-pressed`, removível com botão próprio). Hoje há três jeitos de remover um token: Badge `dismissible`, Tag `removable` e Chip `removable`. Fica só o do Chip. O `chip-input` (lote 02) usa `orc-badge dismissible` como token (`chip-input.component.html:29-39`) e precisa migrar para `orc-chip`.
- **Alert vs Messages.** Fica o Alert. Lista de mensagens é `@for` no app; o app remove o item no `(dismissed)`. O auto-dismiss (`life`) é papel do toast (lote 05).
- **Progress vs MeterGroup.** Ficam numa família só, com papéis ARIA distintos: `orc-progress-bar`/`orc-progress-circle` (progressbar, tarefa em andamento) e `orc-meter` (meter, composição de valores). O indeterminado circular é o `orc-spinner`.
- **Spinners.** Hoje há três: `orc-spinner`, `orc-progress-spinner` e `orc-progress-circle mode=indeterminate`. Fica só o `orc-spinner`. O bloqueio de tela cheia vai para block-ui.
- **Slides.** Galleria e Carousel viram uma família só (galleria, experimental) com `orcGalleriaItem`.

## Entry points do lote 10 que tocam este lote

- `message`: alias do `AlertComponent` renomeado + `MessagesComponent` do p2 (`message/index.ts:1-3`). **Sai** junto com o seletor `orc-message` e a família messages.
- `avatar-group`: alias puro de `@ciag/orchestra/avatar` (`avatar-group/index.ts:1-2`). **Sai**; o `AvatarGroupComponent` continua exportado por `avatar`.
- Também saem os aliases `overlaybadge`, `overlay-badge`, `metergroup`, `meter-group`, `progress-bar`, `progress-spinner`, `imagecompare`, `gallery`, `carousel`, `tag` e `messages`.

## Observações transversais

1. **Inputs homônimos de atributos globais.** `title` no Alert (`alert.component.ts:40`) e no EmptyState (`empty-state.component.ts:43`) deixa `title="…"` estático no host, e o navegador mostra tooltip nativo sobre o bloco inteiro. O consumidor faz isso 30 vezes (6 em alert, 24 em empty-state). Regra para o RC: nenhum input chamado `title`, `role`, `id` ou `style`; usar `heading` e equivalentes.
2. **Vocabulário de cor único.** Hoje convivem `status`, `severity` e `variant` com valores divergentes: `danger`/`error`, `warn`/`warning`, `pending`/`new`/`completed`. Proposta para badge, chip, alert e progress: `severity: 'neutral'|'primary'|'info'|'success'|'warning'|'danger'`, com `variant` reservado para aparência (`soft`/`solid`/`outline`).
3. **Ícones como texto cru.** Tag, Chip, Avatar, Alert (`[class]=icon`) e EmptyState renderizam `icon` como texto ou classe CSS, não como `orc-icon`. Isso viola a decisão #5 (Material Symbols). O consumidor passa emojis para o empty-state.
4. **pt-BR.** Todas as famílias do lote têm rótulos padrão em inglês: 'Loading', 'Progress', 'Dismiss alert', 'Remove', 'Empty state', 'Online', 'Carousel', 'Open image preview', 'Edit', 'Close' e outros. Dependem de `provideOrcLabels`.
5. **Monólito p2.** `overlay-badge`, `messages` e `inplace` vivem no p2 com `P2_SHARED_STYLES`; os entries reexportam de `@ciag/orchestra/p2`, então importar um badge sobreposto custa o chunk p2. Com este lote, os três saem do p2 (dois por MERGE, um extraído).
6. **Classes e atributos PrimeNG** (`p-avatar`, `p-chip`, `p-skeleton`, `p-progressbar`, `p-progressspinner`, `p-component`, `data-pc-*`) ainda aparecem em avatar, chip, skeleton, progress e spinner. Saem todos.
7. **Autoplay e WCAG 2.2.2.** Carousel e Galleria têm autoplay sem controle de pausa visível. A galleria redesenhada precisa de botão pausar/reproduzir e de `aria-live="off"` durante a rotação.

## Impacto no gestao-de-projetos

| Uso                    | Migração                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `orc-alert` 29x        | `message` → conteúdo projetado; `title` → `heading`; remover `[showIcon]="true"`; severidade `error` → `danger` |
| `orc-tag` 26x          | → `orc-badge`: `[value]` → conteúdo; `severity` mantém; `[rounded]` → `pill`; `variant` (cor) → `severity`      |
| `orc-empty-state` 25x  | `title` → `heading`; trocar o emoji por nome Material Symbol                                                    |
| `orc-progress-bar` 15x | import `progress-bar` → `progress`; `variant` → `severity`; `customColor` (1x) → token CSS                      |
| `orc-spinner` 14x      | `LoadingSpinnerComponent` → `SpinnerComponent`; `text` → `label`                                                |
| `orc-badge` 2x         | `[text]` → conteúdo; `status` → `severity`                                                                      |
| `orc-skeleton` 1x      | remover `borderRadius`/`ariaLabel`; `aria-busy` no contêiner                                                    |
