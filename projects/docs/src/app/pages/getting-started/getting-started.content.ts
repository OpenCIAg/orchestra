/**
 * Textos da página "Primeiros passos", isolados por locale (mesmo padrão de
 * `DOC.i18n` nas páginas de componentes). Itens com `since: '22.4'` só
 * descrevem o que está decidido em docs/overhaul/DECISOES.md.
 */
import type { DocsLocale } from '../../models/component-page.model';

export interface GuideBlock {
  /** Parágrafo; trechos entre crases viram `<code>`. */
  readonly text?: string;
  /** Lista de itens. */
  readonly items?: readonly string[];
  /** Bloco de código com o nome de arquivo exibido. */
  readonly code?: { readonly file: string; readonly source: string };
}

export interface GuideSection {
  readonly id: string;
  readonly title: string;
  /** Marca "na 22.4" para o que muda nesta versão. */
  readonly since?: '22.4';
  readonly blocks: readonly GuideBlock[];
}

export interface GuidePrinciple {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

export interface GettingStartedContent {
  readonly title: string;
  readonly lead: string;
  readonly sinceLabel: string;
  readonly onThisPage: string;
  readonly principlesTitle: string;
  readonly principles: readonly GuidePrinciple[];
  readonly sections: readonly GuideSection[];
}

const PT_BR: GettingStartedContent = {
  title: 'Primeiros passos',
  lead: 'A Orchestra é a biblioteca de componentes Angular da CIAg: componentes acessíveis, com textos em pt-BR, construídos com Signals e estilizados por tokens CSS. Esta página mostra como instalar, configurar os rótulos e o que guia as decisões da biblioteca.',
  sinceLabel: 'na 22.4',
  onThisPage: 'Nesta página',
  principlesTitle: 'Princípios',
  principles: [
    {
      icon: 'palette',
      title: 'Identidade',
      text: 'A identidade visual da CIAg (cores, tipografia e tokens) é a base de todos os componentes. A biblioteca refina essa identidade; não é uma ponte para outra biblioteca de UI.',
    },
    {
      icon: 'extension',
      title: 'Composição',
      text: 'Customização por slots (`ng-content` e `ng-template`) e por tokens CSS `--orc-*`, em vez de dezenas de inputs de configuração. Há uma forma de fazer cada coisa: sem aliases de seletor, entry point ou output.',
    },
    {
      icon: 'code',
      title: 'Angular idiomático',
      text: '`input()`, `model()` e `output()` com Signals, `OnPush` e compatibilidade com zoneless. Controles de formulário funcionam com Reactive Forms, `ngModel` e `[(value)]`; overlays, foco e listas usam o `@angular/cdk`.',
    },
    {
      icon: 'speed',
      title: 'Performance',
      text: 'Um entry point por família (`@ciag/orchestra/<família>`): o app só carrega o que importa. Sem CSS global vazando e sem dependências novas sem justificativa.',
    },
  ],
  sections: [
    {
      id: 'instalacao',
      title: 'Instalação',
      blocks: [
        {
          text: 'A Orchestra é publicada como pacote npm e requer Angular 22 e o `@angular/cdk` da mesma versão.',
        },
        {
          code: {
            file: 'terminal',
            source: 'npm install @ciag/orchestra @angular/cdk',
          },
        },
      ],
    },
    {
      id: 'estilos',
      title: 'Estilos em CSS puro',
      since: '22.4',
      blocks: [
        {
          text: 'Os estilos são distribuídos como CSS puro, com tokens em variáveis CSS e `@layer`. O app não precisa de Sass: importe o arquivo uma vez no CSS global, antes dos estilos do app.',
        },
        {
          code: {
            file: 'src/styles.css',
            source:
              "@import '@ciag/orchestra/styles.css'; /* tokens, temas e base */\n@import '@ciag/orchestra/reset.css'; /* opcional: reset global */",
          },
        },
        {
          text: 'Para mudar a aparência, sobrescreva tokens `--orc-*` no seu CSS em vez de sobrescrever classes internas dos componentes.',
        },
        {
          text: 'O tema escuro é ativado com `data-theme="dark"` no elemento `<html>` (`data-theme="light"` força o claro). Sem o atributo, a biblioteca segue a preferência do sistema.',
        },
      ],
    },
    {
      id: 'icones',
      title: 'Ícones',
      blocks: [
        {
          text: 'O `orc-icon` usa a fonte Material Symbols, e a biblioteca não baixa fontes: o app carrega a fonte. Com o Google Fonts, adicione o link no `index.html` (ou hospede a fonte junto com o app). Se o app usar só a família padrão (`rounded`), basta carregar essa.',
        },
        {
          code: {
            file: 'src/index.html',
            source:
              '<link\n  rel="stylesheet"\n  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"\n/>',
          },
        },
      ],
    },
    {
      id: 'uso',
      title: 'Usando um componente',
      blocks: [
        {
          text: 'Os componentes são standalone. Importe cada um do entry point da sua família e use o seletor `orc-*` no template.',
        },
        {
          code: {
            file: 'salvar.component.ts',
            source:
              "import { Component } from '@angular/core';\nimport { ButtonComponent } from '@ciag/orchestra/button';\n\n@Component({\n  selector: 'app-salvar',\n  imports: [ButtonComponent],\n  template: `<orc-button (click)=\"salvar()\">Salvar</orc-button>`,\n})\nexport class SalvarComponent {\n  salvar(): void {\n    // ...\n  }\n}",
          },
        },
      ],
    },
    {
      id: 'rotulos',
      title: 'Rótulos em pt-BR',
      since: '22.4',
      blocks: [
        {
          text: 'Todo texto padrão dos componentes ("Fechar", "Carregando", "Nenhum resultado") vem de um provider de rótulos com padrão pt-BR. Para trocar algum texto no app inteiro, use `provideOrcLabels` de `@ciag/orchestra/core`; quando fizer sentido, um input da instância também sobrescreve o rótulo.',
        },
        {
          code: {
            file: 'src/app/app.config.ts',
            source:
              "import { ApplicationConfig } from '@angular/core';\nimport { provideOrcLabels } from '@ciag/orchestra/core';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [\n    // Só as chaves que você quer mudar; o resto continua em pt-BR.\n    provideOrcLabels({\n      common: { close: 'Sair' },\n      table: { empty: 'Nenhum projeto cadastrado' },\n    }),\n  ],\n};",
          },
        },
        {
          text: 'Os rótulos são agrupados por família (`common`, `dialog`, `select`, `table`…) e tipados por `OrcLabels`, então o editor completa as chaves. `provideOrcLabels` também vale no `providers` de um componente (só aquela subárvore) e aceita um signal ou uma função de fábrica, para trocar o idioma em tempo de execução.',
        },
      ],
    },
    {
      id: 'novidades',
      title: 'O que muda na 22.4',
      since: '22.4',
      blocks: [
        {
          text: 'A 22.4.0-rc.0 tem breaking changes. As principais regras novas, válidas para todas as famílias:',
        },
        {
          items: [
            'Um seletor `orc-<família>` por componente e um entry point `@ciag/orchestra/<família>` por família, sem aliases.',
            'Estado de duas vias com `model()` e nomes padronizados: `value`, `checked`, `open`, `expanded`.',
            'Outputs sem prefixo `on` (`opened`, `closed`, `valueChange`).',
            'Saem os inputs de paridade com PrimeNG: `style`, `styleClass`, `appendTo`, `*TransitionOptions`, `tooltip*`, `fluid` e inputs com nome de atributo HTML global (`title`, `role`, `id`, `tabindex`).',
            'Tamanho sempre `sm | md | lg`; severidade de feedback é `tone`, e `severity` sai.',
            '58 famílias formam o núcleo; 12 ficam como experimentais (marcadas na navegação). As famílias duplicadas foram fundidas: cada página de componente traz a tabela de migração.',
          ],
        },
      ],
    },
  ],
};

const CONTENT: Readonly<Record<DocsLocale, GettingStartedContent>> = {
  'pt-BR': PT_BR,
};

export function gettingStartedContent(
  locale: DocsLocale,
): GettingStartedContent {
  return CONTENT[locale];
}
