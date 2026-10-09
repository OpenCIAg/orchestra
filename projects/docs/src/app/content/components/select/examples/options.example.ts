import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SelectComponent, type SelectOption } from '@ciag/orchestra/select';

@Component({
  selector: 'doc-select-options-example',
  imports: [SelectComponent],
  template: `
    <orc-select
      label="Projeto"
      placeholder="Selecione um projeto"
      helperText="Digite para filtrar a lista."
      searchable
      clearable
      [options]="projects"
      [(value)]="project"
    />
  `,
  styles: `
    :host {
      display: block;
      width: min(100%, 22rem);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionsExampleComponent {
  readonly project = signal<string | undefined>('orchestra');

  readonly projects: SelectOption<string>[] = [
    { value: 'orchestra', label: 'Orchestra', description: 'Design system' },
    { value: 'gestao', label: 'Gestão de Projetos', description: 'Portal' },
    { value: 'campo', label: 'App de Campo', description: 'Mobile' },
    { value: 'bi', label: 'Painéis de BI', description: 'Relatórios' },
    { value: 'legado', label: 'Sistema legado', disabled: true },
  ];
}
