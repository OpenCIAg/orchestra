import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

export const TERMINAL_CATALOG_ENTRY: ComponentEntry = {
  id: 'terminal',
  name: 'Terminal',
  description:
    'Prompt compacto com histórico controlado e eventos de envio de comandos.',
  category: 'Utility',
  status: 'beta',
  tags: ['terminal', 'console', 'command', 'history', 'shell'],
  icon: '>_',
  route: '/components/terminal',
};

export const TERMINAL_USAGE_DOC: ComponentUsageDoc = {
  packagePath: '@ciag/orchestra/terminal',
  usage: `<orc-terminal
  prompt="ops> "
  [(command)]="command"
  [(history)]="history"
  (commandRun)="handleCommand($event)"
  ariaLabel="Operations console"
  commandAriaLabel="Terminal command"
/>`,
  guidance: `Enter envia o formulário nativo. submit(event) ignora comandos apenas com whitespace; comandos aceitos são aparados, adicionados a history e emitidos em commandRun e onCommand. O componente não invoca shell nem produz a saída do comando: atualize history com um objeto TerminalLine { command, output? }. O histórico acompanha novas linhas quando o viewport já está no fim e preserva a posição de quem está lendo entradas anteriores. A região usa role=log e aria-live=polite; configure os dois nomes acessíveis para o contexto da aplicação.`,
  variations: [
    {
      label: 'Welcome + custom prompt',
      description: 'Mensagem de boas-vindas e prompt fornecidos pelo app.',
    },
    {
      label: 'Controlled models',
      description: 'command e history podem ser ligados ao estado consumidor.',
    },
    {
      label: 'Command output',
      description: 'Cada TerminalLine pode incluir output renderizado em pre.',
    },
    {
      label: 'History follow',
      description:
        'Novas linhas são acompanhadas quando o leitor já está no fim do histórico.',
    },
    {
      label: 'Accessible names',
      description: 'A região, o histórico e o campo de comando têm nomes.',
    },
  ],
};
