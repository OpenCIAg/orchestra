# Lote 05 — Overlays

Avaliação somente-leitura feita sobre `release/22.4.0-rc`. Detalhes, evidências `arquivo:linha` e `targetApi` estão em `lote-05.json`.

## Vereditos

| id                | veredito                           | motivo                                                                                                                                                                                                                |
| ----------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| infra-overlay     | KEEP-REDESIGN (nova infra interna) | Hoje coexistem 5 mecanismos de overlay (CDK, registro caseiro, `<dialog>` top layer, Popover API, z-index fixo) e 3 motores de posicionamento. Unificar em `@angular/cdk/overlay` + `cdk/dialog` + `cdk/a11y`         |
| modal             | KEEP-REDESIGN                      | 14 usos no consumidor, mas 49 inputs (11 no-op), dois models (`isOpen`/`visible`), 3 seletores e serviço que exige `<orc-modal>` dentro do componente aberto. Novo: `[(open)]` + `OrcDialogService`                   |
| confirm-dialog    | MERGE → modal                      | Padrão PrimeNG, com backdrop z-index 100 que fica atrás de um orc-modal. Vira `OrcDialogService.confirm()` → `Promise<boolean>`                                                                                       |
| confirm-popup     | REMOVE                             | Paridade PrimeNG, 400 linhas com terceiro motor de posicionamento. Substituto: composição com orc-popover ou `confirm()`                                                                                              |
| drawer            | KEEP-REDESIGN                      | Útil e razoavelmente limpo, mas sem portal (preso a ancestrais e abaixo do modal), com alias `orc-sidebar`, `open`/`visible` e inputs duplicados. Vira variante posicional do OrcDialog                               |
| popover           | KEEP-REDESIGN                      | 8 usos no consumidor. Hoje é re-export de overlay-panel (24 inputs, `afterEveryRender` por instância, conteúdo sempre instanciado). Canônico, com `trigger='click'\|'hover'` e `<ng-template orcPopoverContent>` lazy |
| overlay-panel     | MERGE → popover                    | Mesmo controller, template e CSS do Popover; só o nome PrimeNG muda                                                                                                                                                   |
| overlay           | REMOVE                             | `<section [hidden]>` com 9 de 12 inputs no-op. Substituto: `@if` no app ou orc-popover                                                                                                                                |
| hover-card        | MERGE → popover                    | Popover inline sem portal nem delay. Vira `trigger='hover'` (o consumidor já faz hover à mão em orc-popover)                                                                                                          |
| tooltip           | KEEP-REDESIGN                      | Essencial, mas tem 3 aliases de texto, pares duplicados e 1 no-op, além de DOM manual. Não cumpre WCAG 1.4.13 (não é hoverable e o Escape só funciona com foco). Fica `[orcTooltip]` + 4 inputs prefixados            |
| block-ui          | REMOVE                             | Paridade PrimeNG. O núcleo é `inert` + `aria-busy` + orc-spinner; o modo target externo é DOM manual pesado                                                                                                           |
| toast             | KEEP-REDESIGN                      | Serviço bom com signals, mas com vocabulário duplo PrimeNG/Orchestra, aliases `add/remove`, 5 inputs no-op no container e live regions aninhadas. Fica atrás do `<dialog>` (o consumidor tem um workaround)           |
| portal            | REMOVE                             | Move nós projetados à mão e mantém MutationObserver no documento inteiro, duplicando `@angular/cdk/portal`                                                                                                            |
| sidebar (lote 10) | REMOVE                             | Entry alias puro de drawer mais o seletor `orc-sidebar`                                                                                                                                                               |

Contagem: KEEP-REDESIGN 6 (incluindo infra-overlay), MERGE 3, REMOVE 5 (incluindo o alias sidebar). Famílias que sobrevivem: modal, drawer, popover, tooltip, toast.

## Infra de overlay proposta (`infra-overlay`)

- **Camada modal** (modal, drawer, confirm): `Dialog` de `@angular/cdk/dialog` com container próprio. O CDK já entrega focus trap (`cdkTrapFocus`), foco de retorno ao elemento de origem, `aria-modal` com aria-hidden nos irmãos, Escape e backdrop via `disableClose`/`closePredicate`, `scrollStrategies.block()` e pilha de dialogs em que o Escape fecha só o topo. O drawer é o mesmo dialog com `GlobalPositionStrategy` numa borda.
- **Camada ancorada** (popover, tooltip e, depois, menus e select): `createOverlayRef` + `FlexibleConnectedPositionStrategy` (flip/push), `reposition()`, `overlayOutsideClick`/`keydownEvents`, `TemplatePortal` lazy.
- **Camada de notificações**: overlay global da região de toasts, acima dos dialogs.
- **Empilhamento**: um único `cdk-overlay-container`, em que a ordem de attach é a ordem da pilha. Abandonar o `<dialog showModal()>`. É o top layer que hoje obriga `overlayAttachmentTarget` a re-parentear popups para dentro do dialog e deixa toasts por baixo. Se o top layer for necessário, usar `usePopover` (já disponível no CDK 22.1.2) em todas as camadas, nunca misturado.
- **Remove de `internal/`**: `registerOverlay`/`isTopOverlay`/`isolateModalBackground`/`lockDocumentScroll`/`listenForOutsideInteraction`/`trapTabKey`/`focusInitialElement`, `modal-isolation.ts`, `overlay-attachment.ts`, `anchored-popup.ts`, `overlay-position.ts`. Em todos os overlays saem `appendTo`/`autoZIndex`/`baseZIndex`/`zIndex`.
- **API interna**: `OrcDialogService.open/confirm`, `OrcDialogRef`, `ORC_DIALOG_DATA`, `OrcAnchoredOverlay.attach(...)`, `OrcToastLayer`.

## Observações transversais

1. **pt-BR**: todos os rótulos padrão do lote estão em inglês ('Dialog', 'Close dialog', 'Drawer', 'Close drawer', 'Popover', 'Close popover', 'Accept', 'Reject', 'Confirmation', 'Dismiss notification'). Dependem de `provideOrcLabels`.
2. **Duplicatas sistemáticas**: models `open`×`visible`×`isOpen` em modal, drawer e popover; `closable`×`showClose*`; `dismissableMask`/`dismissible`×`closeOnBackdrop*`; outputs `onShow`/`onHide` em todos. O padrão-alvo é um model `open` e os outputs `opened`/`closed`, com nomes de inputs iguais entre modal e drawer.
3. **Custo por instância fechada**: `orc-modal` registra 2 listeners de captura no document desde o constructor (`modal.component.ts:202,218`) e roda `afterEveryRender`. `orc-popover` roda `afterEveryRender`, que escreve ARIA no gatilho a cada renderização (`overlay-panel.component.ts:132`). O consumidor tem popovers por célula de tabela (hourlog). Na infra nova, nada é registrado enquanto o overlay está fechado.
4. **Consumidor**: a migração é mecânica (`[(isOpen)]`→`[(open)]`, remover `showHeader`; conteúdo do popover em `<ng-template orcPopoverContent>`; wrapper de toast troca `add({severity,summary,detail})` por `success/error(...)`). Cai `dialog-aware-toast-container.service.ts`. O import de `TooltipDirective` em `table.component.ts:23` está morto.
5. **Medição**: `measurements.json` registra `consumer.imports=0` para toast, mas o consumidor importa `@ciag/orchestra/toast` em 2 arquivos. O uso de `orc-popover` (8) aparece contado em overlay-panel porque o seletor vive lá.
6. **Decisão 9**: tooltip continua diretiva `[orcTooltip]`. Isso não é uma migração para diretiva, porque ele já é diretiva e é comportamento sem host próprio. O lote 10 (diretivas) deve confirmar.
