# Lote 08: Dados

Avaliação somente leitura, feita em `release/22.4.0-rc` com base em `docs/overhaul/README.md` e `docs/overhaul/measurements.json`. Os detalhes de cada família, com `arquivo:linha`, estão em [`lote-08.json`](lote-08.json).

**Resultado:** 3 KEEP-REDESIGN, 4 MERGE, 3 REMOVE, 2 EXPERIMENTAL, 0 KEEP.

| id                 | veredito      | alvo    | motivo                                                                                                                                                                                                                                                                                                              |
| ------------------ | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table              | KEEP-REDESIGN | —       | É a única tabela usada pelo consumidor (7 `orc-table`, 31 `orc-column`) e já tem a base certa (`orc-column`, `orcCellDef`, signals, table-engine). Mas tem 103 inputs, ~27 inputs e 9 outputs no-op e aliases PrimeNG para quase tudo. Vira a tabela composicional única, com modo árvore e virtual scroll via CDK. |
| data-table         | MERGE         | table   | Segunda tabela sem slots de célula. O entry é só um re-export do monólito `p2`, que arrasta o chunk inteiro. Para table migram o `<button>` de ordenação no `<th>`, o `<caption>` sr-only e o rádio da seleção única.                                                                                               |
| tree-table         | MERGE         | table   | Terceira tabela, com motor, paginador e ordenação próprios, células só em texto e 28 no-ops. A hierarquia (treegrid, aria-level, cascata de seleção, paginação por raiz) vira `childrenAccessor` + `[(expanded)]` em `orc-table`.                                                                                   |
| data-view          | REMOVE        | —       | Cópia do DataView do PrimeNG. Substituto: `@for` + CSS grid + `orc-paginator`. Tem 13 inputs que só repassam valores ao paginador e outputs duplicados (`onLayoutChange`/`onChangeLayout`).                                                                                                                         |
| list               | MERGE         | listbox | Quando selecionável, já é um listbox (até usa `p-listbox` no host). Quando não, é menu ou `<ul>`. Para o `orc-listbox` (lote 02) migram a `description` por opção e o foco roving.                                                                                                                                  |
| tree               | KEEP-REDESIGN | —       | Árvore com seleção e cascata é caso real. Fica o nome `orc-tree` com `HierarchyNode`, mas sobre o renderer e o teclado de tree-view (ou CdkTree + TreeKeyManager). Ganha `[(selection)]`, `[(expanded)]` e slot `orcTreeNode`. Saem 13 no-ops, os `onX` e o filtro embutido.                                        |
| tree-view          | MERGE         | tree    | Mesmo papel de tree, com outro modelo de nó (`id` em vez de `key`), sem seleção e sem slot. É a melhor implementação ARIA do lote (grupos aninhados, roving, setsize/posinset, typeahead, 17 testes) e vira o motor do `orc-tree`.                                                                                  |
| order-list         | REMOVE        | —       | O CDK resolve com `cdkDropList` + `moveItemInArray` + botões do app, e pick-list já reordena dentro de cada painel. O input `dragdrop` é no-op, há `valueChangeEvent` ao lado do model `value` e `onFocus`/`onBlur`.                                                                                                |
| pick-list          | EXPERIMENTAL  | —       | A lista de transferência (papéis, permissões) tem valor e não tem duplicata, mas são 1.098 linhas de foco manual, drag nativo de HTML5, nenhum CVA e textos em inglês. Fica experimental, com API reduzida, `cdk/drag-drop` e CVA.                                                                                  |
| virtual-scroller   | REMOVE        | —       | Reimplementa o `cdk/scrolling` e só renderiza `itemLabel(item)` como texto, sem template de item. Também tem seletor duplo e o alias `itemSize`. Substituto: `cdk-virtual-scroll-viewport` direto no app e `orc-table [virtualScroll]`.                                                                             |
| timeline           | KEEP-REDESIGN | —       | É útil e não tem duplicata, mas cada item é um `<button>` sem ação, há um `role=heading` dentro do botão, nenhum slot e nenhum spec. Vira `<orc-timeline>` com filhos `<orc-timeline-item>` (conteúdo por `ng-content`), e a interação fica com o app.                                                              |
| organization-chart | EXPERIMENTAL  | —       | A decisão de produto nº 3 o mantém. A API é enxuta, mas o componente desenha uma lista indentada (`margin-left`), não um organograma, e declara `role=tree` sem a navegação por setas. Corrigir o layout, o teclado e o slot de nó, e adotar `HierarchyNode`.                                                       |

## A tabela única (proposta)

Hoje há três tabelas com 103 + 41 + 76 inputs. A proposta é um único `orc-table<T>`, construído sobre `internal/table-engine.ts`:

```html
<orc-table [data]="rows()" rowKey="id" ariaLabel="Projetos" selectionMode="multiple" [(selection)]="sel" [(sort)]="sort" [pageSize]="10" [(page)]="page" [childrenAccessor]="childrenOf" [(expanded)]="open" mode="server" [total]="total()" (queryChange)="load($event)" [virtualScroll]="false" (rowClick)="open($event)">
  <div orcTableToolbar><orc-input [(value)]="filter" /></div>
  <orc-column key="name" header="Nome" sortable sticky>
    <ng-template orcCellDef let-row>{{ row.name }}</ng-template>
  </orc-column>
  <ng-template orcRowExpansion let-row>…</ng-template>
  <ng-template orcTableEmpty>Nenhum projeto</ng-template>
</orc-table>
```

- **Colunas:** são declarativas, com `orc-column` e os slots `orcCellDef`, `orcHeaderCellDef` e `orcFooterCellDef`. `columnsConfig` sai, porque um `@for` de `<orc-column>` cobre o caso.
- **Recursos opt-in:**
  - seleção: `selectionMode`;
  - ordenação: `sortable` por coluna;
  - paginação: liga quando `pageSize` é definido;
  - expansão: slot `orcRowExpansion`, e a tabela renderiza o botão com `aria-expanded`;
  - árvore: `childrenAccessor`, que liga `role=treegrid`;
  - virtual scroll: `virtualScroll` + `rowHeight` sobre `cdk-virtual-scroll-viewport`. O `@angular/cdk` já é peerDependency.
- **Modo servidor:** `mode="server"` faz a tabela emitir `queryChange` com `{ page, pageSize, sort, filter }`. Isso substitui `serverDriven`, `lazy`, `lazyLoadOnInit`, `onLazyLoad` e `onPage`.
- **Fica fora do componente:**
  - o campo de busca: o app passa `[(filter)]` e põe o campo no slot `orcTableToolbar`;
  - o paginador customizado: o app compõe `orc-paginator` com `[(page)]`;
  - o CSV: vira a função pura `tableToCsv()` e o download fica com o app;
  - estilos: tokens CSS e `sticky` na coluna.
- **Saem de vez:** frozen, edit, state, grouping, context menu, resize e reorder, que hoje são todos no-op.

## Observações transversais

1. **O consumidor contornou o `orc-table`.** O `gestao-de-projetos` mantém um `app-table` próprio (`src/app/components/table`, 269 + 181 linhas, usado em 8 páginas) com modo servidor, `rowKey` como função, `rowExpandable`, `footerValues` e `queryChange`. Os `orc-table` de `my-tasks` e `task-list` (linha 56) estão aninhados na expansão desse `app-table` para mostrar subtarefas, ou seja, uma árvore montada à mão. A API proposta (`mode='server'`, `orcRowExpansion`, `childrenAccessor`, `orcFooterCellDef`, `rowKey` como função) cobre esse caso e permite apagar o `app-table`.
2. **A migração do consumidor é barata.** `orc-column` e `orcCellDef` não mudam. O que muda: `value`→`data`, `dataKey`→`rowKey`, `rows`/`paginator`→`pageSize`, `rowsPerPageOptions`→`pageSizeOptions` e `globalFilterFields`→`filterFields`. Também saem `hoverable`, `filterable`, `scrollable` e `tableStyle`, e `applyFilter()` vira `[(filter)]` (indicators.component.html:171,175,188,192).
3. **O CDK não é usado onde ele resolve.** Nenhuma família do lote usa `@angular/cdk` (`usesCdk: false` nas 12). Virtual scroll, drag-and-drop e teclado de árvore são reimplementados. O princípio 2 manda usar `cdk/scrolling` (table), `cdk/drag-drop` (pick-list, receita de order-list) e `cdk/tree` ou `TreeKeyManager` (tree, org-chart).
4. **Os modelos hierárquicos estão fragmentados.** Há `HierarchyNode{key}` (tree, tree-table), `TreeNode{id}` (tree-view) e `OrganizationNode{key, subtitle, image}` (org-chart). A proposta é um só `HierarchyNode<T>`, exportado por `@ciag/orchestra/tree` e reaproveitado por table (modo árvore), organization-chart e tree-select (lote 02).
5. **Rótulos padrão estão em inglês em todo o lote:** 'Data table', 'Select row', 'Tree', 'Options', 'Scrollable list', 'Move selected to target', '… of …', 'Collapse'/'Expand'. Todos devem vir de `provideOrcLabels` (princípio 6).
6. **A paginação está triplicada.** orc-table usa `orc-paginator`, tree-table e data-table têm paginadores próprios e data-view repassa 13 inputs ao paginador. Depois do redesenho sobra um caminho: `pageSize` liga o paginador embutido mínimo, e qualquer customização compõe `orc-paginator` por fora.
7. **Há um padrão a11y recorrente:** `tabindex=0` em todas as linhas ou nós (table.html:229, p2-data-table:134, org-chart.html:15) e controles que não são botões (`<th>` clicável na table). O padrão vira roving tabindex com `<button>` real para ordenação e expansão.
8. **Aliases de entry e seletor a remover:** `@ciag/orchestra/treetable`, `dataview`, `orderlist`, `picklist`, `organizationchart` e `scroller`, além de `orc-scroller`, `app-column`, `[appCellDef]` e `[appHeaderCellDef]`.
9. **Dependências entre lotes:**
   - `list` → `listbox` depende do lote 02 manter o listbox. Se não mantiver, o veredito vira REMOVE com o mesmo substituto.
   - `table` depende do `paginator` enxuto (lote 06) e do `checkbox` (lote 04).
   - A receita de `order-list` depende do destino do entry `drag-drop` (lote 10), que hoje é HTML5 nativo com alias `[pDraggable]`.
