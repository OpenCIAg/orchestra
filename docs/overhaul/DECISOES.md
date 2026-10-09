# Orchestra 22.4.0-rc.0: decisões consolidadas

Consolida as 169 avaliações de `docs/overhaul/evaluations/lote-*.json` (10 avaliadores). Onde este documento e uma avaliação discordam, **vale este documento**. O detalhe de cada família (targetApi, defeitos, evidência e impacto no consumidor) continua no JSON do lote, e o executor da família **deve lê-lo**.

## 1. Mapa final das famílias

**Núcleo, 58 famílias.** Todas KEEP-REDESIGN, sem exceção. Até as famílias boas precisam de pt-BR, rótulos, tokens e outputs sem `on`.

| Grupo                  | Famílias                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ações                  | button, button-group, toggle-button, segmented-control                                                           |
| Seleção                | select, autocomplete, listbox, tree-select, tags-input                                                           |
| Entrada                | input, form-field, number-input, otp-input, date-picker, calendar, color-picker, slider, checkbox, radio, switch |
| Overlays               | modal, drawer, popover, tooltip (diretiva), toast                                                                |
| Navegação              | menu, command-menu, navigation, breadcrumb, tabs, stepper, paginator, toolbar                                    |
| Layout                 | splitter, scroll-area, divider, fieldset, accordion, collapsible, card                                           |
| Dados                  | table, tree, timeline                                                                                            |
| Exibição/feedback      | avatar, badge, chip, alert, empty-state, progress, skeleton, spinner                                             |
| Tipografia/utilitários | text, kbd, link, code, icon, visually-hidden, file-uploader                                                      |

**Experimentais, 12 famílias.** Ficam no pacote com `status: 'experimental'` e `@experimental`; precisam funcionar, com pt-BR e sem PrimeNG: speed-dial, knob, rating, pick-list, organization-chart, image, image-compare, galleria, inplace, terminal, chart, editor.

**Fusões.** O recurso útil migra para o alvo e a família de origem **sai**:

| Origem                             | Alvo                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| select-button                      | segmented-control (`multiple`)                                                |
| close-button                       | button (`variant="close"`)                                                    |
| multi-select                       | select (`multiple`)                                                           |
| combobox                           | autocomplete (`forceSelection`)                                               |
| dropdown                           | menu                                                                          |
| chip-input                         | tags-input                                                                    |
| input-group, icon-field, password  | input (slots `orcPrefix`/`orcSuffix`; `type="password"` com botão de revelar) |
| date-input                         | date-picker                                                                   |
| input-color                        | color-picker                                                                  |
| confirm-dialog                     | modal (`OrcDialogService.confirm()`)                                          |
| overlay-panel, hover-card          | popover (`trigger="click" \| "hover"`)                                        |
| menubar, tiered-menu, context-menu | menu (`orc-menubar` e `orc-context-menu` vivem no entry `menu`)               |
| panel-menu                         | navigation                                                                    |
| tab-menu                           | tabs                                                                          |
| scroll-panel                       | scroll-area                                                                   |
| separator                          | divider                                                                       |
| panel                              | collapsible (estático → card)                                                 |
| data-table, tree-table             | table                                                                         |
| list                               | listbox                                                                       |
| tree-view                          | tree                                                                          |
| tag, overlay-badge                 | badge                                                                         |
| messages                           | alert                                                                         |
| meter-group                        | progress (`orc-meter`)                                                        |
| carousel                           | galleria (experimental)                                                       |
| typography                         | text                                                                          |
| file-upload                        | file-uploader                                                                 |

**Removidos.** Saem sem substituto na lib; o substituto é CSS, Angular/CDK ou o próprio app:

- split-button, floating-action-button, cascade-select, ifta-label, float-label, form;
- confirm-popup, overlay, block-ui, portal, mega-menu, dock;
- box, flex, stack, space, grid, container, aspect-ratio, fluid;
- data-view, order-list, virtual-scroller, scroll-top;
- diretivas defer, draggable/droppable, key-filter, autofocus, ripple, style-class, use-style, animate-on-scroll, focus-trap, e a diretiva `input-mask` (a máscara é o input `mask` do `orc-input`);
- `ConfirmPopupService`;
- os entry points alias (avatar-group, input-group-addon, message, pagination, sidebar, text-input, toggle, defer, drag-drop, input-mask, key-filter, icons, e todos os `aliasEntryPoints` de `measurements.json`);
- `p2/` inteiro.

## 2. Conflitos resolvidos

| Conflito                                                                     | Decisão                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lote 09 manda o spinner de tela cheia para block-ui; lote 05 remove block-ui | block-ui sai. **`orc-spinner` mantém `fullScreen`** (com `closeOnEscape` opt-in, como no MR !1); esse é o substituto do block-ui                                                                                                                             |
| Lote 10 mantém a diretiva `input-mask`; lote 03 a remove                     | Sai. A máscara fica só em `orc-input [mask]`                                                                                                                                                                                                                 |
| Decisão 9 ("tudo é componente") × gatilho do CDK Menu                        | Componentes para UI. **Diretivas só para anexar comportamento** a um elemento existente: `[orcTooltip]`, `[orcMenuTrigger]`, `[orcPrefix]`/`[orcSuffix]` e diretivas marcadoras de template (`orcCellDef` etc.). É coerente com o tooltip, que já é diretiva |
| Tipo do valor de data                                                        | **String ISO** (`yyyy-MM-dd`, ou `yyyy-MM-ddTHH:mm` com hora). Exibição por `displayFormat`, padrão `dd/MM/yyyy`. `Date` sai (fuso UTC−3 desloca o dia)                                                                                                      |
| `list` → `listbox`                                                           | Vale; o listbox sobrevive                                                                                                                                                                                                                                    |

## 3. Convenções da API nova

Todo executor segue estas regras; serão checadas por `verify:no-legacy`.

1. **Seletor** `orc-<família>`, um seletor por componente, sem aliases. Classe TS `<Nome>Component` (ex.: `ButtonComponent`).
2. **Um entry point por família**: `@ciag/orchestra/<família>`. O entry raiz `@ciag/orchestra` exporta só `core` (providers, rótulos, tipos comuns), não reexporta famílias.
3. **Signals.**
   - `input()`, `model()`, `output()`, `computed()`; `ChangeDetectionStrategy.OnPush`; nada de `@Input`/`@Output`/`EventEmitter`/`@HostListener` (use `host: {}`).
   - Compatível com zoneless: nada de `NgZone`, `setTimeout` para forçar CD ou `ChangeDetectorRef.detectChanges` como muleta.
4. **Estado de duas vias = `model()`**, com nomes padronizados:
   - `value` para controles;
   - `checked` para checkbox/switch/toggle;
   - `open` para overlays e disclosures;
   - `expanded` para árvore/accordion quando for conjunto.
5. **Outputs sem prefixo `on`.** Verbos no particípio para eventos (`opened`, `closed`, `activated`, `removed`, `queryChange`), sem duplicar o `xxxChange` que o `model()` já gera. Um evento, um output.
6. **Inputs proibidos:**
   - `style`, `styleClass`, `class`, `panelStyleClass`, `appendTo`, `*TransitionOptions`, `inputId`, `tooltip*`, `fluid`;
   - qualquer input no-op ou deprecado;
   - qualquer input com nome de atributo global HTML (`title`, `role`, `id`, `hidden`, `tabindex`). Use `heading` no lugar de `title`, e `id` só como atributo nativo repassado de forma explícita quando necessário.
7. **Tamanho e variante.**
   - `size: 'sm' | 'md' | 'lg'` (padrão `md`).
   - `variant` com vocabulário próprio da família.
   - Severidade de feedback: `tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'`. `severity` sai.
8. **Formulários.**
   - Todo controle estende a base CVA compartilhada de `@ciag/orchestra/internal` e funciona com Reactive Forms, `ngModel` e `[(value)]`.
   - `disabled` e `required` seguem o form control.
   - O controle se integra ao `orc-form-field`: id, `aria-describedby`, `aria-invalid` e required vêm do contexto de campo (DI), que é a única fonte de label/hint/erro.
9. **Overlays.** Todo popup usa a infraestrutura de `@ciag/orchestra/internal` sobre `@angular/cdk/overlay`, `cdk/dialog` e `cdk/a11y`. Nada de `position:fixed` manual, listeners globais com o overlay fechado, ou z-index mágico.
10. **Teclado e listas.** `ActiveDescendantKeyManager`/`FocusKeyManager` e `SelectionModel` do CDK onde couber.
11. **Rótulos pt-BR.** Todo texto padrão vem de `injectOrcLabels()` (`@ciag/orchestra/core`), com padrão pt-BR, sobrescrevível por `provideOrcLabels({...})` e, quando fizer sentido, por um input da instância. Nenhuma string de UI em inglês hard-coded.
12. **Estilos.**
    - Só tokens CSS `--orc-*` de `styles/`, sem fallback hex hard-coded (a cor CIAg vem do token).
    - `:host` com `display` definido; nada de CSS global vazando.
    - Classes do DOM `orc-<família>__elemento--modificador`.
    - Nada de `p-*`, `data-pc-*` ou `orc-p2-*`.
13. **Ícones** via `orc-icon` (Material Symbols). Ícone passado como nome (`icon="close"`) ou por slot. Nada de SVG/HTML em string e nada de DOMPurify.
14. **Acessibilidade.** Padrão WAI-ARIA correto, nome acessível padrão via rótulos pt-BR, foco visível por token, e `jasmine-axe` no spec da família.
15. **Testes.** Specs de comportamento por família, em `<família>/*.spec.ts`. Specs que só testavam aliases, paridade PrimeNG ou no-ops **saem**.
16. **Experimental.** JSDoc `@experimental` na classe e `status: 'experimental'` no catálogo.
17. **pt-BR na docs**, com a estrutura definida pela plataforma de docs (onda A4).

## 4. Ondas de execução

| Onda | Agentes        | Escopo                                                                                                                                                                                                                          |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | 4 em paralelo  | A1 remoção e tooling · A2 infra (`core`: rótulos; `internal`: overlay, CVA, contexto de campo) · A3 estilos (CSS puro, tokens, `@layer`, fonte de ícones) · A4 plataforma de docs (registros gerados, template de página pt-BR) |
| B    | 10 em paralelo | Redesign por lote: lib, specs e página da docs de cada família sobrevivente, absorvendo as fusões                                                                                                                               |
| C    | 2–3            | Migração do gestao-de-projetos, guia de migração, versão `22.4.0-rc.0`, changesets, QA visual                                                                                                                                   |

Integração, portões e a branch final `release/22.4.0-rc` ficam com o Tesla.
