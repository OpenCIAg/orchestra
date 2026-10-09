/**
 * Contrato da FONTE ÚNICA de documentação por família:
 * `src/app/content/components/<id>/<id>.doc.ts` exporta `DOC` com este
 * formato, e `examples/<slug>.example.ts` exporta um componente standalone
 * por exemplo. O gerador (`tools/docs/generate-registry.mjs`) lê esses
 * arquivos de forma estática (AST): por isso `DOC` deve ser um literal puro
 * (strings, números, booleanos, arrays e objetos — sem variáveis, spreads ou
 * chamadas).
 *
 * Textos ficam isolados por locale em `i18n['pt-BR']`; uma tradução futura
 * acrescenta outra chave (ex.: `'en-US'`) com o mesmo formato, sem tocar
 * nos metadados nem nos exemplos.
 */
import type { Type } from '@angular/core';

/** Locales suportados pela docs. `pt-BR` é o padrão e é obrigatório. */
export type DocsLocale = 'pt-BR';

/** Grupos da navegação (DECISOES.md §1). O rótulo traduzido vive em `i18n/`. */
export type FamilyGroup =
  | 'actions'
  | 'selection'
  | 'input'
  | 'overlays'
  | 'navigation'
  | 'layout'
  | 'data'
  | 'display'
  | 'utilities';

/** Ordem dos grupos na navegação (espelha GROUP_ORDER do gerador). */
export const FAMILY_GROUP_ORDER: readonly FamilyGroup[] = [
  'actions',
  'selection',
  'input',
  'overlays',
  'navigation',
  'layout',
  'data',
  'display',
  'utilities',
];

export type FamilyStatus = 'stable' | 'experimental';

/** Item de "Quando não usar": o texto e, de preferência, a família alternativa. */
export interface DocAvoidCase {
  readonly text: string;
  /** Id de outra família documentada (vira link). */
  readonly alternative?: string;
}

/** Uma parte da anatomia: seletor, slot ou elemento interno. */
export interface DocAnatomyPart {
  /** Nome da parte como aparece no código: `orc-button`, `[iconLeft]`… */
  readonly part: string;
  readonly description: string;
}

export interface DocKeyboardRow {
  /** Teclas separadas por ` + ` para combinação ou ` / ` para alternativas. */
  readonly keys: string;
  readonly action: string;
}

export interface DocAccessibility {
  readonly keyboard: readonly DocKeyboardRow[];
  /** Papéis, estados e propriedades ARIA que o componente aplica. */
  readonly aria: readonly string[];
  /** Responsabilidades de quem consome (nome acessível, rótulos…). */
  readonly notes?: readonly string[];
}

/** Uma mudança da 22.3 para a 22.4 (DECISOES.md + avaliação do lote). */
export interface DocMigrationNote {
  readonly before: string;
  readonly after: string;
  readonly note?: string;
}

export interface DocExampleText {
  readonly title: string;
  readonly description: string;
}

/**
 * Todo texto exibido de uma página. Strings aceitam `código` entre crases,
 * renderizado como `<code>` (sem HTML, sem innerHTML).
 */
export interface ComponentDocContent {
  readonly description: string;
  readonly whenToUse: readonly string[];
  readonly whenNotToUse: readonly DocAvoidCase[];
  readonly anatomy: readonly DocAnatomyPart[];
  readonly accessibility: DocAccessibility;
  readonly migration: readonly DocMigrationNote[];
  /** Título e descrição de cada exemplo, pela slug do arquivo. */
  readonly examples: Readonly<Record<string, DocExampleText>>;
}

/** Formato de `DOC` em `<id>.doc.ts`. */
export interface ComponentDocSource {
  readonly id: string;
  /** Nome da família (não traduzido): `Button`, `Select`… */
  readonly name: string;
  readonly group: FamilyGroup;
  readonly status: FamilyStatus;
  /** Ícone Material Symbols usado no catálogo. */
  readonly icon: string;
  /** Entry point público, ex.: `@ciag/orchestra/button`. */
  readonly packagePath: string;
  /** Termos de busca (pt-BR e inglês). */
  readonly tags: readonly string[];
  /** Slugs dos exemplos em ordem de exibição (`examples/<slug>.example.ts`). */
  readonly examples: readonly string[];
  readonly i18n: { readonly 'pt-BR': ComponentDocContent } & Partial<
    Record<DocsLocale, ComponentDocContent>
  >;
}

/** Exemplo resolvido pelo gerador: componente + código-fonte embutido. */
export interface ComponentPageExample {
  readonly slug: string;
  /** Caminho do arquivo relativo ao diretório da família. */
  readonly file: string;
  readonly component: Type<unknown>;
  /** Conteúdo exato do arquivo `examples/<slug>.example.ts`. */
  readonly source: string;
}

/** Módulo por família gerado em `generated/docs-registry/pages/`. */
export interface ComponentPageData {
  readonly doc: ComponentDocSource;
  readonly examples: readonly ComponentPageExample[];
}

export type ComponentPageLoader = () => Promise<ComponentPageData>;
