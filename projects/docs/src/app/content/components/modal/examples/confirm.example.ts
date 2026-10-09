import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';
import { ModalComponent } from '@ciag/orchestra/modal';

@Component({
  selector: 'doc-modal-confirm-example',
  imports: [ModalComponent, ButtonComponent],
  template: `
    <orc-button variant="danger" (click)="open.set(true)">
      Excluir projeto
    </orc-button>
    @if (deleted()) {
      <p class="hint" role="status">Projeto excluído.</p>
    }

    <orc-modal size="sm" [(isOpen)]="open" [closeOnBackdropClick]="false">
      <span modal-header>Excluir projeto?</span>
      <div modal-body>
        <p>
          O projeto e todas as tarefas serão apagados. Essa ação não pode ser
          desfeita.
        </p>
      </div>
      <div modal-footer>
        <orc-button variant="ghost" (click)="open.set(false)"
          >Cancelar</orc-button
        >
        <orc-button variant="danger" (click)="confirm()">Excluir</orc-button>
      </div>
    </orc-modal>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .hint {
      margin: 0;
      font-size: 0.875rem;
      color: var(--orc-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalConfirmExampleComponent {
  readonly open = signal(false);
  readonly deleted = signal(false);

  confirm(): void {
    this.deleted.set(true);
    this.open.set(false);
  }
}
