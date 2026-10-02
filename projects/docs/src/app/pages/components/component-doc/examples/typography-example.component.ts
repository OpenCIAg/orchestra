import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TypographyComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-typography-example',
  standalone: true,
  imports: [TypographyComponent],
  template: `
    <div class="example-stack">
      <div class="example-stack example">
        <span class="example__label">Type scale</span>
        <orc-typography
          as="h2"
          size="xl"
          weight="700"
          color="var(--orc-color-azul-eletrico)"
          >Heading XL</orc-typography
        >
        <orc-typography as="p" size="md"
          >Body text with a predictable line-height and weight.</orc-typography
        >
        <orc-typography as="span" size="sm" color="var(--text-secondary)"
          >Supporting text</orc-typography
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
