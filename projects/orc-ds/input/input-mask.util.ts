/**
 * Utilitário de máscara leve e sem dependências externas.
 * Suporta tokens padrão:
 * - `0` ou `9`: Apenas dígitos numéricos (0-9)
 * - `A` ou `a`: Apenas letras (a-z, A-Z)
 * - `*`: Alfanumérico (letras e números)
 */
export function applyMask(rawVal: string, maskPattern: string): string {
  if (!rawVal || !maskPattern) return rawVal;

  const rawChars = String(rawVal).split('');
  let formatted = '';
  let rawIdx = 0;

  for (let mIdx = 0; mIdx < maskPattern.length && rawIdx < rawChars.length; mIdx++) {
    const maskChar = maskPattern[mIdx];
    const rawChar = rawChars[rawIdx];

    if (maskChar === '0' || maskChar === '9') {
      if (/\d/.test(rawChar)) {
        formatted += rawChar;
        rawIdx++;
      } else {
        // Ignora caractere não numérico da entrada bruta e tenta o próximo
        rawIdx++;
        mIdx--; // repete a posição da máscara
      }
    } else if (maskChar === 'A' || maskChar === 'a') {
      if (/[a-zA-Z]/.test(rawChar)) {
        formatted += rawChar;
        rawIdx++;
      } else {
        rawIdx++;
        mIdx--;
      }
    } else if (maskChar === '*') {
      if (/[a-zA-Z0-9]/.test(rawChar)) {
        formatted += rawChar;
        rawIdx++;
      } else {
        rawIdx++;
        mIdx--;
      }
    } else {
      // Caractere literal da máscara (ex: '.', '-', '(', ')', '/', ' ')
      formatted += maskChar;
      if (rawChar === maskChar) {
        rawIdx++;
      }
    }
  }

  return formatted;
}

export function cleanMask(formattedVal: string, maskPattern: string): string {
  if (!formattedVal || !maskPattern) return formattedVal;

  // Extrai apenas os caracteres que correspondem aos tokens dinâmicos da máscara
  let clean = '';
  const specialChars = new Set(maskPattern.replace(/[09Aa*]/g, '').split(''));

  for (const ch of String(formattedVal)) {
    if (!specialChars.has(ch)) {
      clean += ch;
    }
  }

  return clean;
}
