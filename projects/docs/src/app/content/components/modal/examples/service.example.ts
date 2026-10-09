import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';
import {
  ModalComponent,
  ModalService,
  type ModalRef,
} from '@ciag/orchestra/modal';

/** Conteúdo aberto pelo serviço: um componente comum com `<orc-modal>`. */
@Component({
  selector: 'doc-modal-service-dialog',
  imports: [ModalComponent, ButtonComponent],
  template: `
    <orc-modal [isOpen]="true" size="sm" (closed)="close()">
      <span modal-header>Novidades da versão</span>
      <div modal-body>
        <p>Este modal foi criado por código com o ModalService.</p>
      </div>
      <div modal-footer>
        <orc-button (click)="close()">Entendi</orc-button>
      </div>
    </orc-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ReleaseNotesDialogComponent {
  ref?: ModalRef<ReleaseNotesDialogComponent>;

  close(): void {
    this.ref?.close();
  }
}

@Component({
  selector: 'doc-modal-service-example',
  imports: [ButtonComponent],
  template: `
    <orc-button variant="outline" (click)="openNotes()"
      >Ver novidades</orc-button
    >
    <p class="hint">Aberto {{ opened() }} vez(es).</p>
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
export class ModalServiceExampleComponent {
  private readonly modals = inject(ModalService);
  readonly opened = signal(0);

  openNotes(): void {
    const ref = this.modals.open(ReleaseNotesDialogComponent);
    ref.instance.ref = ref;
    this.opened.update((count) => count + 1);
  }
}
