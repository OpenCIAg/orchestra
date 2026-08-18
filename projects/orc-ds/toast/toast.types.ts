export type ToastStatus =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'
  | 'notification';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastAction {
  /** Rótulo textual do botão de ação (ex: 'Desfazer', 'Saiba mais') */
  label: string;
  /** Ícone opcional exibido no botão ('undo' | 'arrow' | 'info' | custom svg) */
  icon?: 'undo' | 'arrow' | 'info' | string;
  /** Callback executado quando o usuário clica na ação */
  onClick: (toast: ToastItem) => void;
}

export interface ToastOptions {
  /** PrimeNG message aliases. */
  key?: string;
  severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  /** Identificador único opcional (se omitido, será gerado automaticamente) */
  id?: string;
  /** Tipo / severidade da notificação */
  type?: ToastStatus;
  /** Título principal do Toast (opcional se fornecido message) */
  title?: string;
  /** Mensagem ou descrição contextual */
  message?: string;
  /** Tempo de exibição em milissegundos antes do auto-dismiss (padrão: 5000ms. 0 ou Infinity para desativar) */
  duration?: number;
  /** Exibe a barra de progresso / contador visual de tempo restante na base do toast (padrão: false) */
  showProgressBar?: boolean;
  /** Exibe o botão manual de fechar 'X' (padrão: true) */
  dismissible?: boolean;
  /** Exibe o ícone do tipo à esquerda (padrão: true) */
  showIcon?: boolean;
  /** Posição do toast na tela (padrão: 'top-right') */
  position?: ToastPosition;
  /** Ação customizada com botão dentro do toast */
  action?: ToastAction;
  /** Pausa o timer de auto-dismiss quando o usuário passa o mouse por cima (padrão: true) */
  pauseOnHover?: boolean;
  /** Sobrescreve o atributo role WCAG (padrão: 'alert' para erro/atenção, 'status' para sucesso/info/notificação) */
  role?: 'status' | 'alert';
  /** Sobrescreve o atributo aria-live WCAG */
  ariaLive?: 'polite' | 'assertive' | 'off';
  /** Rótulo de acessibilidade customizado */
  ariaLabel?: string;
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastStatus;
  title: string;
  message: string;
  duration: number;
  showProgressBar?: boolean;
  dismissible: boolean;
  showIcon: boolean;
  position: ToastPosition;
  pauseOnHover: boolean;
  createdAt: number;
}
