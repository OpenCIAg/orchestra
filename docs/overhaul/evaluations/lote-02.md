# Lote 02: Seleção (avaliação)

Fonte: `docs/overhaul/evaluations/lote-02.json`. Régua: `docs/overhaul/README.md`.

| id             | veredito               | motivo                                                                                                                                                            |
| -------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| select         | KEEP-REDESIGN          | Seletor canônico (simples e múltiplo), muito usado pelo consumidor. Tem 85 inputs (18 no-op), aliases em pares, 3 outputs para a mesma mudança e textos em inglês |
| multi-select   | MERGE → select         | Duplica `orc-select [multiple]`. Tem 25 inputs no-op e o toggle-all fica invisível por padrão. As 12 tags do consumidor viram `<orc-select multiple>`             |
| combobox       | MERGE → autocomplete   | Mesmo padrão combobox editável (até as classes são `p-autocomplete`). `forceSelection` cobre o valor restrito. 0 usos                                             |
| autocomplete   | KEEP-REDESIGN          | Melhor implementação do lote (IME, Home/End, delay, 25 specs). Valor só string, não emite a consulta com `forceSelection`, tem CVA próprio e aliases              |
| listbox        | KEEP-REDESIGN          | Lista de seleção inline com lugar próprio (e base para pick-list/order-list). Tem 16 inputs e 3 outputs no-op e falta Space/Home/End/typeahead                    |
| cascade-select | REMOVE (→ tree-select) | Paridade PrimeNG no monólito p2: o import puxa o chunk p2 (~57 KB gzip). Painel absolute sem overlay CDK, CVA próprio, valor só string, 0 usos                    |
| tree-select    | KEEP-REDESIGN          | Caso corporativo real, mas reimplementa orc-tree com padrões de propagação opostos e é O(n²) no modo checkbox. Deve compor orc-tree no painel                     |
| dropdown       | MERGE → menu (lote 06) | Dois produtos num só: menu de ações (vai para o popup do menu) e um "select compatível PrimeNG" (sai; o select cobre). Usa `[innerHTML]` para ícone               |
| chip-input     | MERGE → tags-input     | Implementação paralela de tags-input, com `value` sem model, aliases e sugestões sem teclado. Leva para o alvo a composição com orc-input e os anúncios aria-live |
| tags-input     | KEEP-REDESIGN          | Canônico da entrada de tags. Remove 2 seletores-alias, o entry `chips` e os outputs duplicados, e o botão remover passa a existir por padrão                      |

Contagem: 5 KEEP-REDESIGN, 4 MERGE, 1 REMOVE. Sobram 5 famílias de 10.

## Observações transversais

1. **O núcleo de seleção existe, mas está pela metade.** `internal/list-picker.ts` centraliza leitura de opções, filtro e overlay, mas preserva de propósito três estratégias de igualdade por `dataKey` (`extract` no select, `both-sides` no multi-select, `objects` no listbox; `list-picker.ts:106-141`), dois algoritmos de roving (wrap e clamp) e um roving por DOM no dropdown e no cascade. Nenhuma família usa `ListKeyManager`: o grep por `ListKeyManager|ActiveDescendantKeyManager` em `projects/orc-ds` dá 0 resultados. Proposta para o núcleo comum em `@ciag/orchestra/internal`, reaproveitado por select, autocomplete, listbox e tree-select:
   - `OrcOptionBase` / `orc-option` único, implementando `Highlightable`. Com isso `[options]` e a projeção usam o mesmo caminho de render.
   - `ActiveDescendantKeyManager` do CDK, com `withWrap`, `withHomeAndEnd`, `withTypeAhead` e `skipPredicate(disabled)`, no lugar de `stepListPickerActive`, `listPickerSkipDisabled` e dos loops manuais.
   - `SelectionModel` de `@angular/cdk/collections` para simples, múltiplo e `selectionLimit`.
   - `compareWith: (a, b) => boolean`, idioma do `<select>` do Angular, no lugar de `dataKey` e dos três modos.
   - Um único `OrcOption<T>` (`label`, `value`, `description?`, `icon?`, `disabled?`) no lugar de `SelectOption`, `SelectOptionItem`, `P2Option`, `AutocompleteOption`, `CascadeOption`, `DropdownItem` e `MultiSelectOption`.
   - Filtro `contains` sensível ao locale (via `LOCALE_ID`). Os modos `lt`, `gte`, `in` e `notEquals` são paridade PrimeNG e saem.
   - Overlay: manter um helper fino sobre `Overlay`/`cdkConnectedOverlay`. O backdrop transparente somado ao listener de clique externo dá dois mecanismos de dispensa redundantes (`list-picker.ts:479-541`).
2. **Uma forma de fazer cada coisa.** Hoje há 4 combos de lista com gatilho (select, multi-select, dropdown-form, cascade), 2 combos editáveis (combobox, autocomplete) e 2 entradas de tags (chip-input, tags-input). Depois do lote ficam `orc-select`, `orc-autocomplete`, `orc-listbox`, `orc-tree-select` e `orc-tags-input`.
3. **Entry points alias a remover:** `@ciag/orchestra/multiselect`, `/treeselect`, `/cascadeselect` e `/chips` (este reexporta do p2 e puxa o monólito). Também saem os seletores-alias `orc-chips`, `orc-input-chips` e `[selectTrigger]`.
4. **pt-BR:** todas as famílias têm padrões em inglês ("Clear selection", "Filter options", "No results found", "Loading options", "Options", "Listbox", "Autocomplete", "{0} items selected"). Várias deixam a ação **sem rótulo e sem render** quando o texto não é passado: limpar no combobox, remover e limpar no tags-input, toggle-all no multi-select. Tudo isso passa a depender de `provideOrcLabels`.
5. **Herança visual PrimeNG:** classes `p-multiselect`, `p-autocomplete*`, `p-listbox*`, `p-select*`, `p-chips*`, `p-component` e atributos `data-pc-name` aparecem em multi-select, combobox, autocomplete, listbox, dropdown, chip-input e tags-input. Saem junto com `style`, `styleClass`, `panelStyle`, `panelStyleClass` e `appendTo`.
6. **ARIA:** em select e autocomplete, `role=listbox` contém input de filtro, cabeçalho ou `role=status`, e listbox só pode conter option/group. No select, o filtro recebe o foco sem ser combobox, então a opção ativa não é anunciada. Nenhuma família tem teste de a11y automatizado (axe): o grep nos specs do lote não acha nada.
7. **Overlays fora do CDK:** cascade-select, chip-input e tags-input posicionam o painel com `position:absolute` + z-index, e o painel é cortado em modais e contêineres com overflow.
8. **Consumidor (gestao-de-projetos):** só usa select (45 tags, 23 arquivos) e multi-select (12 tags, 5 arquivos). A migração é mecânica:
   - `(onChange)` ×6 e `(selectionChange)` ×3 → `(valueChange)`
   - `styleClass` ×6 → `class`
   - `inputId` ×5 → `id`
   - `<orc-multi-select>` → `<orc-select multiple>`
   - `(onFilter)` ×2 → `(filterValueChange)`
   - `showHeader` ×2 sai
9. **Dependências entre lotes:**
   - dropdown → menu (lote 06): o menu precisa sair do p2 e ganhar popup ancorado com CDK.
   - tree-select → tree (lote 08).
   - tags-input → chip (lote 09) e input/form-field (lote 03).
   - `provideOrcLabels` e esvaziamento de `p2/` → lote 10.
