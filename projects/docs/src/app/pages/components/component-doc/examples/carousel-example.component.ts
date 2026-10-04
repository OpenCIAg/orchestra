import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CarouselComponent, CarouselItem } from '@ciag/orchestra/carousel';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-carousel-example',
  standalone: true,
  imports: [CarouselComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Padrão · loop + indicadores</span>
        <orc-carousel
          [items]="slides"
          [(activeIndex)]="activeIndex"
          ariaLabel="Variações de carousel"
        />
        <code>activeIndex = {{ activeIndex() }}</code>
      </div>
      <div class="example-grid example-grid--two">
        <div class="example example--muted">
          <span class="example__label">Sem loop</span>
          <p>
            Use <code>[loop]="false"</code> para manter os limites de navegação.
          </p>
        </div>
        <div class="example example--muted">
          <span class="example__label">Autoplay</span>
          <p>Use <code>[autoplay]="true"</code> com um intervalo adequado.</p>
        </div>
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly activeIndex = signal(0);
  readonly slides: CarouselItem[] = [
    {
      id: 'one',
      label: 'Composição',
      description: 'Combine estados sem perder clareza.',
    },
    {
      id: 'two',
      label: 'Acessibilidade',
      description: 'Teclado e semântica fazem parte da API.',
    },
    {
      id: 'three',
      label: 'Escala',
      description: 'Tokens consistentes em qualquer produto.',
    },
    {
      id: 'four',
      label: 'Indisponível',
      description: 'Este slide demonstra um item disabled.',
      disabled: true,
    },
  ];

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({
      activeIndex: this.activeIndex(),
      total: this.slides.length,
    });
  }
}
