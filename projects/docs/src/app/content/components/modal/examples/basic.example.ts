import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';
import { ModalComponent } from '@ciag/orchestra/modal';

@Component({
  selector: 'doc-modal-basic-example',
  imports: [ModalComponent, ButtonComponent],
  template: `
    <orc-button (click)="open.set(true)">Editar perfil</orc-button>

    <orc-modal [(isOpen)]="open">
      <span modal-header>Editar perfil</span>
      <div modal-body>
        <p>Atualize seu nome de exibição e a foto usada nos projetos.</p>
      </div>
      <div modal-footer>
        <orc-button variant="ghost" (click)="open.set(false)"
          >Cancelar</orc-button
        >
        <orc-button (click)="open.set(false)">Salvar</orc-button>
      </div>
    </orc-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalBasicExampleComponent {
  readonly open = signal(false);
}
