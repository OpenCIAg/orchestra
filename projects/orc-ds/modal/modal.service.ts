import {
  Injectable,
  ApplicationRef,
  EnvironmentInjector,
  Type,
  createComponent,
  ComponentRef,
  InjectionToken,
  Injector,
} from '@angular/core';
import { ModalRef } from './modal-ref';

export const ORC_MODAL_DATA = new InjectionToken<unknown>('ORC_MODAL_DATA');

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
  open<TComponent, TData = undefined, TResult = undefined>(
    component: Type<TComponent>,
    config: { data?: TData; inputs?: Partial<Record<keyof TComponent, unknown>> } = {},
  ): ModalRef<TComponent, TResult> {
    const componentInjector = Injector.create({
      parent: this.injector,
      providers: [{ provide: ORC_MODAL_DATA, useValue: config.data }],
    });
    // 1. Instanciar o componente dinamicamente
    const componentRef: ComponentRef<TComponent> = createComponent(component, {
      environmentInjector: this.injector,
      elementInjector: componentInjector,
    });

    // 2. Setar inputs se fornecidos
    if (config.inputs) {
      const componentInputs = config.inputs as Record<string, unknown>;
      Object.entries(componentInputs).forEach(([key, value]) => {
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

    return new ModalRef<TComponent, TResult>(componentRef, destroyFn);
  }
}
