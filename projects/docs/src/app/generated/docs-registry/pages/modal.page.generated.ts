// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { ComponentPageData } from '../../../models/component-page.model';
import { DOC } from '../../../content/components/modal/modal.doc';
import { ModalBasicExampleComponent } from '../../../content/components/modal/examples/basic.example';
import { ModalConfirmExampleComponent } from '../../../content/components/modal/examples/confirm.example';
import { ModalServiceExampleComponent } from '../../../content/components/modal/examples/service.example';

export const PAGE: ComponentPageData = {
  doc: DOC,
  examples: [
    {
      slug: 'basic',
      file: 'examples/basic.example.ts',
      component: ModalBasicExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component, signal } from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\nimport { ModalComponent } from \'@ciag/orchestra/modal\';\n\n@Component({\n  selector: \'doc-modal-basic-example\',\n  imports: [ModalComponent, ButtonComponent],\n  template: `\n    <orc-button (click)="open.set(true)">Editar perfil</orc-button>\n\n    <orc-modal [(isOpen)]="open">\n      <span modal-header>Editar perfil</span>\n      <div modal-body>\n        <p>Atualize seu nome de exibição e a foto usada nos projetos.</p>\n      </div>\n      <div modal-footer>\n        <orc-button variant="ghost" (click)="open.set(false)"\n          >Cancelar</orc-button\n        >\n        <orc-button (click)="open.set(false)">Salvar</orc-button>\n      </div>\n    </orc-modal>\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ModalBasicExampleComponent {\n  readonly open = signal(false);\n}\n',
    },
    {
      slug: 'confirm',
      file: 'examples/confirm.example.ts',
      component: ModalConfirmExampleComponent,
      source:
        'import { ChangeDetectionStrategy, Component, signal } from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\nimport { ModalComponent } from \'@ciag/orchestra/modal\';\n\n@Component({\n  selector: \'doc-modal-confirm-example\',\n  imports: [ModalComponent, ButtonComponent],\n  template: `\n    <orc-button variant="danger" (click)="open.set(true)">\n      Excluir projeto\n    </orc-button>\n    @if (deleted()) {\n      <p class="hint" role="status">Projeto excluído.</p>\n    }\n\n    <orc-modal size="sm" [(isOpen)]="open" [closeOnBackdropClick]="false">\n      <span modal-header>Excluir projeto?</span>\n      <div modal-body>\n        <p>\n          O projeto e todas as tarefas serão apagados. Essa ação não pode ser\n          desfeita.\n        </p>\n      </div>\n      <div modal-footer>\n        <orc-button variant="ghost" (click)="open.set(false)"\n          >Cancelar</orc-button\n        >\n        <orc-button variant="danger" (click)="confirm()">Excluir</orc-button>\n      </div>\n    </orc-modal>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 0.75rem;\n    }\n    .hint {\n      margin: 0;\n      font-size: 0.875rem;\n      color: var(--orc-text-muted);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ModalConfirmExampleComponent {\n  readonly open = signal(false);\n  readonly deleted = signal(false);\n\n  confirm(): void {\n    this.deleted.set(true);\n    this.open.set(false);\n  }\n}\n',
    },
    {
      slug: 'service',
      file: 'examples/service.example.ts',
      component: ModalServiceExampleComponent,
      source:
        'import {\n  ChangeDetectionStrategy,\n  Component,\n  inject,\n  signal,\n} from \'@angular/core\';\nimport { ButtonComponent } from \'@ciag/orchestra/button\';\nimport {\n  ModalComponent,\n  ModalService,\n  type ModalRef,\n} from \'@ciag/orchestra/modal\';\n\n/** Conteúdo aberto pelo serviço: um componente comum com `<orc-modal>`. */\n@Component({\n  selector: \'doc-modal-service-dialog\',\n  imports: [ModalComponent, ButtonComponent],\n  template: `\n    <orc-modal [isOpen]="true" size="sm" (closed)="close()">\n      <span modal-header>Novidades da versão</span>\n      <div modal-body>\n        <p>Este modal foi criado por código com o ModalService.</p>\n      </div>\n      <div modal-footer>\n        <orc-button (click)="close()">Entendi</orc-button>\n      </div>\n    </orc-modal>\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nclass ReleaseNotesDialogComponent {\n  ref?: ModalRef<ReleaseNotesDialogComponent>;\n\n  close(): void {\n    this.ref?.close();\n  }\n}\n\n@Component({\n  selector: \'doc-modal-service-example\',\n  imports: [ButtonComponent],\n  template: `\n    <orc-button variant="outline" (click)="openNotes()"\n      >Ver novidades</orc-button\n    >\n    <p class="hint">Aberto {{ opened() }} vez(es).</p>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 0.75rem;\n    }\n    .hint {\n      margin: 0;\n      font-size: 0.875rem;\n      color: var(--orc-text-muted);\n    }\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class ModalServiceExampleComponent {\n  private readonly modals = inject(ModalService);\n  readonly opened = signal(0);\n\n  openNotes(): void {\n    const ref = this.modals.open(ReleaseNotesDialogComponent);\n    ref.instance.ref = ref;\n    this.opened.update((count) => count + 1);\n  }\n}\n',
    },
  ],
};
