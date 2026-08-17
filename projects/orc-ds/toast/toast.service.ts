import {
  Injectable,
  signal,
  computed,
  inject,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  ComponentRef,
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
  private containerRef: ComponentRef<unknown> | null = null;
  private isCreatingContainer = false;
  private idCounter = 0;

  // ── Inicialização Dinâmica do Container Overlay (Sem Circular Dependency) ──
  private async ensureContainer(): Promise<void> {
    if (this.containerRef || this.isCreatingContainer || typeof window === 'undefined') return;

    try {
      this.isCreatingContainer = true;
      const { ToastContainerComponent } = await import('./toast-container.component');

      if (!this.containerRef) {
        const containerComponentRef = createComponent(ToastContainerComponent, {
          environmentInjector: this.injector,
        });

        this.appRef.attachView(containerComponentRef.hostView);
        const domElem = (containerComponentRef.hostView as any).rootNodes[0] as HTMLElement;
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

  // ── Disparo Principal de Toasts ───────────────────────────
  show(optionsOrMessage: ToastOptions | string): string {
    this.ensureContainer();

    const options: ToastOptions =
      typeof optionsOrMessage === 'string'
        ? { message: optionsOrMessage }
        : optionsOrMessage;

    const id = options.id || `orc-toast-${++this.idCounter}-${Date.now()}`;
    const type: ToastStatus = options.type || 'info';

    // Determina título padrão caso não informado
    let title = options.title || '';
    if (!title && !options.message) {
      switch (type) {
        case 'success': title = 'Sucesso'; break;
        case 'error': title = 'Erro'; break;
        case 'warning': title = 'Atenção'; break;
        case 'info': title = 'Informação'; break;
        case 'loading': title = 'Carregando'; break;
        case 'notification': title = 'Notificação'; break;
      }
    }

    const toastItem: ToastItem = {
      ...options,
      id,
      type,
      title,
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : this.defaultDuration,
      showProgressBar: Boolean(options.showProgressBar),
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      showIcon: options.showIcon !== undefined ? options.showIcon : true,
      position: options.position || this.defaultPosition,
      pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : true,
      createdAt: Date.now(),
    };

    this.toasts.update(current => [...current, toastItem]);
    return id;
  }

  // ── Atalhos Semânticos ────────────────────────────────────
  success(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'success',
      title: options?.title || 'Sucesso',
      message,
    });
  }

  info(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'info',
      title: options?.title || 'Informação',
      message,
    });
  }

  warning(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'warning',
      title: options?.title || 'Atenção',
      message,
    });
  }

  error(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'error',
      title: options?.title || 'Erro',
      message,
    });
  }

  loading(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'loading',
      title: options?.title || 'Carregando',
      message,
      duration: options?.duration !== undefined ? options.duration : 0,
    });
  }

  notification(message: string, options?: Partial<ToastOptions>): string {
    return this.show({
      ...options,
      type: 'notification',
      title: options?.title || 'Notificações',
      message,
    });
  }

  // ── Fechamento e Limpeza ──────────────────────────────────
  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
