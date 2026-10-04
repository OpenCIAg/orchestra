import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const AUTOCOMPLETE_CATALOG_ENTRY: ComponentEntry = {
  id: 'autocomplete',
  name: 'Autocomplete',
  description: 'Seleção assistida com filtragem, teclado e estados de lista.',
  category: 'Inputs',
  status: 'beta',
  tags: ['autocomplete', 'combobox', 'search', 'input'],
  icon: 'manage_search',
  route: '/components/autocomplete',
};

export const AUTOCOMPLETE_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/autocomplete',
  usage: `<orc-autocomplete
  label="Cidade"
  [options]="cities"
  [(value)]="city"
  [minChars]="2"
  clearable
/>`,
  guidance: `Forneça labels compreensíveis e use minChars quando a lista for grande. O valor emitido é o value da opção, não o texto visível.`,
  variations: [
    {
      label: 'Default',
      description: 'Filtra ao digitar e abre a lista ao focar.',
    },
    {
      label: 'minChars',
      description: 'A lista só abre depois do número mínimo de caracteres.',
    },
    { label: 'Error', description: 'Mensagem de erro anunciada pelo campo.' },
    {
      label: 'Disabled / clearable',
      description: 'Bloqueia edição ou permite limpar o valor.',
    },
  ],
};
