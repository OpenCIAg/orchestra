import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ListComponent, ListItem } from '@ciag/orchestra/list';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-list-example',
  standalone: true,
  imports: [ListComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Seleção única</span>
        <orc-list
          [items]="items()"
          selection="single"
          label="Projetos"
          (itemSelect)="selectItem($event)"
        />
        <code>selected = {{ selectedId() || 'none' }}</code>
      </div>
      <div class="example">
        <span class="example__label">Estado vazio</span>
        <orc-list
          [items]="emptyList"
          selection="multiple"
          label="Sem resultados"
        />
        <p class="example__caption">
          O componente renderiza “Nenhum item” sem markup adicional.
        </p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selectedId = signal<string | null>('design');
  readonly items = signal<ListItem[]>([
    {
      id: 'design',
      label: 'Design System',
      description: '12 componentes',
      selected: true,
    },
    { id: 'docs', label: 'Documentação', description: 'Em revisão' },
    { id: 'archive', label: 'Arquivo antigo', disabled: true },
  ]);
  readonly emptyList: ListItem[] = [];

  ngOnInit(): void {
    this.emit();
  }

  selectItem(item: ListItem): void {
    this.selectedId.set(item.id);
    this.items.update((items) =>
      items.map((current) => ({
        ...current,
        selected: current.id === item.id,
      })),
    );
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.selectedId(),
      items: this.items().length,
    });
  }
}
