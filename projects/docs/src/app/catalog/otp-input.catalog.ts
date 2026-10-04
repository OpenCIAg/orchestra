import type { ComponentEntry } from '../models/component-entry.model';

export const OTP_INPUT_CATALOG_ENTRY: ComponentEntry = {
  id: 'otp-input',
  name: 'OTP Input',
  description:
    'Entrada de código de uso único (One-Time Password) acessível e reativo.',
  category: 'Inputs',
  status: 'stable',
  tags: ['otp', 'password', 'code', 'form', 'segurança', 'verificação'],
  icon: 'pin',
  route: '/components/otp-input',
};
