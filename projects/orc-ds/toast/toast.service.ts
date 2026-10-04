import {
  Injectable,
  signal,
  computed,
  inject,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  ComponentRef,
  DestroyRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  ToastItem,
  ToastOptions,
  ToastPosition,
  ToastStatus,
} from './toast.types';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);

  // ── Sinais Reativos Globais ───────────────────────────────
  readonly toasts = signal<ToastItem[]>([]);
  readonly activeCount = computed(() => this.toasts().length);

  // ── Configurações Padrão ──────────────────────────────────
  private defaultPosition: ToastPosition = 'top-right';
  private defaultDuration = 5000;
  private preventDuplicates = false;
  private preventOpenDuplicates = false;
  private containerRef: ComponentRef<unknown> | null = null;
  private isCreatingContainer = false;
  private idCounter = 0;
  private destroyed = false;
  private readonly containers = signal<symbol[]>([]);

  /** A service stream is rendered once; explicit toast arrays remain independent. */
  registerContainer(owner: symbol): () => void {
    this.containers.update((owners) => [...owners, owner]);
    this.disposeContainer();
    return () => {
      this.containers.update((owners) =>
        owners.filter((candidate) => candidate !== owner),
      );
      if (!this.destroyed && !this.containers().length && this.toasts().length)
        void this.ensureContainer();
    };
  }

  isContainerOwner(owner: symbol): boolean {
    return this.containers()[0] === owner;
  }

  private disposeContainer(): void {
    if (!this.containerRef) return;
    const ref = this.containerRef;
    this.containerRef = null;
    if (!this.appRef.destroyed && !ref.hostView.destroyed)
      this.appRef.detachView(ref.hostView);
    ref.destroy();
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.disposeContainer();
    });
  }

  // ── Inicialização Dinâmica do Container Overlay (Sem Circular Dependency) ──
  private async ensureContainer(): Promise<void> {
    if (
      this.containerRef ||
      this.isCreatingContainer ||
      this.containers().length ||
      !this.document.defaultView ||
      this.destroyed
    )
      return;

    try {
      this.isCreatingContainer = true;
      const { ToastContainerComponent } =
        await import('./toast-container.component');

      if (!this.containerRef && !this.destroyed && !this.containers().length) {
        const containerComponentRef = createComponent(ToastContainerComponent, {
          environmentInjector: this.injector,
        });

        containerComponentRef.setInput('automatic', true);
        this.appRef.attachView(containerComponentRef.hostView);
        const domElem = containerComponentRef.location
          .nativeElement as HTMLElement;
        this.document.body.appendChild(domElem);

        this.containerRef = containerComponentRef;
      }
    } catch {
      // Ignora caso já esteja instanciado
    } finally {
      this.isCreatingContainer = false;
    }
  }

  // ── Métodos de Configuração Global ────────────────────────
  setDefaultPosition(position: ToastPosition): void {
    this.defaultPosition = position;
  }

  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }

  setPreventDuplicates(value: boolean): void {
    this.preventDuplicates = value;
  }
  setPreventOpenDuplicates(value: boolean): void {
    this.preventOpenDuplicates = value;
  }

  // ── Disparo Principal de Toasts ───────────────────────────
  show(optionsOrMessage: ToastOptions | string): string {
    this.ensureContainer();

    const options: ToastOptions =
      typeof optionsOrMessage === 'string'
        ? { message: optionsOrMessage }
        : optionsOrMessage;

    const id = options.id || `orc-toast-${++this.idCounter}-${Date.now()}`;
    const type: ToastStatus =
      options.type ||
      (options.severity === 'warn'
        ? 'warning'
        : options.severity === 'error'
          ? 'error'
          : options.severity === 'success'
            ? 'success'
            : 'info');

    const title = options.title || options.summary || '';

    const toastItem: ToastItem = {
      ...options,
      id,
      type,
      title,
      message: options.message || options.detail || '',
      duration: options.sticky
        ? 0
        : options.duration !== undefined
          ? options.duration
          : options.life !== undefined
            ? options.life
            : this.defaultDuration,
      showProgressBar: Boolean(options.showProgressBar),
      dismissible:
        options.dismissible !== undefined ? options.dismissible : true,
      showIcon: options.showIcon !== undefined ? options.showIcon : true,
      position: options.position || this.defaultPosition,
      pauseOnHover:
        options.pauseOnHover !== undefined ? options.pauseOnHover : true,
      createdAt: Date.now(),
    };

    const existing = this.toasts();
    const duplicate = existing.find(
      (item) =>
        item.id === id ||
        (this.preventDuplicates &&
          item.message === toastItem.message &&
          item.type === toastItem.type) ||
        (this.preventOpenDuplicates &&
          item.key === toastItem.key &&
          item.message === toastItem.message),
    );
    if (duplicate) return duplicate.id;

    this.toasts.update((current) => [...current, toastItem]);
    return id;
  }

  add(message: ToastOptions): string {
    return this.show(message);
  }
  addAll(messages: ToastOptions[]): string[] {
    return messages.map((message) => this.show(message));
  }
  remove(id: string): void {
    this.dismiss(id);
  }

  // ── Atalhos Semânticos ────────────────────────────────────
  success(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'success',
      title: options?.title,
      message,
    });
  }

  info(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'info',
      title: options?.title,
      message,
    });
  }

  warning(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'warning',
      title: options?.title,
      message,
    });
  }

  error(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'error',
      title: options?.title,
      message,
    });
  }

  loading(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'loading',
      title: options?.title,
      message,
      duration: options?.duration !== undefined ? options.duration : 0,
    });
  }

  notification(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'notification',
      title: options?.title,
      message,
    });
  }

  // ── Fechamento e Limpeza ──────────────────────────────────
  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(key?: string): void {
    if (key)
      this.toasts.update((current) =>
        current.filter((toast) => toast.key !== key),
      );
    else this.toasts.set([]);
  }
}
