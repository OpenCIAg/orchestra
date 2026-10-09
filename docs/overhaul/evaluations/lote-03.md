# Lote 03: Entrada A (texto/número/campo)

Fonte detalhada: [`lote-03.json`](./lote-03.json). Régua: [`../README.md`](../README.md).

| id           | veredito      | motivo                                                                                                                                                                                      |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| input        | KEEP-REDESIGN | Controle mais usado (67 + 12 textarea) e base idiomática; perde rótulo/erro embutidos, `type=number`, `prefixText`/`suffixText` e a paridade PrimeNG, e ganha slots `orcPrefix`/`orcSuffix` |
| input-group  | MERGE → input | Segunda forma de prefixo/sufixo, só com texto; `outline: 0` via `::ng-deep` deixa o foco invisível                                                                                          |
| icon-field   | MERGE → input | O consumidor já usa `<orc-icon prefix>` dentro do `orc-input`; o ícone padrão é o glifo `⌕`, fora do Material Symbols                                                                       |
| ifta-label   | REMOVE        | Convenção concorrente de rótulo, igual ao `float-label variant="in"`; o substituto é o `orc-form-field`                                                                                     |
| float-label  | REMOVE        | Terceira convenção de rótulo; `ViewEncapsulation.None` + `P2_SHARED_STYLES` vazam CSS global; `filled` não acompanha o Reactive Forms                                                       |
| form-field   | KEEP-REDESIGN | Vira o **modelo único de campo** (label/hint/error/required) com contexto DI para todos os controles; hoje usa fieldset/legend e não liga o rótulo ao controle                              |
| form         | REMOVE        | `valid` vem de `checkValidity()` nativo e ignora o FormGroup; vira landmark "Formulário" em toda instância; é responsabilidade do app (`<form [formGroup] (ngSubmit)>`)                     |
| number-input | KEEP-REDESIGN | Necessário (18 `type=number` + 4 `appDotToComma` no consumidor), mas tem 55 inputs, outputs `on*` e parser que quebra a digitação em pt-BR                                                  |
| password     | MERGE → input | `orc-input type="password"` já tem o toggle e é o que o consumidor usa; o medidor de força por regex é política do app                                                                      |
| otp-input    | KEEP-REDESIGN | Família única e bem testada; exporta subcomponentes que não dá para compor; tem 6 paradas de Tab, outputs PrimeNG e rótulos em inglês                                                       |

**Contagem:** KEEP 0 · KEEP-REDESIGN 4 · MERGE 3 · REMOVE 3 · EXPERIMENTAL 0.

## Modelo único de campo (proposta do lote)

```html
<orc-form-field label="Horas planejadas" hint="Máximo 8,8 h/dia" [error]="erroHoras" required>
  <orc-number-input formControlName="plannedHours" [max]="8.8" [maxFractionDigits]="1">
    <span orcSuffix>h</span>
  </orc-number-input>
</orc-form-field>

<orc-form-field label="Buscar projeto">
  <orc-input type="search" [(value)]="termo" clearable>
    <orc-icon orcPrefix name="search" />
  </orc-input>
</orc-form-field>
```

- **Rótulo, dica, erro e obrigatório** existem só no `orc-form-field`. Os controles perdem `label`, `helperText`, `errorMessage` e `status`.
- O `orc-form-field` fornece `ORC_FORM_FIELD` (`controlId`, `describedBy`, `invalid` como signals). Cada controle orc-* injeta o token como opcional e aplica `id`, `aria-describedby` e `aria-invalid` no elemento nativo. O estado `invalid` vem de `contentChild(NgControl)` (inválido e tocado/submetido) ou do `error` explícito. Isso elimina o padrão do consumidor de recalcular `errorMessage` a partir de `touched`.
- **Prefixo/sufixo** existem só como slots `[orcPrefix]`/`[orcSuffix]` (ícone, texto ou botão), compartilhados por `orc-input`, `orc-textarea` (se fizer sentido) e `orc-number-input`. Saem input-group, input-group-addon, icon-field, `prefixText`/`suffixText` e os seletores `[prefix]`/`[suffix]`.
- **Sem rótulo flutuante/interno.** O rótulo fica acima do campo, como na identidade CIAg atual. Saem float-label e ifta-label.
- Para os lotes 02 e 04: select, multi-select, date-picker, checkbox etc. também devem consumir `ORC_FORM_FIELD` e perder rótulo/erro embutidos, se tiverem.

## Observações transversais

1. **pt-BR quebrado nos controles.** Os textos padrão estão em inglês em input (`input.component.ts:178-186`), number-input (`html:45,75,97,114`), password (`ts:76-77`) e otp (`otp-input.component.html:4`, `otp-slot.component.ts:67`). Tudo isso deve ir para `provideOrcLabels`. O number-input usa o locale do navegador (`ts:97`), quando deveria usar `LOCALE_ID`/pt-BR. O parser trata `.` como decimal (`ts:180-184`) e reformata/limita a cada tecla (`ts:186` + `html:61`): `1.234,5` vira `1.2345`, e com `min=10` não dá para digitar `15`.
2. **Aliases por todo lado.** Os seletores `orc-input-text`, `orc-input-textarea`, `orc-input-number`, `orc-input-password` e `orc-input-otp` e os entry points `input-text`, `input-textarea`, `textarea`, `text-input`, `input-number`, `input-otp`, `inputgroup`, `iconfield`, `iftalabel`, `floatlabel` e `label` saem. O `label` é o pior caso: exporta `FormFieldComponent as LabelComponent`.
3. **CVA não unificado.** input, textarea e number-input estendem `CvaControl`. password (`ts:37`) e otp-input (`ts:48-49`) têm cópias próprias e devem migrar.
4. **Resíduos do p2.** `P2_SHARED_STYLES` aparece em input-group, icon-field, ifta-label, float-label, password e input-group-addon. No float-label, com `ViewEncapsulation.None`, as regras `*`, `button:disabled` e `:focus-visible` (`internal/p2-shared.ts:175-180`) viram CSS global, o que viola o princípio 4.
5. **Outputs.** O padrão-alvo é: `valueChange` vem do `model`; `cleared` e `completed` ficam no particípio. `focus`/`blur`/`onFocus`/`onBlur`/`inputChange`/`onInput`/`onKeyDown` saem, e quem precisar usa `focusin`/`focusout` nativos no host.
6. **Testes.** form-field e form não têm spec. As famílias wrapper (input-group, icon-field, ifta-label, float-label) dividem um único spec de "paridade" (`input-group-parity.spec.ts`). O redesign do form-field precisa de spec com axe e Reactive Forms (rótulo associado, describedby, invalid automático).

## Entry points do lote 10 ligados à entrada

- **input-mask** (`input-mask/input-mask.directive.ts`): duplica o `mask` do `orc-input` (`input/input-mask.util.ts`). Também é diretiva em elemento nativo (contra a decisão 9), tem seletor PrimeNG `[pInputMask]`, 4 inputs no-op deprecados (`:36,43,50,75`) e outputs `on*`. **Pertence ao input → REMOVE**; o recurso canônico é `orc-input [mask]`. Vale portar `slotChar` só se houver demanda.
- **key-filter** (`key-filter/key-filter.directive.ts`): diretiva em nativo, seletor `[pKeyFilter]`, alias `pValidateOnly`. Declara um output chamado **`ngModelChange`** (`:16`), que colide com o evento do `NgModel`. O caso real dele (só dígitos/decimal) é do `orc-number-input`, e formatos fixos são do `mask`. **REMOVE**; não precisa virar input do `orc-input`.
- **text-input** (`text-input/text-input.component.ts:1`): é só `export { InputComponent as TextInputComponent }`. **REMOVE** (alias).
- **input-group-addon** (`input-group-addon/input-group-addon.component.ts`): `<span>` com borda, irmão do input-group. **REMOVE**; o substituto são os slots `[orcPrefix]`/`[orcSuffix]` do `orc-input`.

## Impacto no gestao-de-projetos

Medido em `src/`: 67 `orc-input` e 12 `orc-textarea` em 30 arquivos.

- `[fluid]="true"` (79x): remover, porque o campo passa a ter 100% de largura por padrão.
- `type="number"` (18x) e `appDotToComma` (4x, hourlog): migrar para `orc-number-input`. O modelo passa de string para `number | null`, e a `DotToCommaDirective` do app pode ser apagada.
- `label` (11x) e `[errorMessage]` (13x): migrar para `orc-form-field`. Os `<label>` manuais ao lado de controles orc-* também devem migrar (ex.: `members-card.component.html:12`).
- `inputId` (13x) → `id`; `<orc-icon prefix>` (4x) → `orcPrefix`; `autoFocus` (2x) é no-op hoje e deve ser removido.
- `type="password"` (2x), `required`/`pattern`/`maxlength`/`email` (validadores do Angular no host) e `formControlName`/`ngModel` continuam funcionando.
