import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertSeverity, AlertVariant } from './alert.types';

@Component({
  selector: 'orc-alert, orc-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'orc-alert-host',
    '[class.orc-alert-host--hidden]': '!isVisible()',
  },
})
export class AlertComponent {
  // ── Inputs (Signals API) ──────────────────────────────────────────
  /** Status / Severidade do alerta */
  readonly severity = input<AlertSeverity>('info');

  /** Alias para severity */
  readonly status = input<AlertSeverity | undefined>(undefined);

  /** Variante visual: soft/subtle (fundo claro), filled (sólido) ou outline (apenas borda) */
  readonly variant = input<AlertVariant>('subtle');

  /** Título principal do alerta (opcional) */
  readonly title = input<string>('');

  /** Texto descritivo (opcional se fornecido via ng-content) */
  readonly message = input<string>('');
  readonly text = input<string | undefined>(undefined);

  /** Controla se o ícone do alerta deve ser exibido */
  readonly showIcon = input<boolean>(true);

  /** Define se o alerta pode ser dispensado pelo usuário exibindo o botão 'X' */
  readonly dismissible = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly closable = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
  readonly life = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly icon = input<string | undefined>(undefined);
  readonly styleClass = input('');
  readonly style = input<Record<string, string | number> | undefined>(undefined);

  /** Sobrescreve o atributo role WCAG (padrão: 'alert' para error/warning e 'status' para info/success) */
  readonly role = input<string | undefined>(undefined);

  /** Rótulo acessível opcional para leitores de tela */
  readonly ariaLabel = input<string>('');

  /** Rótulo acessível do botão de fechar */
  readonly closeAriaLabel = input<string | undefined>(undefined);

  // ── Outputs (Signals API) ─────────────────────────────────────────
  /** Emitido quando o usuário clica no botão de fechar */
  readonly onClose = output<MouseEvent>();

  /** Alias do evento de fechamento */
  readonly closed = output<void>();

  // ── Estado Interno Reativo ────────────────────────────────────────
  readonly isVisible = signal<boolean>(true);

  // ── Sinais Computados ─────────────────────────────────────────────
  /** Normaliza o tipo de severidade ativo */
  readonly activeSeverity = computed<AlertSeverity>(() => {
    return this.status() || this.severity();
  });
  readonly activeMessage = computed(() => this.text() ?? this.message());
  readonly isClosable = computed(() => this.closable() ?? this.dismissible());

  /** Normaliza a variante */
  readonly activeVariant = computed<'subtle' | 'filled' | 'outline'>(() => {
    const v = this.variant();
    if (v === 'soft') return 'subtle';
    if (v === 'solid') return 'filled';
    return v;
  });

  /** Computa o atributo role WCAG ideal conforme o tipo de severidade */
  readonly computedRole = computed<string>(() => {
    if (this.role()) return this.role()!;
    return this.activeSeverity() === 'error' || this.activeSeverity() === 'warning'
      ? 'alert'
      : 'status';
  });

  /** Computa aria-live: 'assertive' para erros críticos e 'polite' para informativos */
  readonly computedAriaLive = computed<'assertive' | 'polite'>(() => {
    return this.activeSeverity() === 'error' ? 'assertive' : 'polite';
  });

  // ── Handlers de Interação ────────────────────────────────────────
  handleDismiss(event: MouseEvent): void {
    event.stopPropagation();
    this.isVisible.set(false);
    this.onClose.emit(event);
    this.closed.emit();
  }
}
