import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileUploaderComponent } from '@ciag/orchestra/file-uploader';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-file-upload-example',
  standalone: true,
  imports: [FileUploaderComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Arrastar e soltar</span>
        <orc-file-uploader
          accept="image/*,.pdf"
          [multiple]="true"
          [maxFiles]="3"
          label="Clique ou arraste arquivos aqui"
          subLabel="PNG, JPG ou PDF · até 3 arquivos"
        />
      </div>
      <p class="example__caption">
        O alias P2 usa o componente de upload existente, incluindo seleção por
        teclado e remoção de arquivos.
      </p>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadExampleComponent {}
