import {
  Injectable,
  ApplicationRef,
  EnvironmentInjector,
  Type,
  createComponent,
  ComponentRef,
} from '@angular/core';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  /**
   * Abre um componente dinamicamente.
   * O componente injetado DEVE conter a tag <orc-modal> com [isOpen]="true" internamente,
   * para que o modal nativo assuma a camada de visualização (Top Layer do HTML5).
   */
  open<T>(component: Type<T>, inputs?: Record<string, unknown>): ModalRef<T> {
    // 1. Instanciar o componente dinamicamente
    const componentRef: ComponentRef<T> = createComponent(component, {
      environmentInjector: this.injector,
    });

    // 2. Setar inputs se fornecidos
    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        componentRef.setInput(key, value);
      });
    }

    // 3. Atachar à árvore de views do Angular para detecção de mudanças
    this.appRef.attachView(componentRef.hostView);

    // 4. Inserir no DOM
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // 5. Configurar lógica de destruição
    const destroyFn = () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    };

    return new ModalRef<T>(componentRef, destroyFn);
  }
}
