# Tokens da Orchestra

Vocabulário **único** de design tokens da `@ciag/orchestra`, em variáveis CSS
`--orc-*`. É a API pública de estilo: componentes, docs e apps usam só estes
nomes. Os valores consolidam a identidade CIAg atual (azul elétrico `#1c6aed`,
Poppins, temas claro/escuro).

## Como usar

O pacote publica CSS pronto; **não é preciso Sass**.

```css
/* src/styles.css do app */
@import '@ciag/orchestra/styles.css'; /* tokens + temas + base dos componentes */
@import '@ciag/orchestra/reset.css'; /* opcional: reset global */
```

Ou no `angular.json`:

```json
"styles": [
  "@ciag/orchestra/styles.css",
  "src/styles.css"
]
```

- **`styles.css`**: tokens, temas claro/escuro e uma base mínima que só toca a
  árvore dos componentes (`box-sizing` em `.orc-*`). Não altera margens,
  fontes nem elementos do app.
- **`reset.css`** (opcional): reset global (`margin`/`padding` zerados,
  fonte e cores do `body`, scrollbar, `:focus-visible`, `::selection`).
  Importe só se o app não tiver reset próprio.
- **Fonte de ícones**: a lib não baixa fontes. O app carrega Material Symbols
  (por exemplo, no `index.html`):

  ```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
  ```

  Inclua `Outlined`/`Sharp` na mesma URL se usar `family` diferente de
  `rounded`. Poppins e JetBrains Mono também são responsabilidade do app.

### Camadas (`@layer`)

Tudo fica dentro da camada `orc`, na ordem:

```css
@layer orc.reset, orc.tokens, orc.base, orc.components;
```

CSS do app **sem camada** sempre vence a Orchestra. Se o app usa camadas,
declare a ordem antes dos imports, por exemplo `@layer orc, app;`.

### Tema

- Claro é o padrão.
- `prefers-color-scheme: dark` aplica o escuro quando a raiz não tem tema
  explícito.
- `data-theme="light" | "dark"` em qualquer elemento força o tema daquele
  subtree (pode aninhar). As classes `.theme-light`/`.theme-dark` continuam
  aceitas, mas o caminho documentado é `data-theme`.
- Para personalizar, sobrescreva o token sem camada no seletor do tema:

  ```css
  :root,
  [data-theme='light'] {
    --orc-primary: #0406ab;
  }
  ```

## Tokens públicos

### Cor semântica (variam com o tema)

| Token                      | Claro                                                                     | Escuro                                                                   | Uso                                                 |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| `--orc-surface`            | `#ffffff`                                                                 | `#1f1f1f`                                                                | Fundo da página e de componentes                    |
| `--orc-surface-raised`     | `#ffffff`                                                                 | `#1f1f1f`                                                                | Modais, cartões e painéis elevados                  |
| `--orc-surface-subtle`     | `#f9f9f9`                                                                 | `#2a2a2a`                                                                | Cabeçalhos de tabela, áreas de apoio                |
| `--orc-surface-muted`      | `#ededed`                                                                 | `#535353`                                                                | Hover neutro, seleção, trilhos                      |
| `--orc-surface-control`    | `#ffffff`                                                                 | `#1a1a1a`                                                                | Fundo de campos de formulário                       |
| `--orc-surface-inverse`    | `#141414`                                                                 | `#333333`                                                                | Tooltip e superfícies de contraste                  |
| `--orc-scrim`              | `rgb(15 23 42 / 0.56)`                                                    | `rgb(0 0 0 / 0.68)`                                                      | Véu atrás de modal/drawer                           |
| `--orc-text`               | `#141414`                                                                 | `#ffffff`                                                                | Texto principal                                     |
| `--orc-text-secondary`     | `#666666`                                                                 | `#f8f8f8`                                                                | Texto de apoio                                      |
| `--orc-text-muted`         | `#666666`                                                                 | `#888888`                                                                | Placeholder, legenda, desabilitado                  |
| `--orc-on-primary`         | `#ffffff`                                                                 | `#0f172a`                                                                | Texto sobre `--orc-primary`                         |
| `--orc-on-danger`          | `#ffffff`                                                                 | `#171717`                                                                | Texto sobre `--orc-danger`                          |
| `--orc-on-inverse`         | `#ffffff`                                                                 | `#ffffff`                                                                | Texto sobre `--orc-surface-inverse`                 |
| `--orc-border`             | `#d9d9d9`                                                                 | `#333333`                                                                | Borda padrão                                        |
| `--orc-border-strong`      | `#d9d9d9`                                                                 | `#424242`                                                                | Borda de controle/realce, scrollbar                 |
| `--orc-primary`            | `#1c6aed`                                                                 | `#60a5fa`                                                                | Cor de interação (azul elétrico CIAg)               |
| `--orc-primary-hover`      | `#1556be`                                                                 | `#93c5fd`                                                                | Hover/pressionado da primária                       |
| `--orc-primary-subtle`     | `#eff6ff`                                                                 | `#2a3b55`                                                                | Fundo suave de seleção/realce                       |
| `--orc-primary-shadow`     | `rgb(28 106 237 / 0.25)`                                                  | `rgb(0 0 0 / 0.5)`                                                       | Halo de foco/elevação na cor primária               |
| `--orc-neutral-fg`         | `#141414`                                                                 | `#ffffff`                                                                | Texto do tom neutro                                 |
| `--orc-neutral-bg`         | `#eceef2`                                                                 | `#3a3a3a`                                                                | Fundo do tom neutro                                 |
| `--orc-info`               | `#2b7fff`                                                                 | `#70a9ff`                                                                | Ícone/indicador de informação                       |
| `--orc-info-fg`            | `#1d4ed8`                                                                 | `#70a9ff`                                                                | Texto sobre `--orc-info-bg`                         |
| `--orc-info-bg`            | `#e1eaf6`                                                                 | `rgba(43, 127, 255, 0.15)`                                               | Fundo suave de informação                           |
| `--orc-success`            | `#006f4a`                                                                 | `#34d399`                                                                | Ícone/indicador de sucesso                          |
| `--orc-success-fg`         | `#006f4a`                                                                 | `#34d399`                                                                | Texto sobre `--orc-success-bg`                      |
| `--orc-success-bg`         | `#b8e7d7`                                                                 | `rgba(0, 111, 74, 0.2)`                                                  | Fundo suave de sucesso                              |
| `--orc-warning`            | `#fe9a00`                                                                 | `#fbbf24`                                                                | Ícone/indicador de aviso                            |
| `--orc-warning-fg`         | `#92400e`                                                                 | `#fbbf24`                                                                | Texto sobre `--orc-warning-bg`                      |
| `--orc-warning-bg`         | `#f6ecdd`                                                                 | `rgba(254, 154, 0, 0.15)`                                                | Fundo suave de aviso                                |
| `--orc-danger`             | `#c8192c`                                                                 | `#fb7185`                                                                | Ação destrutiva (preenchimento) e indicador de erro |
| `--orc-danger-fg`          | `#b91c1c`                                                                 | `#f87171`                                                                | Texto sobre `--orc-danger-bg`                       |
| `--orc-danger-bg`          | `#f6d7d8`                                                                 | `rgba(251, 44, 54, 0.15)`                                                | Fundo suave de erro                                 |
| `--orc-shadow-color`       | `rgb(15 23 42 / 0.14)`                                                    | `rgb(0 0 0 / 0.52)`                                                      | Cor base para sombras compostas                     |
| `--orc-shadow-sm`          | `0 1px 2px rgba(0, 0, 0, 0.06)`                                           | `0 1px 2px rgba(0, 0, 0, 0.3)`                                           | Sombra baixa                                        |
| `--orc-shadow-md`          | `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)`  | `0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)`   | Sombra média                                        |
| `--orc-shadow-lg`          | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` | `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)` | Sombra alta                                         |
| `--orc-skeleton-base`      | `#f1f5f9`                                                                 | `#2a2a2a`                                                                | Base do skeleton                                    |
| `--orc-skeleton-highlight` | `#e2e8f0`                                                                 | `#424242`                                                                | Brilho do skeleton                                  |

Derivados (redeclarados em cada fronteira de tema):

| Token                    | Valor                                                                  | Uso                                                                                            |
| ------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--orc-focus-ring-color` | `var(--orc-primary)`                                                   | Cor do anel de foco (`outline: var(--orc-focus-ring-width) solid var(--orc-focus-ring-color)`) |
| `--orc-shadow-overlay`   | `var(--orc-shadow-lg)`                                                 | Sombra de popups e overlays                                                                    |
| `--orc-neutral-border`   | `color-mix(in srgb, var(--orc-neutral-fg) 30%, var(--orc-neutral-bg))` | Borda do tom neutral                                                                           |
| `--orc-info-border`      | `color-mix(in srgb, var(--orc-info-fg) 55%, var(--orc-info-bg))`       | Borda do tom info                                                                              |
| `--orc-success-border`   | `color-mix(in srgb, var(--orc-success-fg) 55%, var(--orc-success-bg))` | Borda do tom success                                                                           |
| `--orc-warning-border`   | `color-mix(in srgb, var(--orc-warning-fg) 55%, var(--orc-warning-bg))` | Borda do tom warning                                                                           |
| `--orc-danger-border`    | `color-mix(in srgb, var(--orc-danger-fg) 55%, var(--orc-danger-bg))`   | Borda do tom danger                                                                            |

Cada tom de feedback (`info`, `success`, `warning`, `danger`) segue o mesmo modelo: `--orc-<tom>` (indicador/preenchimento), `--orc-<tom>-fg` (texto sobre o fundo suave), `--orc-<tom>-bg` (fundo suave) e `--orc-<tom>-border`. `neutral` tem `-fg`, `-bg` e `-border`.

### Independentes de tema

| Token                        | Valor                                                                                     | Grupo                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `--orc-color-azul-eletrico`  | `#1c6aed`                                                                                 | Primitivos da marca CIAg (não variam com o tema)  |
| `--orc-color-azul-royal`     | `#0406ab`                                                                                 | Primitivos da marca CIAg (não variam com o tema)  |
| `--orc-color-laranja`        | `#ff6a1c`                                                                                 | Primitivos da marca CIAg (não variam com o tema)  |
| `--orc-color-ciano`          | `#1cedb9`                                                                                 | Primitivos da marca CIAg (não variam com o tema)  |
| `--orc-color-roxo-lavender`  | `#6a1ced`                                                                                 | Primitivos da marca CIAg (não variam com o tema)  |
| `--orc-color-azul-navy`      | `#004b77`                                                                                 | Primitivos da marca CIAg (não variam com o tema)  |
| `--orc-chart-1`              | `var(--orc-color-azul-eletrico)`                                                          | Série categórica para gráficos, derivada da marca |
| `--orc-chart-2`              | `var(--orc-color-laranja)`                                                                | Série categórica para gráficos, derivada da marca |
| `--orc-chart-3`              | `var(--orc-color-ciano)`                                                                  | Série categórica para gráficos, derivada da marca |
| `--orc-chart-4`              | `var(--orc-color-roxo-lavender)`                                                          | Série categórica para gráficos, derivada da marca |
| `--orc-chart-5`              | `var(--orc-color-azul-royal)`                                                             | Série categórica para gráficos, derivada da marca |
| `--orc-chart-6`              | `var(--orc-color-azul-navy)`                                                              | Série categórica para gráficos, derivada da marca |
| `--orc-font-sans`            | `'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Tipografia                                        |
| `--orc-font-mono`            | `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`                                  | Tipografia                                        |
| `--orc-font-size-xs`         | `0.75rem`                                                                                 | Tipografia                                        |
| `--orc-font-size-sm`         | `0.875rem`                                                                                | Tipografia                                        |
| `--orc-font-size-md`         | `1rem`                                                                                    | Tipografia                                        |
| `--orc-font-size-lg`         | `1.125rem`                                                                                | Tipografia                                        |
| `--orc-font-size-xl`         | `1.25rem`                                                                                 | Tipografia                                        |
| `--orc-font-size-2xl`        | `1.5rem`                                                                                  | Tipografia                                        |
| `--orc-font-weight-regular`  | `400`                                                                                     | Tipografia                                        |
| `--orc-font-weight-medium`   | `500`                                                                                     | Tipografia                                        |
| `--orc-font-weight-semibold` | `600`                                                                                     | Tipografia                                        |
| `--orc-font-weight-bold`     | `700`                                                                                     | Tipografia                                        |
| `--orc-line-height-tight`    | `1.25`                                                                                    | Tipografia                                        |
| `--orc-line-height-base`     | `1.5`                                                                                     | Tipografia                                        |
| `--orc-line-height-relaxed`  | `1.6`                                                                                     | Tipografia                                        |
| `--orc-space-1`              | `0.25rem`                                                                                 | Espaçamento (escala de 4px)                       |
| `--orc-space-2`              | `0.5rem`                                                                                  | Espaçamento (escala de 4px)                       |
| `--orc-space-3`              | `0.75rem`                                                                                 | Espaçamento (escala de 4px)                       |
| `--orc-space-4`              | `1rem`                                                                                    | Espaçamento (escala de 4px)                       |
| `--orc-space-5`              | `1.25rem`                                                                                 | Espaçamento (escala de 4px)                       |
| `--orc-space-6`              | `1.5rem`                                                                                  | Espaçamento (escala de 4px)                       |
| `--orc-space-8`              | `2rem`                                                                                    | Espaçamento (escala de 4px)                       |
| `--orc-space-10`             | `2.5rem`                                                                                  | Espaçamento (escala de 4px)                       |
| `--orc-space-12`             | `3rem`                                                                                    | Espaçamento (escala de 4px)                       |
| `--orc-space-16`             | `4rem`                                                                                    | Espaçamento (escala de 4px)                       |
| `--orc-space-20`             | `5rem`                                                                                    | Espaçamento (escala de 4px)                       |
| `--orc-control-height-sm`    | `2.25rem`                                                                                 | Dimensões de controle e alvo mínimo de ação       |
| `--orc-control-height-md`    | `2.75rem`                                                                                 | Dimensões de controle e alvo mínimo de ação       |
| `--orc-control-height-lg`    | `3.25rem`                                                                                 | Dimensões de controle e alvo mínimo de ação       |
| `--orc-action-target-size`   | `1.5rem`                                                                                  | Dimensões de controle e alvo mínimo de ação       |
| `--orc-radius-sm`            | `0.375rem`                                                                                | Raio                                              |
| `--orc-radius-md`            | `0.625rem`                                                                                | Raio                                              |
| `--orc-radius-lg`            | `0.875rem`                                                                                | Raio                                              |
| `--orc-radius-xl`            | `1.25rem`                                                                                 | Raio                                              |
| `--orc-radius-full`          | `9999px`                                                                                  | Raio                                              |
| `--orc-focus-ring-width`     | `2px`                                                                                     | Foco (a cor é por tema: --orc-focus-ring-color)   |
| `--orc-focus-ring-offset`    | `2px`                                                                                     | Foco (a cor é por tema: --orc-focus-ring-color)   |
| `--orc-z-dropdown`           | `1000`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-sticky`             | `1020`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-fixed`              | `1030`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-modal-backdrop`     | `1040`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-modal`              | `1050`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-popover`            | `1060`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-tooltip`            | `1070`                                                                                    | Camadas de empilhamento                           |
| `--orc-z-toast`              | `1080`                                                                                    | Camadas de empilhamento                           |
| `--orc-duration-fast`        | `120ms`                                                                                   | Movimento                                         |
| `--orc-duration-base`        | `200ms`                                                                                   | Movimento                                         |
| `--orc-duration-slow`        | `300ms`                                                                                   | Movimento                                         |
| `--orc-easing-standard`      | `ease`                                                                                    | Movimento                                         |
| `--orc-transition-fast`      | `var(--orc-duration-fast) var(--orc-easing-standard)`                                     | Movimento                                         |
| `--orc-transition-base`      | `var(--orc-duration-base) var(--orc-easing-standard)`                                     | Movimento                                         |
| `--orc-transition-slow`      | `var(--orc-duration-slow) var(--orc-easing-standard)`                                     | Movimento                                         |
| `--orc-code-surface`         | `#0f172a`                                                                                 | Blocos de código: sempre escuros, nos dois temas  |
| `--orc-code-surface-raised`  | `#1e293b`                                                                                 | Blocos de código: sempre escuros, nos dois temas  |
| `--orc-code-border`          | `#334155`                                                                                 | Blocos de código: sempre escuros, nos dois temas  |
| `--orc-code-text`            | `#e2e8f0`                                                                                 | Blocos de código: sempre escuros, nos dois temas  |
| `--orc-code-muted`           | `#94a3b8`                                                                                 | Blocos de código: sempre escuros, nos dois temas  |
| `--orc-code-accent`          | `#4ade80`                                                                                 | Blocos de código: sempre escuros, nos dois temas  |

## Nomes antigos (`legacy-aliases`, internos)

Os nomes abaixo **não são API pública**. Eles existem só em `styles/_legacy-aliases.scss`, para que os componentes mantenham a aparência enquanto cada família migra na onda B da 22.4; o arquivo será removido antes da versão final. Apps devem trocar para o token novo.

Mudança de valor intencional: `--orc-interactive-shadow` (agora `--orc-primary-shadow`) passou de `rgb(37 99 235 / 0.25)` (azul do Tailwind) para `rgb(28 106 237 / 0.25)` (azul elétrico CIAg) no tema claro. Todos os demais nomes antigos computam exatamente o valor anterior nos temas claro, escuro e aninhados.

| Nome antigo                   | Use                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--bg`                        | `--orc-surface`                                                                                                                                  |
| `--bg-app`                    | `--orc-surface`                                                                                                                                  |
| `--bg-inverse`                | `--orc-text`                                                                                                                                     |
| `--bg-muted`                  | `--orc-surface-muted`                                                                                                                            |
| `--bg-subtle`                 | `--orc-surface-subtle`                                                                                                                           |
| `--border-default`            | `--orc-border`                                                                                                                                   |
| `--border-inverse`            | `--orc-text`                                                                                                                                     |
| `--border-strong`             | `--orc-border-strong`                                                                                                                            |
| `--color-accent`              | `--orc-text`                                                                                                                                     |
| `--color-accent-fg`           | sem equivalente; valor literal mantido (claro `#ffffff` / escuro `#141414`); migrar para `--orc-surface` ou `--orc-on-inverse`                   |
| `--color-accent-hover`        | sem equivalente; valor literal mantido (claro `#2a2a2a` / escuro `#f8f8f8`); migrar para `--orc-text-secondary`                                  |
| `--color-error`               | sem equivalente; valor literal mantido (claro `#fb2c36` / escuro `#f87171`); migrar para `--orc-danger` (indicador) ou `--orc-danger-fg` (texto) |
| `--color-info`                | `--orc-info`                                                                                                                                     |
| `--color-success`             | `--orc-success`                                                                                                                                  |
| `--color-warning`             | `--orc-warning`                                                                                                                                  |
| `--color-warning-text`        | sem equivalente; valor literal mantido (claro `#8b4c00` / escuro `#fbbf24`); migrar para `--orc-warning-fg`                                      |
| `--color-zinc-200`            | `--orc-surface-muted`                                                                                                                            |
| `--color-zinc-400`            | `--orc-border-strong`                                                                                                                            |
| `--fill-input`                | `--orc-surface-control`                                                                                                                          |
| `--fill-modal`                | `--orc-surface-raised`                                                                                                                           |
| `--font-mono`                 | `--orc-font-mono`                                                                                                                                |
| `--font-sans`                 | `--orc-font-sans`                                                                                                                                |
| `--highlight-cinzaclaro`      | `--orc-surface-muted`                                                                                                                            |
| `--orc-bg`                    | `--orc-surface`                                                                                                                                  |
| `--orc-border-default`        | `--orc-border`                                                                                                                                   |
| `--orc-control-surface`       | `--orc-surface-control`                                                                                                                          |
| `--orc-fill-input`            | `--orc-surface-control`                                                                                                                          |
| `--orc-fill-modal`            | `--orc-surface-raised`                                                                                                                           |
| `--orc-font-main`             | `--orc-text`                                                                                                                                     |
| `--orc-font-secondary`        | `--orc-text-secondary`                                                                                                                           |
| `--orc-highlight-cinza-claro` | `--orc-surface-muted`                                                                                                                            |
| `--orc-interactive`           | `--orc-primary`                                                                                                                                  |
| `--orc-interactive-hover`     | `--orc-primary-hover`                                                                                                                            |
| `--orc-interactive-shadow`    | `--orc-primary-shadow`                                                                                                                           |
| `--orc-interactive-soft`      | `--orc-primary-subtle`                                                                                                                           |
| `--orc-on-dark`               | `--orc-on-inverse`                                                                                                                               |
| `--orc-on-interactive`        | `--orc-on-primary`                                                                                                                               |
| `--orc-opposite-bw`           | sem equivalente; valor literal mantido (claro `#ffffff` / escuro `#141414`); migrar para `--orc-surface`                                         |
| `--orc-overlay-surface`       | `--orc-surface-inverse`                                                                                                                          |
| `--orc-overlay-text`          | `--orc-on-inverse`                                                                                                                               |
| `--orc-secondary-bg`          | `--orc-border-strong`                                                                                                                            |
| `--orc-status-danger-bg`      | `--orc-danger-bg`                                                                                                                                |
| `--orc-status-danger-border`  | `--orc-danger-border`                                                                                                                            |
| `--orc-status-danger-fg`      | `--orc-danger-fg`                                                                                                                                |
| `--orc-status-info-bg`        | `--orc-info-bg`                                                                                                                                  |
| `--orc-status-info-fg`        | `--orc-info-fg`                                                                                                                                  |
| `--orc-status-neutral-bg`     | `--orc-neutral-bg`                                                                                                                               |
| `--orc-status-neutral-fg`     | `--orc-neutral-fg`                                                                                                                               |
| `--orc-status-success-bg`     | `--orc-success-bg`                                                                                                                               |
| `--orc-status-success-border` | `--orc-success-border`                                                                                                                           |
| `--orc-status-success-fg`     | `--orc-success-fg`                                                                                                                               |
| `--orc-status-warning-bg`     | `--orc-warning-bg`                                                                                                                               |
| `--orc-status-warning-border` | `--orc-warning-border`                                                                                                                           |
| `--orc-status-warning-fg`     | `--orc-warning-fg`                                                                                                                               |
| `--orc-th`                    | `--orc-surface-subtle`                                                                                                                           |
| `--radius-full`               | `--orc-radius-full`                                                                                                                              |
| `--radius-lg`                 | `--orc-radius-lg`                                                                                                                                |
| `--radius-md`                 | `--orc-radius-md`                                                                                                                                |
| `--radius-sm`                 | `--orc-radius-sm`                                                                                                                                |
| `--radius-xl`                 | `--orc-radius-xl`                                                                                                                                |
| `--shadow-lg`                 | `--orc-shadow-lg`                                                                                                                                |
| `--shadow-md`                 | `--orc-shadow-md`                                                                                                                                |
| `--shadow-sm`                 | `--orc-shadow-sm`                                                                                                                                |
| `--skeleton-base`             | `--orc-skeleton-base`                                                                                                                            |
| `--skeleton-highlight`        | `--orc-skeleton-highlight`                                                                                                                       |
| `--space-1`                   | `--orc-space-1`                                                                                                                                  |
| `--space-10`                  | `--orc-space-10`                                                                                                                                 |
| `--space-12`                  | `--orc-space-12`                                                                                                                                 |
| `--space-16`                  | `--orc-space-16`                                                                                                                                 |
| `--space-2`                   | `--orc-space-2`                                                                                                                                  |
| `--space-20`                  | `--orc-space-20`                                                                                                                                 |
| `--space-3`                   | `--orc-space-3`                                                                                                                                  |
| `--space-4`                   | `--orc-space-4`                                                                                                                                  |
| `--space-5`                   | `--orc-space-5`                                                                                                                                  |
| `--space-6`                   | `--orc-space-6`                                                                                                                                  |
| `--space-8`                   | `--orc-space-8`                                                                                                                                  |
| `--status-danger-soft-bg`     | `--orc-danger-bg`                                                                                                                                |
| `--status-danger-soft-fg`     | `--orc-danger-fg`                                                                                                                                |
| `--status-info-soft-bg`       | `--orc-info-bg`                                                                                                                                  |
| `--status-info-soft-fg`       | `--orc-info-fg`                                                                                                                                  |
| `--status-neutral-soft-bg`    | `--orc-neutral-bg`                                                                                                                               |
| `--status-neutral-soft-fg`    | `--orc-neutral-fg`                                                                                                                               |
| `--status-success-soft-bg`    | `--orc-success-bg`                                                                                                                               |
| `--status-success-soft-fg`    | `--orc-success-fg`                                                                                                                               |
| `--status-warning-soft-bg`    | `--orc-warning-bg`                                                                                                                               |
| `--status-warning-soft-fg`    | `--orc-warning-fg`                                                                                                                               |
| `--text-inverse`              | `--orc-surface`                                                                                                                                  |
| `--text-muted`                | `--orc-text-muted`                                                                                                                               |
| `--text-primary`              | `--orc-text`                                                                                                                                     |
| `--text-secondary`            | `--orc-text-secondary`                                                                                                                           |
| `--text-tertiary`             | `--orc-text-muted`                                                                                                                               |
| `--transition-base`           | `--orc-transition-base`                                                                                                                          |
| `--transition-fast`           | `--orc-transition-fast`                                                                                                                          |
| `--transition-normal`         | `--orc-transition-base`                                                                                                                          |
| `--transition-slow`           | `--orc-transition-slow`                                                                                                                          |
| `--z-dropdown`                | `--orc-z-dropdown`                                                                                                                               |
| `--z-fixed`                   | `--orc-z-fixed`                                                                                                                                  |
| `--z-modal`                   | `--orc-z-modal`                                                                                                                                  |
| `--z-modal-backdrop`          | `--orc-z-modal-backdrop`                                                                                                                         |
| `--z-popover`                 | `--orc-z-popover`                                                                                                                                |
| `--z-sticky`                  | `--orc-z-sticky`                                                                                                                                 |
| `--z-toast`                   | `--orc-z-toast`                                                                                                                                  |
| `--z-tooltip`                 | `--orc-z-tooltip`                                                                                                                                |
