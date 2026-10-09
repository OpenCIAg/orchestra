# Lote 06 — Navegação: resumo da avaliação

Fonte: `docs/overhaul/evaluations/lote-06.json`. Regras em `docs/overhaul/README.md`.

**Contagem:** 8 KEEP-REDESIGN · 5 MERGE · 2 REMOVE · 0 KEEP · 0 EXPERIMENTAL (15 famílias)

| id           | veredito      | alvo       | motivo em uma linha                                                                                                                                        |
| ------------ | ------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| menu         | KEEP-REDESIGN | —          | Vira o primitivo único de menu sobre `@angular/cdk/menu`, montado por composição. Hoje vive no p2, o popup não tem âncora e há `model`+`items` duplicados  |
| menubar      | MERGE         | menu       | Tem modelo de item próprio (`MenubarItem.children`, 1 nível) e teclado manual. Vira `orc-menubar` (CdkMenuBar) dentro do entry `menu`                      |
| tiered-menu  | MERGE         | menu       | É o menu com submenus limitado a 1 nível, e o `orc-menu` já é recursivo. Tem 5 inputs no-op                                                                |
| context-menu | MERGE         | menu       | Tem um 4º modelo de item, sem submenus nem comando, e `position:fixed` manual. Vira o invólucro `orc-context-menu` (CdkContextMenuTrigger) no entry `menu` |
| mega-menu    | REMOVE        | —          | Não abre painel nenhum: é uma grade estática com `role=menubar` inválido. O substituto é orc-menubar + orc-menu-group, ou o app                            |
| panel-menu   | MERGE         | navigation | Navegação lateral recolhível modelada como `role=tree`, 1 nível, outputs duplicados. Vira `orc-navigation-group`                                           |
| tab-menu     | MERGE         | tabs       | Abas-link de rota. Vira `orc-tab-nav`/`orc-tab-link` (nav + `aria-current`), sem tablist falsa                                                             |
| command-menu | KEEP-REDESIGN | —          | A paleta de comandos tem valor. Sai do p2, deixa de usar `role=dialog` falso, ganha grupos, KeyManager do CDK e modo diálogo; renomeia para `orc-command`  |
| dock         | REMOVE        | —          | Imitação do dock do macOS com `position:fixed` global e só paridade PrimeNG. O substituto é `orc-toolbar` posicionado pelo app                             |
| navigation   | KEEP-REDESIGN | —          | Sidebar é núcleo. Falta routerLink, `children` é ignorado, o drawer móvel não prende foco e os rótulos estão em inglês. Passa a se chamar `orc-navigation` |
| breadcrumb   | KEEP-REDESIGN | —          | Hoje há 2 modos divergentes; no de projeção faltam separadores e o conteúdo se perde. Ícone só funciona para 'home'. Fica só a composição                  |
| tabs         | KEEP-REDESIGN | —          | `selectedIndex` e `value` competem (bug: `value` recebe o índice), outputs duplicados, só 3 ícones em SVG, rótulos em inglês                               |
| stepper      | KEEP-REDESIGN | —          | Models e inputs gêmeos mais o seletor alias `orc-steps`. No modo readonly todos os botões ficam `disabled`, inclusive a etapa atual                        |
| paginator    | KEEP-REDESIGN | —          | Tem 44 inputs, 5 jeitos de definir a página, 5 no-ops e rótulos EN/PT embutidos. Mantém os nomes que o consumidor usa (migração zero)                      |
| toolbar      | KEEP-REDESIGN | —          | Útil e única, mas pré-signals (`@ContentChildren`, `@HostListener`, rxjs). Troca para `contentChildren()` + FocusKeyManager                                |

## Observações transversais

1. **Cinco modelos de item paralelos para "lista de ações".** São eles: `PrimeMenuItem` (`internal/menu-item.ts:7`, usado por menu/tiered/panel/mega), `ContextMenuItem` (`context-menu.component.ts:28`), `MenubarItem` (`menubar.component.ts:20`), `CommandItem` (`p2-command-components.ts:11`) e `DockItem` (`dock.component.ts:15`). Fora do lote há mais dois: `DropdownItem` (`dropdown/dropdown.types.ts:1`, lote 02) e o menu interno do split-button (lote 01). Proposta: um primitivo `orc-menu` sobre `@angular/cdk/menu` montado **por composição** (`orc-menu-item`, `orc-menu-group`, `orc-menu-separator`, `[submenu]=TemplateRef`) e três invólucros de abertura: `orc-menu-trigger` (dropdown), `orc-context-menu` (clique direito) e `orc-menubar`. Com isso `PrimeMenuItem` sai do `internal`, o teclado e o dismiss manuais (`internal/menu-keyboard.ts`, `listenForOutsideInteraction`) deixam de ser necessários para menus, e o CDK ainda entrega o typeahead, que hoje não existe em nenhum menu.
2. **Tensão com a decisão 9 ("tudo é componente").** O CdkMenuTrigger precisa ficar no elemento focável. Proposta: `orc-menu-trigger` como componente invólucro que aplica o trigger ao primeiro filho focável projetado (o mesmo valeria para `orcToolbarItem` sobre `orc-button`). Se isso não for viável sem hack, a alternativa é um input `menu` no próprio `orc-button` (lote 01). O Tesla decide.
3. **`menu` e `command-menu` ainda puxam o monólito p2.** Os dois entries só reexportam `@ciag/orchestra/p2` (`menu/index.ts:1`, `command-menu/index.ts:1`), então o chunk de 148–157 B gzip medido esconde a dependência do p2 (~57 KB gzip). As duas implementações precisam sair do p2 no RC.
4. **Rótulos padrão em inglês** em navigation (`'Primary navigation'`, `'Close navigation'`), tabs (`'Previous tabs'`, `'Next tabs'`, `'Close '`), stepper (`'Steps'`), breadcrumb (`'Expand breadcrumb'`), dock, tab-menu (`'Tab menu'`) e command-menu (`'Command menu'`, `'Search commands'`). O paginator tem uma tabela PT/EN própria escolhida por `locale`. Tudo isso deve vir de `provideOrcLabels`, que ainda não existe no código.
5. **Ícones como SVG embutido em vez de Material Symbols (decisão 5).** Tabs só desenham `home`/`settings`/`warning` (`tab-group.component.html:88-130`) e breadcrumb só `home`. Menus e dock escrevem o nome do ícone num `<span>` cru. Tudo passa a usar `orc-icon`.
6. **`role` de composite em `<nav>`.** Menu, tiered-menu e menubar usam `<nav role="menu|menubar">`, e o dock usa `<nav role="toolbar">`. Isso anula o landmark e mistura navegação com ações. Regra para o RC: `nav` só para navegação (navigation, breadcrumb, tab-nav, paginator); `role=menu` só no painel do orc-menu.
7. **Aliases a remover neste lote:** os entries `contextmenu`, `megamenu`, `panelmenu`, `tabmenu`, `tieredmenu`, `steps` e `tabview`, e os seletores `orc-steps` e `orc-pagination`. **`pagination` (lote 10) é alias puro de `paginator`** (`pagination/index.ts:1-2` reexporta `PaginatorComponent as PaginationComponent`) e deve sair junto com o seletor `orc-pagination` (`paginator.component.ts:45`).
8. **Padrão recorrente de API PrimeNG** em quase todas as famílias: `items`+`model`, `style`/`styleClass`, `autoZIndex`/`baseZIndex`, output canônico duplicado por `on*` (`itemSelect`+`onItemClick`, `tabChange`+`onChange`, `stepChange`+`onChange`, `pageChange`+`onPageChange`, `itemClick`+`onItemClick`) e classes `p-*`/`data-pc-name` no DOM (tabs, breadcrumb, stepper, menu).

## Impacto no gestao-de-projetos

- **orc-paginator (3 usos):** migração zero. Todos os inputs e o `pageChange` usados continuam com o mesmo nome.
- **orc-tab-group/orc-tab (1 uso, `hourlog-warning.component.html:3`):** trocar `[selectedIndex]` por `[value]`.
- **orc-context-menu (1 uso, `project-files.component.html:1`):** trocar o import `@ciag/orchestra/context-menu` por `@ciag/orchestra/menu` e os 4 itens `{label, value, danger}` por `<orc-menu-item>` num template passado em `[menu]`. O despacho por `value` vira `(triggered)` em cada item.

## Ordem sugerida de execução

1. Infra: `provideOrcLabels` e o primitivo `orc-menu` em CDK Menu (pré-requisito de menubar, context-menu, dropdown do lote 02 e split-button do lote 01).
2. Remover dock, mega-menu, tiered-menu e os aliases.
3. tabs (+ tab-nav), paginator, breadcrumb, stepper, toolbar.
4. navigation (+ grupos vindos de panel-menu) e command.
