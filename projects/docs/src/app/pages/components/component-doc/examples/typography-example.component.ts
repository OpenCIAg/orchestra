import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TypographyComponent } from '@ciag/orchestra/typography';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-typography-example',
  standalone: true,
  imports: [TypographyComponent],
  template: `
    <div class="example-stack">
      <div class="example-stack example">
        <span class="example__label">Escala tipográfica</span>
        <orc-typography
          as="h2"
          size="xl"
          weight="700"
          color="var(--orc-color-azul-eletrico)"
          >Heading XL</orc-typography
        >
        <orc-typography as="p" size="md"
          >Texto corrido com line-height e peso previsíveis.</orc-typography
        >
        <orc-typography as="span" size="sm" color="var(--text-secondary)"
          >Texto de apoio</orc-typography
        >
      </div>
      <p class="example__caption">
        Combine <code>size</code>, <code>weight</code>, <code>color</code> and
        <code>truncate</code> with semantic content.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyExampleComponent {}
