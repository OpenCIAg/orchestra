import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { ImageComponent } from '@ciag/orchestra/image';
import { EXAMPLE_STYLES } from './example-shared.styles';

const IMAGE_SRC =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"%3E%3Crect width="640" height="320" rx="24" fill="%231C6AED"/%3E%3Ccircle cx="520" cy="70" r="140" fill="%231CEDB9" fill-opacity=".75"/%3E%3Ccircle cx="85" cy="285" r="150" fill="%236A1CED" fill-opacity=".65"/%3E%3Ctext x="48" y="178" fill="white" font-family="Arial,sans-serif" font-size="48" font-weight="700"%3EOrchestra%3C/text%3E%3C/svg%3E';

@Component({
  selector: 'doc-image-example',
  standalone: true,
  imports: [ImageComponent],
  template: `
    <div class="example-grid example-grid--two image-demo">
      <div class="example">
        <span class="example__label">Cover</span
        ><orc-image
          [src]="src"
          alt="Composição abstrata azul do Orchestra"
          width="100%"
          height="140px"
          fit="cover"
          radius="lg"
          (loaded)="onLoad()"
        />
      </div>
      <div class="example">
        <span class="example__label">Contain</span
        ><orc-image
          [src]="src"
          alt="Composição abstrata azul do Orchestra"
          width="100%"
          height="140px"
          fit="contain"
          radius="lg"
        />
      </div>
      <div class="example">
        <span class="example__label">Fallback</span
        ><orc-image
          src="/assets/missing-preview.png"
          [fallbackSrc]="src"
          alt="Preview com fallback"
          width="100%"
          height="100px"
          radius="md"
          (error)="onError()"
        />
      </div>
      <div class="example">
        <span class="example__label">Placeholder</span
        ><orc-image
          alt=""
          placeholder="Imagem indisponível"
          width="100%"
          height="100px"
          radius="md"
        />
      </div>
      <div class="example">
        <span class="example__label">Preview</span
        ><orc-image
          [src]="src"
          alt="Composição abstrata azul do Orchestra"
          preview
          width="100%"
          height="140px"
          radius="lg"
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageExampleComponent {
  readonly stateChange = output<Record<string, unknown>>();
  readonly src = IMAGE_SRC;

  onLoad(): void {
    this.stateChange.emit({ state: 'Imagem carregada.' });
  }

  onError(): void {
    this.stateChange.emit({ state: 'Origem e fallback falharam.' });
  }
}
