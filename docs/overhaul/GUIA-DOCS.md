# Guia: como documentar uma família na docs da Orchestra

Para quem cria ou atualiza a página de uma família na onda B (e depois). A referência completa é o **button**: `projects/docs/src/app/content/components/button/`.

## Regra de ouro

Cada família tem **um diretório**, a fonte única da página:

```
projects/docs/src/app/content/components/<id>/
├── <id>.doc.ts               # metadados + textos (pt-BR)
└── examples/
    ├── basic.example.ts      # um componente standalone por exemplo
    └── <slug>.example.ts
```

Você **só** cria, edita ou apaga arquivos dentro desse diretório. Não edite `catalog/index.ts`, `app.routes.ts` nem nada em `src/app/generated/`: catálogo, rotas e índice de exemplos são **gerados** por `npm run docs:generate-registry`. Assim, dez agentes trabalham em paralelo sem conflito em arquivo compartilhado (os gerados o integrador regenera).

A página é renderizada pelo template único `pages/component-page/`, sem nada específico de família: cabeçalho, quando usar/não usar, exemplos (prévia + código com Copiar), anatomia, API gerada, acessibilidade, migração e o selo "Experimental".

## Passo a passo

1. **Crie o diretório** `content/components/<id>/`, com `<id>` igual ao nome da família em DECISOES.md §1 (ex.: `date-picker`).
2. **Escreva `<id>.doc.ts`** copiando `button/button.doc.ts` e trocando o conteúdo. `DOC` precisa ser um **literal puro**: strings, números, booleanos, arrays e objetos, sem variáveis, spreads, chamadas ou templates com `${}`, porque o gerador lê o arquivo de forma estática.
3. **Escreva os exemplos** em `examples/<slug>.example.ts` (veja as regras abaixo) e liste as slugs em `DOC.examples`, na ordem de exibição.
4. **Apague o formato antigo da família**, se existir:
   - `src/app/catalog/<id>.catalog.ts`;
   - `src/app/pages/components/<id>/` (página escrita à mão);
   - `src/app/pages/components/component-doc/examples/<id>-example.component.ts` (exemplo da página genérica);
   - famílias fundidas (DECISOES §1): apague também os arquivos antigos da família de origem e leve o conteúdo útil para a página do alvo.
5. **Rode o gerador:** `npm run docs:generate-registry`.
6. **Verifique** com os comandos da seção [Verificação](#verificação).

O gerador falha com mensagem em pt-BR e o caminho do arquivo quando falta algo, e também quando sobra arquivo antigo de uma família que já tem `content/`.

## `<id>.doc.ts`: campos

| Campo         | Obrigatório | Regra                                                                                                                                    |
| ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | sim         | Igual ao nome do diretório (kebab-case).                                                                                                 |
| `name`        | sim         | Nome da família, sem tradução: `Date Picker`.                                                                                            |
| `group`       | sim         | `actions`, `selection`, `input`, `overlays`, `navigation`, `layout`, `data`, `display` ou `utilities` (grupo da família em DECISOES §1). |
| `status`      | sim         | `'experimental'` para as 12 experimentais de DECISOES §1 e `'stable'` para as demais. O gerador confere.                                 |
| `icon`        | sim         | Nome Material Symbols do card do catálogo.                                                                                               |
| `packagePath` | sim         | Entry point público: `@ciag/orchestra/<id>`. `verify:docs-integrity` confere se ele existe no inventário.                                |
| `tags`        | sim         | Termos de busca em pt-BR e inglês.                                                                                                       |
| `examples`    | sim         | Slugs em ordem; cada uma precisa de `examples/<slug>.example.ts`.                                                                        |
| `i18n`        | sim         | `{ 'pt-BR': { ... } }`, com os campos da tabela abaixo.                                                                                  |

Campos de `i18n['pt-BR']`, todos obrigatórios:

| Campo           | Formato                              | Dica                                                                                                                                                                                                      |
| --------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`   | string                               | Uma ou duas frases: o que é e para que serve. Também vira a descrição do card e da meta tag.                                                                                                              |
| `whenToUse`     | string[] (≥ 1)                       | Situações concretas, de preferência com a prop que resolve cada uma.                                                                                                                                      |
| `whenNotToUse`  | `{ text, alternative? }[]` (≥ 1)     | `alternative` é o **id** de outra família do registro e vira link "Use X". O gerador valida o id.                                                                                                         |
| `anatomy`       | `{ part, description }[]` (≥ 1)      | `part` como aparece no código: seletor, slot (`[modal-footer]`), `ng-template`, serviço.                                                                                                                  |
| `accessibility` | `{ keyboard, aria, notes? }`         | `keyboard`: `{ keys, action }[]` (pode ser vazio). Use `+` para combinação e `/` para alternativas: `Shift + Tab`, `Enter / Espaço`. `aria`: o que o componente aplica. `notes`: o que fica com quem usa. |
| `migration`     | `{ before, after, note? }[]` (≥ 1)   | Da 22.3 para a 22.4. Cite a regra (`DECISOES §3.5`) ou a fusão (`DECISOES §1`).                                                                                                                           |
| `examples`      | `{ [slug]: { title, description } }` | Um item por slug de `DOC.examples`, nem mais nem menos.                                                                                                                                                   |

Em todos os textos, trechos entre crases viram `<code>`. Não há HTML nem markdown além disso.

**Não anuncie o que não existe.** A migração descreve o que DECISOES.md decide e o que a avaliação do lote (`docs/overhaul/evaluations/lote-NN.json`) detalha. A descrição, os exemplos e a anatomia descrevem a API **implementada** na sua branch.

## Exemplos

- Um arquivo por exemplo, `examples/<slug>.example.ts`, com slug em kebab-case.
- O arquivo exporta **exatamente um** `@Component` chamado `<Família><Slug>ExampleComponent` (`button` + `icons` → `ButtonIconsExampleComponent`). Componentes auxiliares no mesmo arquivo ficam sem `export` (veja `modal/examples/service.example.ts`).
- Seletor `doc-<id>-<slug>-example`.
- O **código exibido na página é o próprio arquivo**: escreva-o como código que alguém copiaria para o app. Use imports `@ciag/orchestra/<família>`, Signals, `ChangeDetectionStrategy.OnPush` e textos em pt-BR, sem estilos da docs e sem dados mágicos.
- Estilos só de layout, via `styles` inline com tokens `--orc-*`.
- Comece por `basic` (o uso mínimo) e cubra variantes, tamanhos, estados, formulários e composição, conforme a família.

### Como o código-fonte chega à página

O gerador lê cada `*.example.ts` e embute o texto do arquivo, como string, no módulo gerado `generated/docs-registry/pages/<id>.page.generated.ts`, ao lado do import do componente. Essa abordagem foi escolhida em vez de `import x from './a.ts?raw'` ou `with { loader: 'text' }` do `@angular/build` por três motivos:

- funciona sem configuração extra no builder e no Karma;
- o TypeScript continua compilando o exemplo como código, sem conflito de tipos;
- `--check` falha se o arquivo mudar sem regenerar, então a prévia e o código exibido nunca divergem.

O custo é rodar o gerador depois de editar um exemplo.

## Arquivos gerados (não edite)

Todos ficam em `projects/docs/src/app/generated/docs-registry/` e começam com `// GERADO — não edite`:

| Arquivo                        | Conteúdo                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `catalog.generated.ts`         | `CATALOG_ENTRIES`: famílias do formato novo mais as entradas legacy de `catalog/`, com `group` e `source`.        |
| `routes.generated.ts`          | `COMPONENT_ROUTES`: rotas lazy do template único (com resolvers de página e API) e das páginas antigas restantes. |
| `pages.generated.ts`           | `COMPONENT_PAGE_LOADERS`: loader de cada família do formato novo (usado pelos testes).                            |
| `pages/<id>.page.generated.ts` | `PAGE`: o `DOC` e os exemplos, com o componente e o código-fonte embutido.                                        |
| `legacy-examples.generated.ts` | Exemplos da página genérica antiga (some quando a última família migrar).                                         |

Na transição, as famílias sem `content/` continuam funcionando. As que têm página escrita à mão ganham rota gerada; as demais caem em `components/:componentId`, a página genérica antiga.

## Traduções (futuro)

- Textos de cada família: acrescente `i18n['en-US']` (ou outro locale) com o mesmo formato de `pt-BR` e o locale em `DocsLocale` (`models/component-page.model.ts`).
- Textos da interface da docs: `src/app/i18n/docs-ui.ts`.
- Páginas institucionais: `pages/getting-started/getting-started.content.ts`.

Metadados e exemplos não mudam por idioma.

## Verificação

Rode antes de commitar:

```bash
npm run docs:generate-registry        # regenera catálogo, rotas e exemplos
npm run verify:docs-registry          # falha se algo estiver inválido ou desatualizado
node tools/quality/inventory.mjs      # o inventário lista os arquivos da docs
npm run verify:docs-coverage          # toda família inventariada tem página
npm run verify:docs-integrity         # packagePath existe; registro válido
npm run docs:generate-api && npm run docs:generate-agent-reference && npm run docs:generate-sitemap
npm run build:docs
npx eslint projects/docs/src/app/content/components/<id>
npx prettier --check projects/docs/src/app/content/components/<id>
CHROME_BIN=/usr/bin/google-chrome npx ng test docs --watch=false --browsers=ChromeHeadless --include='**/component-page/*.spec.ts'
```

O spec `component-page.component.spec.ts` percorre **todas** as famílias de `content/` e confere `<h1>`, as seções, a prévia ao vivo e se o código exibido é igual ao arquivo do exemplo. Por fim, abra `/components/<id>` (`npx ng serve docs`) nos temas claro e escuro.

## Checklist da página

- [ ] `DOC.status` bate com DECISOES §1 (experimental ou estável).
- [ ] `description` em uma ou duas frases, sem jargão de PrimeNG.
- [ ] Cada item de `whenNotToUse` aponta uma alternativa quando ela existe.
- [ ] A anatomia cobre seletor, slots e `ng-template`s públicos.
- [ ] A acessibilidade lista todas as teclas tratadas pelo componente e os atributos ARIA aplicados.
- [ ] A migração cobre cada input, output, seletor ou entry point que saiu ou mudou de nome, além das fusões em que a família é alvo.
- [ ] Os exemplos usam só API pública e textos em pt-BR, e cada um funciona isolado.
- [ ] Os arquivos antigos da família foram apagados e o gerador rodou.
