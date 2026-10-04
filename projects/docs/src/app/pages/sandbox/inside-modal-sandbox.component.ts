import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '@ciag/orchestra/modal';
import { ButtonComponent } from '@ciag/orchestra/button';
import { MultiSelectComponent } from '@ciag/orchestra/multi-select';
import { ComboboxComponent } from '@ciag/orchestra/combobox';
import {
  TreeSelectComponent,
  TreeSelectNode,
} from '@ciag/orchestra/tree-select';
import { SelectComponent, OptionComponent } from '@ciag/orchestra/select';
import { DropdownComponent, DropdownItem } from '@ciag/orchestra/dropdown';
import { AutocompleteComponent } from '@ciag/orchestra/autocomplete';
import { DatePickerComponent } from '@ciag/orchestra/date-picker';
import { SliderComponent } from '@ciag/orchestra/slider';
import { TooltipDirective } from '@ciag/orchestra/tooltip';

/**
 * TEMPORARY sandbox (overhaul verification): every overlay-based control
 * rendered inside an open modal, so layering, dismissal, Escape arbitration,
 * and theming can be checked by hand in one place. Remove once the
 * cross-interaction matrix is visually confirmed by the maintainer.
 */
@Component({
  selector: 'doc-inside-modal-sandbox',
  standalone: true,
  imports: [
    ModalComponent,
    ButtonComponent,
    MultiSelectComponent,
    ComboboxComponent,
    TreeSelectComponent,
    SelectComponent,
    OptionComponent,
    DropdownComponent,
    AutocompleteComponent,
    DatePickerComponent,
    SliderComponent,
    TooltipDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sandbox">
      <h1>Sandbox — overlays dentro do modal</h1>
      <p>
        Página temporária de verificação: abre um modal com todos os controles
        baseados em overlay. Teste clique-fora, Escape (painel primeiro, modal
        depois), foco e tema escuro.
      </p>
      <orc-button (click)="open.set(true)">Abrir modal</orc-button>

      <orc-modal [(isOpen)]="open" size="lg">
        <div class="grid">
          <label class="field">
            <span>Multi-select</span>
            <orc-multi-select
              label="Tecnologias"
              placeholder="Selecione"
              [options]="options"
              [(value)]="multiValue"
            />
          </label>

          <label class="field">
            <span>Combobox</span>
            <orc-combobox
              placeholder="Buscar"
              [options]="options"
              [(value)]="comboValue"
            />
          </label>

          <label class="field">
            <span>Tree select</span>
            <orc-tree-select
              placeholder="Nós"
              [nodes]="nodes"
              [(value)]="treeValue"
            />
          </label>

          <label class="field">
            <span>Select</span>
            <orc-select [(value)]="selectValue">
              <orc-option value="a">Opção A</orc-option>
              <orc-option value="b">Opção B</orc-option>
              <orc-option value="c">Opção C</orc-option>
            </orc-select>
          </label>

          <label class="field">
            <span>Autocomplete</span>
            <orc-autocomplete
              placeholder="Digite para filtrar"
              [options]="options"
              [(value)]="autoValue"
            />
          </label>

          <label class="field">
            <span>Date picker (com limites)</span>
            <orc-date-picker
              [min]="'2026-01-01'"
              [max]="'2026-12-31'"
              [(value)]="dateValue"
            />
          </label>

          <label class="field">
            <span>Slider</span>
            <orc-slider [(value)]="sliderValue" />
            <code>{{ sliderValue() }}</code>
          </label>

          <div class="field">
            <span>Dropdown</span>
            <orc-dropdown [items]="menuItems">Ações</orc-dropdown>
          </div>

          <p
            class="field"
            [orcTooltip]="'Dica visível sobre o conteúdo do modal'"
          >
            Passe o mouse aqui para o tooltip (teste o modo escuro também).
          </p>
        </div>
      </orc-modal>
    </div>
  `,
  styles: [
    `
      .sandbox {
        padding: 2rem;
        display: grid;
        gap: 1rem;
        justify-items: start;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(16rem, 1fr));
        gap: 1.25rem;
      }
      .field {
        display: grid;
        gap: 0.35rem;
      }
      .field > span {
        font-weight: 600;
      }
    `,
  ],
})
export class InsideModalSandboxComponent {
  readonly open = signal(true);

  readonly options = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
  ];

  readonly nodes: TreeSelectNode[] = [
    {
      value: 'sp',
      label: 'São Paulo',
      children: [
        { value: 'sp-campinas', label: 'Campinas' },
        { value: 'sp-sjc', label: 'São José dos Campos' },
      ],
    },
    { value: 'mg', label: 'Minas Gerais' },
  ];

  readonly menuItems: DropdownItem[] = [
    { label: 'Duplicar' },
    { label: 'Arquivar' },
    { label: 'Excluir', danger: true },
  ];

  readonly multiValue = signal<string[]>(['angular']);
  readonly comboValue = signal('react');
  readonly treeValue = signal('mg');
  readonly selectValue = signal('a');
  readonly autoValue = signal('');
  readonly dateValue = signal('2026-06-15');
  readonly sliderValue = signal(40);
}
