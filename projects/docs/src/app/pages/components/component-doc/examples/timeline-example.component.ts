import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TimelineComponent, TimelineItem } from '@ciag/orchestra/timeline';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-timeline-example',
  standalone: true,
  imports: [TimelineComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Todos os status de item</span>
        <orc-timeline
          [items]="items"
          ariaLabel="Etapas do componente"
          (itemSelect)="selectItem($event)"
        />
        <code>selected = {{ selectedId() || 'none' }}</code>
      </div>
      <div class="example example--muted">
        <span class="example__label">Horizontal</span>
        <p>Use <code>orientation="horizontal"</code> para sequências curtas.</p>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly selectedId = signal<string | null>(null);
  readonly items: TimelineItem[] = [
    {
      id: 'done',
      title: 'Definição',
      description: 'Requisitos alinhados.',
      date: 'Concluído',
      status: 'completed',
      icon: '✓',
    },
    {
      id: 'current',
      title: 'Implementação',
      description: 'Componente em uso.',
      date: 'Atual',
      status: 'current',
      icon: '2',
    },
    {
      id: 'next',
      title: 'Revisão',
      description: 'Acessibilidade e testes.',
      date: 'Próximo',
      status: 'pending',
      icon: '3',
    },
    {
      id: 'error',
      title: 'Publicação',
      description: 'Aguardando correção.',
      date: 'Bloqueado',
      status: 'error',
      icon: '!',
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  selectItem(event: { item: TimelineItem; index: number }): void {
    this.selectedId.set(String(event.item.id ?? event.index));
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      selected: this.selectedId(),
      state: 'event sequence',
    });
  }
}
