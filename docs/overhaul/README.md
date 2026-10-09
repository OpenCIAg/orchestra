# Overhaul da Orchestra: decisões, rubrica e lotes

Fonte de verdade da revisão. Todo avaliador e todo executor lê este arquivo inteiro antes de começar.

## 1. Decisões do produto (Matheus Castro, 08/10/2026), não negociáveis

| #   | Tema                                                                                  | Decisão                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Versão                                                                                | O RC parte da linha 22: **`22.4.0-rc.0`** (Angular 22), **com breaking changes**. Nada de esperar o Angular 23. Não publicar no npm                                    |
| 2   | Distribuição                                                                          | Pacote npm `@ciag/orchestra`. O modelo "copiar para o projeto" (shadcn CLI) fica para o futuro e **não** entra neste RC                                                |
| 3   | Componentes fora do núcleo (Chart, Editor, Galleria, Terminal, OrgChart, Knob…)       | **Ficam no pacote, marcados como experimentais** (`status: 'experimental'` no catálogo e `@experimental` no JSDoc). Precisam funcionar, mas a API pode mudar sem major |
| 4   | Ramos v19/v20/v21                                                                     | Congelados. O redesign existe só na `main`/Angular 22                                                                                                                  |
| 5   | Ícones                                                                                | **Mantém Material Symbols** (`orc-icon`, fonte carregada pelo app)                                                                                                     |
| 6   | Estilo                                                                                | **CSS puro para o consumidor**: tokens em variáveis CSS e `@layer`. O SCSS fica só como ferramenta de build interna. O consumidor não precisa de Sass                  |
| 7   | Identidade visual                                                                     | **A identidade CIAg já existente** (tokens, cores e tipografia atuais em `projects/orc-ds/styles` e na docs). Refinar coerência, não reinventar                        |
| 8   | Idioma                                                                                | **pt-BR em tudo**: docs, textos padrão dos componentes e mensagens. A docs fica estruturada para receber traduções no futuro                                           |
| 9   | Formato da API                                                                        | **Tudo é componente** com prefixo `orc-` (como hoje). Não migrar para diretivas de atributo em elementos nativos                                                       |
| 10  | Consumidor `ciag/Projetos/gestao-de-projetos/frontend` (Angular 21, orchestra 21.1.1) | **Migrar** para o RC numa branch própria desse repositório                                                                                                             |

**Mandato geral do Matheus.** "Não quero que essa biblioteca seja meramente uma ponte de transição do PrimeNG." Breaking changes estão liberadas, e o objetivo é identidade e performance, no espírito do shadcn/ui. Não há aprovação humana intermediária: as decisões são do Tesla, com base nas avaliações.

## 2. Princípios (a régua)

1. **Uma forma de fazer cada coisa.** Sem aliases de nome (entry points, seletores, classes ou outputs duplicados). Duplicata → funde no canônico e o outro sai.
2. **Angular idiomático.**
   - `input()`, `model()` e `output()` com signals; `OnPush`; compatível com zoneless.
   - Outputs **sem prefixo `on`** (`valueChange`, `opened`, `closed`, …). Nomes de evento PrimeNG (`onChange`, `onShow`, `onHide`, `onLazyLoad`…) **saem**.
   - Controles de formulário implementam `ControlValueAccessor` (via a base interna compartilhada) e funcionam com Reactive Forms, template forms e `[(value)]`.
   - Overlays, foco, `ListKeyManager` e virtual scroll usam `@angular/cdk` quando ele resolve; nada de reimplementar.
3. **Composição em vez de configuração.** Inputs que só existem por paridade com PrimeNG (`appendTo`, `styleClass`, `style`, `showTransitionOptions`, `panelStyleClass`, `tooltip*`, `virtualScrollOptions` etc.) e **todo input no-op/deprecado saem**. Customização vem por slots (`ng-content`, `ng-template` com diretiva marcadora) e por tokens CSS.
4. **Performance.** Um entry point por família. Sem CSS global vazando. Custo por entry medido (chunk FESM gzip). Nada de dependência nova sem justificativa.
5. **Acessibilidade.** Padrão WAI-ARIA correto, teclado completo, foco visível, nomes acessíveis padrão em pt-BR e sobrescrevíveis.
6. **pt-BR.** Textos padrão (ex.: "Fechar", "Carregando", "Nenhum resultado") vêm de um provider de rótulos (`provideOrcLabels`) com padrão pt-BR, preparado para traduções.

## 3. Vereditos

| Veredito        | Quando                                                                                                          | Efeito no RC                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `KEEP`          | Útil, idiomático, API enxuta                                                                                    | Mantém; ganha docs nova                                           |
| `KEEP-REDESIGN` | Útil, mas API/implementação fora dos princípios                                                                 | Mantém com API nova (breaking)                                    |
| `MERGE`         | Duplicata de outra família                                                                                      | Recursos úteis migram para o alvo; a família sai                  |
| `REMOVE`        | Sem caso de uso claro em Angular, responsabilidade do app, resolvido por CSS/plataforma, ou só paridade PrimeNG | Sai do pacote                                                     |
| `EXPERIMENTAL`  | Valor real, mas nicho/pesado/fora do núcleo                                                                     | Fica no pacote como experimental; corrigir o que estiver quebrado |

## 4. Critérios (0–3 cada, com evidência `arquivo:linha`)

- `useCase`: caso de uso real em app Angular corporativa (3 = toda app usa)
- `uniqueness`: não duplica outra família (3 = único)
- `angularFit`: signals, CVA, CDK, sem padrões React/Vue/PrimeNG (3 = exemplar)
- `a11y`: padrão WAI-ARIA, teclado, testes de a11y
- `apiLean`: tamanho/coerência da API (3 = enxuta; 0 = dezenas de inputs no-op)
- `implQuality`: código legível, sem hacks, sem DOM manual desnecessário
- `tests`: specs que testam comportamento (não só "cria")
- `consumerUse`: uso no gestao-de-projetos (em `docs/overhaul/measurements.json` → `consumer`)

## 5. Formato de saída do avaliador (obrigatório)

Um arquivo por lote: `docs/overhaul/evaluations/lote-NN.json`. É um array; cada família segue este esquema:

```json
{
  "id": "select",
  "verdict": "KEEP-REDESIGN",
  "mergeInto": null,
  "scores": { "useCase": 3, "uniqueness": 2, "angularFit": 1, "a11y": 2, "apiLean": 0, "implQuality": 1, "tests": 2, "consumerUse": 3 },
  "rationale": "2–4 frases objetivas.",
  "evidence": ["projects/orc-ds/select/select.component.ts:120 — 18 inputs deprecados no-op", "..."],
  "targetApi": {
    "selector": "orc-select",
    "inputs": ["options", "optionLabel", "optionValue", "placeholder", "disabled", "..."],
    "models": ["value"],
    "outputs": ["opened", "closed"],
    "slots": ["orcSelectOption (ng-template)", "..."],
    "remove": ["appendTo", "styleClass", "onChange (→ valueChange via model)", "..."]
  },
  "defects": ["bugs/a11y concretos encontrados, com arquivo:linha"],
  "consumerImpact": "o que o gestao-de-projetos usa e como migra (ou 'nenhum')",
  "effort": "P|M|G",
  "dependsOn": ["infra: overlay CDK", "..."]
}
```

E um resumo legível `docs/overhaul/evaluations/lote-NN.md`: tabela id → veredito → uma linha de motivo, mais as observações transversais do lote.

`targetApi` é obrigatório para `KEEP-REDESIGN` e `KEEP`. Para `MERGE`, diga o que migra para o alvo. Para `REMOVE`, diga o substituto (outra família, CSS ou "responsabilidade do app").

## 6. Lotes

| Lote                                     | Famílias                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01 Ações                                 | button, button-group, split-button, toggle-button, segmented-control, select-button, close-button, floating-action-button, speed-dial                                                                                                                                                                                                                                                                                                                                                                                    |
| 02 Seleção                               | select, multi-select, combobox, autocomplete, listbox, cascade-select, tree-select, dropdown, chip-input, tags-input                                                                                                                                                                                                                                                                                                                                                                                                     |
| 03 Entrada A (texto/número/campo)        | input, input-group, icon-field, ifta-label, float-label, form-field, form, number-input, password, otp-input                                                                                                                                                                                                                                                                                                                                                                                                             |
| 04 Entrada B (data/escalas/booleanos)    | date-input, date-picker, calendar, color-picker, input-color, knob, slider, rating, checkbox, radio, switch                                                                                                                                                                                                                                                                                                                                                                                                              |
| 05 Overlays                              | modal, confirm-dialog, confirm-popup, drawer, popover, overlay-panel, overlay, hover-card, tooltip, block-ui, toast, portal                                                                                                                                                                                                                                                                                                                                                                                              |
| 06 Navegação                             | menu, menubar, tiered-menu, mega-menu, panel-menu, context-menu, tab-menu, command-menu, dock, navigation, breadcrumb, tabs, stepper, paginator, toolbar                                                                                                                                                                                                                                                                                                                                                                 |
| 07 Layout                                | box, flex, stack, space, grid, container, aspect-ratio, fluid, splitter, scroll-panel, scroll-area, divider, separator, fieldset, panel, accordion, collapsible, card                                                                                                                                                                                                                                                                                                                                                    |
| 08 Dados                                 | table, data-table, tree-table, data-view, list, tree, tree-view, order-list, pick-list, virtual-scroller, timeline, organization-chart                                                                                                                                                                                                                                                                                                                                                                                   |
| 09 Exibição/feedback                     | avatar, badge, overlay-badge, tag, chip, alert, messages, empty-state, progress, meter-group, skeleton, spinner, image, image-compare, galleria, carousel, inplace                                                                                                                                                                                                                                                                                                                                                       |
| 10 Tipografia, utilitários e transversal | text, typography, kbd, link, code, icon, visually-hidden, scroll-top, terminal, chart, editor, file-upload, file-uploader; **mais** as 19 diretivas, 4 serviços, `styles/` (tokens/temas/reset), `p2/`, `internal/`, os 14 entry points sem família (avatar-group, defer, drag-drop, icons, input-group-addon, input-mask, key-filter, message, pagination, sidebar, text-input, toggle, p2, internal) e o tooling de qualidade/release em `tools/` (o que sobrevive e o que é burocracia do período de compatibilidade) |
