import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const FORM_FIELD_CATALOG_ENTRY: ComponentEntry = {
  id: 'form-field',
  name: 'Form Field',
  description: 'Composição de rótulo, controle, ajuda e erro.',
  category: 'Inputs',
  status: 'stable',
  tags: ['field', 'label', 'validation'],
  icon: 'input',
  route: '/components/form-field',
};

export const FORM_FIELD_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/form-field',
  usage: `<orc-form-field
  id="project-identity"
  label="Identificação do projeto"
  helperText="Use um nome curto"
  [required]="true"
>
  <label for="project-name">Nome do projeto</label>
  <input id="project-name" type="text" />
</orc-form-field>`,
  guidance: `O label nomeia o grupo fieldset/legend; dê a cada controle projetado seu próprio label nativo ou nome acessível. required é apenas um indicador visual e não altera a validação dos controles projetados. Use error para o estado inválido; helperText é usado como fallback quando não há erro.`,
  variations: [
    {
      label: 'Default',
      description: 'Label e controle sem mensagem adicional.',
    },
    { label: 'Required', description: 'Exibe o indicador de obrigatoriedade.' },
    {
      label: 'Helper text',
      description: 'Orienta o usuário sem interromper o fluxo.',
    },
    { label: 'Error', description: 'Mensagem de erro com role=alert.' },
  ],
};
