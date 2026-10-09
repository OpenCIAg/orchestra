# Lote 01 — Ações

Avaliação somente-leitura seguindo `docs/overhaul/README.md`. Os detalhes (notas, evidências `arquivo:linha`, `targetApi`, defeitos) estão em `lote-01.json`.

| id                     | veredito                  | motivo                                                                                                                                                                                                                      |
| ---------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| button                 | KEEP-REDESIGN             | Base indispensável (223 usos), mas são 31 inputs com paridade PrimeNG (severity, text/outlined/raised/rounded/plain, fluid, ícones como string/SVG); `orc-icon-button` duplica `iconOnly`; o DOMPurify fica preso ao pacote |
| button-group           | KEEP-REDESIGN             | API já enxuta; precisa sair do `p2`, perder `P2_SHARED_STYLES` e o `::ng-deep button` que vaza para botões internos                                                                                                         |
| split-button           | REMOVE                    | Cópia da API PrimeNG com menu feito à mão (sem CDK, listeners em `document`, glifos de texto, `appendTo` no-op). O substituto é a composição: button-group + button + menu de ações do lote 06                              |
| toggle-button          | KEEP-REDESIGN             | O "Toggle" do shadcn tem lugar na lib, mas a API é PrimeNG (onLabel/offIcon…) e há um **bug**: com o padrão, o botão não despressiona (e o spec trava esse comportamento)                                                   |
| segmented-control      | KEEP-REDESIGN             | Melhor implementação do trio (radiogroup, roving, RTL, CVA, 7 specs, 15 usos). Vira o canônico, ganha `multiple` e perde os 3 outputs duplicados e as classes `p-*`                                                         |
| select-button          | MERGE → segmented-control | Mesmo propósito, API PrimeNG (optionLabel/dataKey/allowEmpty, outputs `on*`) e a11y inferior. Só o modo `multiple` migra                                                                                                    |
| close-button           | MERGE → button            | Já está `@deprecated` no código; o substituto é `orc-button iconOnly` + `orc-icon close`, com o rótulo "Fechar" vindo de `provideOrcLabels`                                                                                 |
| floating-action-button | REMOVE                    | Padrão Material mobile que nem flutua (não tem `position: fixed`); resolve-se com `orc-button` + CSS do app. O rótulo padrão é "Create"                                                                                     |
| speed-dial             | EXPERIMENTAL              | Nicho e fora do núcleo (decisão 3). Funciona, mas a API precisa ser enxugada: `actions`/`model` duplicados e 5 outputs de visibilidade                                                                                      |

Contagem: KEEP-REDESIGN 4 · MERGE 2 · REMOVE 2 · EXPERIMENTAL 1 · KEEP 0.

## Observações transversais

1. **Ícones fora da decisão 5.** Nenhuma família do lote usa `orc-icon`:
   - `button` renderiza `<i [class]>` (estilo PrimeIcons) ou SVG-string.
   - split-button, toggle-button, segmented-control, speed-dial, FAB e close-button imprimem o nome do ícone ou glifos (`'+'`, `'×'`, `'⌄'`, `'…'`) como texto. Com Material Symbols isso aparece como a palavra literal.
   - Padrão do RC: ícone por slot (`<orc-icon iconStart name="…">`) ou `icon: string` renderizado internamente com `<orc-icon [name]>`.
2. **DOMPurify vira dependência de runtime do pacote inteiro** (`projects/orc-ds/package.json:63`), e só `button/safe-icon.ts` o usa. Remover os inputs de ícone em string elimina a dependência. Ganho direto de peso e de superfície de segurança.
3. **Saídas duplicadas são sistêmicas.** Cada família emite o mesmo evento 2 a 4 vezes: `change` + `onChange` + `valueChangeEvent` + o `valueChange` do model; `primaryClick` + `onClick`; `visibleChange` + `onVisibleChange` + `onShow`. Regra do RC: `model()` basta, e eventos nativos (`click`, `focusin`/`focusout`) não ganham output.
4. **Textos padrão em inglês:** "Close" (`button.component.html:95` e close-button), "Create" (FAB), "More options" (split-button). Todos devem vir de `provideOrcLabels` em pt-BR.
5. **Mimetismo PrimeNG no DOM.** Ainda aparecem as classes `p-selectbutton`, `p-togglebutton`, `p-button` e `p-component`, o atributo `data-pc-name` e o `P2_SHARED_STYLES` (com seletores globais) em segmented-control, select-button, toggle-button, button-group e button. Também há aliases de entry point a remover: `buttongroup`, `selectbutton`, `togglebutton`, `splitbutton` e `speeddial`.
6. **CVA reescrito à mão** em segmented-control, select-button e toggle-button. Deve migrar para a base interna compartilhada.
7. **Lacunas para outros lotes:**
   - "Ação como link": o consumidor usa `<orc-button routerLink>` 5 vezes, o que gera duplo tab stop e semântica errada. Precisa de um `orc-link` com aparência de botão (lote 10).
   - Menu de ações com gatilho projetado em CDK (lote 06), pré-requisito da composição que substitui o split-button.
   - O alias `orc-toggle` (= switch, lote 10) confunde com `orc-toggle-button` e deve sair.
8. **Consumidor:** a migração do gestao-de-projetos é quase nula. Ele usa só `orc-button` e `orc-segmented-control`, com inputs que sobrevivem; a única troca é `label` → `ariaLabel` no segmented. Há um alerta semântico: parte dos 15 usos do segmented-control faz navegação entre seções e deveria passar a usar `orc-tabs`.
