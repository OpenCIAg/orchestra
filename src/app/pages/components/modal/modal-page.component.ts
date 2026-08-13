import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { FooterComponent } from '../../../shared/footer/footer.component';

// ── COMPONENTE DINÂMICO PARA DEMONSTRAÇÃO DO SERVIÇO ─────────
@Component({
  selector: 'app-demo-dynamic-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <orc-modal [isOpen]="true" size="sm" (closed)="fechar()">
      <span modal-header>Modal via Serviço</span>
      <div modal-body>
        <p style="margin-bottom: 1rem;">
          Fui injetado no DOM dinamicamente usando o <code>ModalService</code> e o <code>createComponent</code>!
        </p>
        <p>Apertar ESC ou clicar fora também funciona perfeitamente.</p>
      </div>
      <div modal-footer>
        <orc-button variant="outline" (click)="fechar()">Entendi</orc-button>
      </div>
    </orc-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoDynamicModalComponent {
  // A referência será injetada para que possamos destruí-lo
  closeFn!: () => void;
  
  fechar() {
    if (this.closeFn) {
      this.closeFn();
    }
  }
}

// ── COMPONENTE DA PÁGINA ─────────────────────────────────────
@Component({
  selector: 'app-modal-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent,
    ButtonComponent,
    FooterComponent
  ],
  templateUrl: './modal-page.component.html',
  styleUrl: './modal-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalPageComponent {
  private modalService = inject(ModalService);

  // Estados para modais declarativos
  isDeclarativeOpen = signal(false);
  isLargeOpen = signal(false);
  isPreventCloseOpen = signal(false);

  // Invocação Programática
  openProgrammaticModal() {
    const modalRef = this.modalService.open(DemoDynamicModalComponent);
    // Passamos a função de destruição para o próprio componente para que ele possa se fechar
    modalRef.instance.closeFn = () => modalRef.close();
  }
}
