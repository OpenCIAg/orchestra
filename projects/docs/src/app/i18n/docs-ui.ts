/**
 * Strings da interface da docs (o "chrome" das páginas), isoladas por locale.
 * O conteúdo de cada família fica em `content/components/<id>/<id>.doc.ts`,
 * em `DOC.i18n['pt-BR']`. Para traduzir a docs no futuro: acrescente um
 * objeto com o mesmo formato (`DocsUiStrings`) aqui e o locale em
 * `DocsLocale` (models/component-page.model.ts).
 */
import type { DocsLocale, FamilyGroup } from '../models/component-page.model';

export interface DocsUiStrings {
  readonly groups: Readonly<Record<FamilyGroup, string>>;
  readonly status: Readonly<Record<string, string>>;
  readonly page: {
    readonly breadcrumbRoot: string;
    readonly experimentalNotice: string;
    readonly sections: {
      readonly usage: string;
      readonly whenToUse: string;
      readonly whenNotToUse: string;
      readonly examples: string;
      readonly anatomy: string;
      readonly api: string;
      readonly accessibility: string;
      readonly migration: string;
    };
    readonly onThisPage: string;
    readonly preview: string;
    readonly code: string;
    readonly copy: string;
    readonly copied: string;
    readonly copyImport: string;
    readonly useInstead: string;
    readonly keyboard: string;
    readonly keys: string;
    readonly action: string;
    readonly aria: string;
    readonly consumerNotes: string;
    readonly noKeyboard: string;
    readonly before: string;
    readonly after: string;
    readonly note: string;
    readonly migrationIntro: string;
    readonly apiIntro: string;
    readonly apiEmpty: string;
    readonly apiName: string;
    readonly apiType: string;
    readonly apiDefault: string;
    readonly apiKinds: Readonly<Record<'input' | 'model' | 'output', string>>;
    readonly required: string;
    readonly sourceFile: string;
    readonly previous: string;
    readonly next: string;
    readonly editHint: string;
  };
  readonly nav: {
    readonly label: string;
    readonly toggle: string;
  };
}

const PT_BR: DocsUiStrings = {
  groups: {
    actions: 'Ações',
    selection: 'Seleção',
    input: 'Entrada',
    overlays: 'Overlays',
    navigation: 'Navegação',
    layout: 'Layout',
    data: 'Dados',
    display: 'Exibição e feedback',
    utilities: 'Tipografia e utilitários',
  },
  status: {
    stable: 'Estável',
    beta: 'Beta',
    experimental: 'Experimental',
    deprecated: 'Descontinuado',
  },
  page: {
    breadcrumbRoot: 'Componentes',
    experimentalNotice:
      'Experimental: funciona e está no pacote, mas a API pode mudar sem versão major.',
    sections: {
      usage: 'Uso',
      whenToUse: 'Quando usar',
      whenNotToUse: 'Quando não usar',
      examples: 'Exemplos',
      anatomy: 'Anatomia',
      api: 'API',
      accessibility: 'Acessibilidade',
      migration: 'Migração da 22.3 para a 22.4',
    },
    onThisPage: 'Nesta página',
    preview: 'Prévia',
    code: 'Código',
    copy: 'Copiar',
    copied: 'Copiado!',
    copyImport: 'Copiar import',
    useInstead: 'Use',
    keyboard: 'Teclado',
    keys: 'Teclas',
    action: 'Ação',
    aria: 'ARIA',
    consumerNotes: 'Responsabilidades de quem usa',
    noKeyboard: 'Sem interação de teclado própria.',
    before: '22.3',
    after: '22.4',
    note: 'Observação',
    migrationIntro:
      'Mudanças previstas para a 22.4.0-rc.0 (breaking changes liberadas). A tabela segue DECISOES.md e a avaliação da família.',
    apiIntro:
      'Gerada do código-fonte (docs/quality/inventory.json) por npm run docs:generate-api; reflete a versão publicada neste site.',
    apiEmpty: 'Esta família não tem bindings públicos inventariados.',
    apiName: 'Nome',
    apiType: 'Tipo',
    apiDefault: 'Padrão',
    apiKinds: { input: 'Inputs', model: 'Models', output: 'Outputs' },
    required: 'obrigatório',
    sourceFile: 'Arquivo',
    previous: 'Anterior',
    next: 'Próximo',
    editHint: 'Fonte desta página',
  },
  nav: {
    label: 'Componentes por categoria',
    toggle: 'Componentes',
  },
};

export const DOCS_LOCALE: DocsLocale = 'pt-BR';

const UI: Readonly<Record<DocsLocale, DocsUiStrings>> = { 'pt-BR': PT_BR };

/** Strings da interface no locale ativo da docs. */
export function docsUi(locale: DocsLocale = DOCS_LOCALE): DocsUiStrings {
  return UI[locale];
}
