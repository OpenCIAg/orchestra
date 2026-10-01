import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const FORM_CATALOG_ENTRY: ComponentEntry = {
  id: 'form',
  name: 'Form',
  description: 'Wrapper de formulário com validação, submit e reset tipados.',
  category: 'Inputs',
  status: 'beta',
  tags: ['form', 'submit', 'validation'],
  icon: '🧾',
  route: '/components/form',
};

export const FORM_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/form',
  usage: `<orc-form
  ariaLabel="Cadastro de projeto"
  (formSubmit)="save($event)"
>
  <input name="project" required />
  <button type="submit">Salvar</button>
</orc-form>`,
  guidance: `Os controles entram por content projection. formSubmit recebe tentativas válidas e inválidas, e valid informa o resultado. Com novalidate=true (padrão), tentativas inválidas não abrem a UI do navegador; com novalidate=false, o componente chama reportValidity() e mostra a UI nativa sem perder o evento de saída. Um botão formnovalidate ignora essa UI e ainda emite formSubmit com o resultado atual.`,
  variations: [
    {
      label: 'Stacked',
      description: 'Layout vertical para formulários padrão.',
    },
    {
      label: 'Inline',
      description: 'Layout compacto para filtros e ações curtas.',
    },
    {
      label: 'Invalid submit',
      description:
        'O modo novalidate padrão reporta valid=false sem abrir a UI nativa.',
    },
    {
      label: 'Disabled / reset',
      description: 'Fieldset bloqueado e evento de reset disponível.',
    },
  ],
};
