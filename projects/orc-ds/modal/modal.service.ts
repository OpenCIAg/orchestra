import {
  Injectable,
  ApplicationRef,
  DestroyRef,
  DestroyableInjector,
  EnvironmentInjector,
  Type,
  createComponent,
  ComponentRef,
  InjectionToken,
  Injector,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { ModalRef } from './modal-ref';

export const ORC_MODAL_DATA = new InjectionToken<unknown>('ORC_MODAL_DATA');

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly openRefs = new Set<ModalRef<unknown, unknown>>();
  private readonly unregisterApplicationDestroy: () => void;

  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  constructor() {
    this.unregisterApplicationDestroy = this.appRef.onDestroy(() =>
      this.closeAll(),
    );
    this.destroyRef.onDestroy(() => this.closeAll());
  }

  /**
   * Abre um componente dinamicamente.
   * O componente injetado DEVE conter a tag <orc-modal> com [isOpen]="true" internamente,
   * para que o modal nativo assuma a camada de visualização (Top Layer do HTML5).
   */
  open<TComponent, TData = undefined, TResult = undefined>(
    component: Type<TComponent>,
    config: {
      data?: TData;
      inputs?: Partial<Record<keyof TComponent, unknown>>;
    } = {},
  ): ModalRef<TComponent, TResult> {
    const body = this.document?.body;
    if (!body) {
      throw new Error(
        'ModalService.open requires a document with a body to attach the modal host.',
      );
    }

    let componentInjector: DestroyableInjector | undefined;
    let componentRef: ComponentRef<TComponent> | undefined;
    let cleaned = false;
    let ref: ModalRef<TComponent, TResult> | undefined;
    let injectorDestroyed = false;
    let firstCleanupError: unknown;
    let hasCleanupError = false;

    const recordCleanupError = (error: unknown): void => {
      if (!hasCleanupError) {
        hasCleanupError = true;
        firstCleanupError = error;
      }
    };

    const destroyInjector = (): void => {
      if (injectorDestroyed) return;
      injectorDestroyed = true;
      try {
        componentInjector?.destroy();
      } catch (error) {
        recordCleanupError(error);
      }
    };

    const cleanup = (): void => {
      if (cleaned) return;
      cleaned = true;
      if (ref) {
        const key = ref as ModalRef<unknown, unknown>;
        this.openRefs.delete(key);
      }

      const host = componentRef?.location.nativeElement as Node | undefined;
      if (host?.parentNode) {
        try {
          host.parentNode.removeChild(host);
        } catch (error) {
          recordCleanupError(error);
        }
      }

      if (componentRef && !componentRef.hostView.destroyed) {
        try {
          this.appRef.detachView(componentRef.hostView);
        } catch (error) {
          // Continue through component and injector cleanup before surfacing
          // an ApplicationRef teardown error.
          recordCleanupError(error);
        }
      }
      if (componentRef && !componentRef.hostView.destroyed) {
        try {
          componentRef.destroy();
        } catch (error) {
          recordCleanupError(error);
        }
      }
      destroyInjector();
      if (hasCleanupError) throw firstCleanupError;
    };

    try {
      componentInjector = Injector.create({
        parent: this.injector,
        providers: [{ provide: ORC_MODAL_DATA, useValue: config.data }],
      });

      // ComponentRef.location is the public host-element API. It remains
      // valid for components whose view contains comments or no root element.
      componentRef = createComponent(component, {
        environmentInjector: this.injector,
        elementInjector: componentInjector,
      });

      if (config.inputs) {
        const componentInputs = config.inputs as Record<string, unknown>;
        Object.entries(componentInputs).forEach(([key, value]) =>
          componentRef!.setInput(key, value),
        );
      }

      this.appRef.attachView(componentRef.hostView);
      body.appendChild(componentRef.location.nativeElement);

      ref = new ModalRef<TComponent, TResult>(componentRef, cleanup);
      const resourceKey = ref as ModalRef<unknown, unknown>;
      this.openRefs.add(resourceKey);
      componentRef.onDestroy(() => {
        // Angular automatically detaches a view destroyed by its owner. Keep
        // the DOM and per-open injector ownership correct for that path too.
        if (!cleaned) {
          cleaned = true;
          const key = ref as ModalRef<unknown, unknown>;
          this.openRefs.delete(key);
          const host = componentRef?.location.nativeElement as Node | undefined;
          if (host?.parentNode) {
            try {
              host.parentNode.removeChild(host);
            } catch (error) {
              recordCleanupError(error);
            }
          }
          destroyInjector();
          if (hasCleanupError) throw firstCleanupError;
        }
      });

      return ref;
    } catch (error) {
      // Preserve the operation error that caused open() to fail while still
      // attempting every owned-resource cleanup stage.
      try {
        cleanup();
      } catch {
        // The original creation/input/attach error is the first failure the
        // caller needs to diagnose; cleanup has already attempted all stages.
      }
      throw error;
    }
  }

  private closeAll(): void {
    let firstError: unknown;
    let hasError = false;
    for (const ref of [...this.openRefs]) {
      try {
        ref.close();
      } catch (error) {
        // Continue closing sibling refs before surfacing the first teardown
        // error to the application lifecycle that initiated this cleanup.
        if (!hasError) {
          hasError = true;
          firstError = error;
        }
      }
    }
    this.openRefs.clear();
    this.unregisterApplicationDestroy();
    if (hasError) throw firstError;
  }
}
