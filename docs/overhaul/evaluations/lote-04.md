# Lote 04: Entrada B (data, escalas, booleanos)

Avaliação somente-leitura das 11 famílias do lote. O detalhe por família, com evidências `arquivo:linha`, está em `lote-04.json`.

| id           | veredito             | motivo                                                                                                                                                                    |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| date-picker  | KEEP-REDESIGN        | Núcleo e o mais usado no consumidor (22 tags), mas a API é o p-datepicker: 90 inputs, 13 outputs `on*`, valor `any` (Date ou string), `min`/`minDate` duplicados e no-ops |
| calendar     | KEEP-REDESIGN        | Vira a **única** grade de calendário (absorve `orc-date-picker-calendar`); o date-picker passa a compô-la, como no shadcn                                                 |
| date-input   | MERGE → date-picker  | Segunda forma de pedir data (`<input type=date>` nativo); `min/max string\|Date` e a validação de intervalo migram para o date-picker                                     |
| color-picker | KEEP-REDESIGN        | Usado pelo consumidor; painel sem overlay, sem Escape e sem foco, `writeValue(null)` não limpa, no-ops de paridade, CVA próprio                                           |
| input-color  | MERGE → color-picker | Duplicata (nativo + hex) presa no monólito `p2`; vira `orc-color-picker [inline]`                                                                                         |
| knob         | EXPERIMENTAL         | Nicho citado na decisão #3; range linear sob SVG, `min/max` sem conversão numérica                                                                                        |
| slider       | KEEP-REDESIGN        | Primitivo útil e com bom teclado; 4 outputs de mudança, tooltip/style de paridade, thumbs de range sem nome                                                               |
| rating       | EXPERIMENTAL         | Nicho, 0 usos, puxa o chunk de tooltip; API PrimeNG (`stars`/`max`, `iconOnClass`…) e botão focável dentro de `role=slider`                                               |
| checkbox     | KEEP-REDESIGN        | Bom núcleo (nativo + CvaControl + indeterminate); sai o contrato `binary/trueValue/falseValue`, `change`+`onChange` e as classes `p-`                                     |
| radio        | KEEP-REDESIGN        | Modelo grupo+item correto e bem testado; sai `binary`, `onClick`/`select`, o Set global e o alias `radio-button`; item vira `orc-radio`                                   |
| switch       | KEEP-REDESIGN        | `role=switch` correto, mas 3 seletores, 3 entry points de alias, CVA próprio e nenhum spec dedicado                                                                       |

**Contagem:** 7 KEEP-REDESIGN, 2 MERGE, 2 EXPERIMENTAL, 0 KEEP, 0 REMOVE.

## Decisão de valor de data: string ISO

O valor de `orc-date-picker` e de `orc-calendar` passa a ser **sempre string ISO**:

- `'yyyy-MM-dd'` para datas;
- `'yyyy-MM-ddTHH:mm[:ss]'` com `showTime`;
- `'HH:mm'` com `timeOnly`;
- `string[]` em `multiple`/`range`.

`dataType` sai.

Por que string ISO:

1. **Data civil não tem fuso.** Um `Date` carrega hora e fuso. Serializado por `JSON.stringify`, ele vira UTC, e no Brasil (UTC−3) a data recua um dia. O backend recebe a data errada.
2. **Já é o contrato de hoje.** É o formato do `<input type=date>`, do `orc-calendar` e do `orc-date-input`, e o do calendar-engine compartilhado. Uniformizar custa menos.
3. **Funciona como valor.** É comparável, ordenável, serializável e estável em `===` dentro de signals e `OnPush`.
4. **O consumidor já usa assim na maioria dos casos.** `dataType="string"` aparece em 14 usos, contra 7 de `"date"`. Nesses 7, a conversão fica na borda do app.

`min`/`max` aceitam `string ISO | Date` por conveniência. O **formato de exibição** é independente do valor: `displayFormat` com tokens do DatePipe, padrão derivado do locale (pt-BR → `dd/MM/yyyy`). O `firstDayOfWeek` também vem do locale (pt-BR → domingo).

## Observações transversais

1. **Rótulos em inglês em todo o lote.** A decisão #8 (pt-BR) é violada em vários pontos, e não existe `provideOrcLabels` no código:
   - calendar: 'Previous month', 'Time';
   - date-picker: 'Choose date', 'Increase hour', 'Today', 'Clear';
   - color-picker: 'Choose color', 'Clear color';
   - input-color: 'Color picker';
   - date-input: 'Date outside the allowed range'.

   O provider é pré-requisito de date-picker, calendar, color-picker e slider. O date-picker sozinho expõe 13 inputs de rótulo que somem com ele.

2. **CVA fragmentado.** Só date-picker, calendar, date-input e checkbox estendem `CvaControl`. switch, slider, rating, radio-group, color-picker, knob e input-color reimplementam o CVA à mão, e todos repetem o par `cvaDisabled`/`isDisabled`. Migrar todos para a base é um item barato e mecânico.
3. **Outputs duplicados como padrão.** O mesmo evento sai por dois ou mais outputs em quase todas as famílias:

   | família          | outputs                                     |
   | ---------------- | ------------------------------------------- |
   | checkbox, switch | `change` + `onChange`                       |
   | color-picker     | `colorChange` + `onChange`                  |
   | knob             | `valueChangeEvent` + `onChange`             |
   | slider           | `sliderChange` + `sliderInput` + `onChange` |
   | date-picker      | `onClear` + `onClearClick`                  |
   | calendar         | `dateSelected` + `onSelect`                 |

   Regra para o RC: o `model()` gera `xChange`, e os outputs extras saem.

4. **Mimetismo PrimeNG nos templates.** As classes `p-checkbox`, `p-toggleswitch`, `p-radiobutton`, `p-slider`, `p-rating` e `p-colorpicker`, mais `p-component` e `data-pc-name`, continuam em 6 famílias. A consolidação do calendar-engine já as removeu das famílias de data, e o mesmo deve valer para as demais.
5. **Contrato `binary/trueValue/falseValue` sai.** checkbox e switch passam a ter CVA boolean puro (`checked`). O modo "array de valores" do checkbox vira um `orc-checkbox-group` com `value: T[]`, simétrico ao `orc-radio-group`.
6. **Overlays fora do CDK.** O date-picker usa popover nativo + `registerOverlay` + listeners manuais duplicados. O color-picker nem tem overlay: o painel fica no fluxo do layout. Os dois dependem da infra de overlay CDK do lote 05.
7. **Aliases a remover.** São 4 entry points de alias (`datepicker`, `colorpicker`, `radio-button`, `inputswitch`/`toggle-switch`), mais `toggle`, 2 seletores extras do switch e o alias de símbolo `RadioButton`. Coordenar com o lote 10, dono dos entry points sem família.
8. **Lacunas de teste.** O switch não tem spec próprio, só 3 testes em `controls-repair.spec.ts`. color-picker (5 testes de parsing) e rating (4) testam pouco comportamento. As famílias de data estão bem cobertas.

## Impacto no gestao-de-projetos

- **date-picker (22 tags):** migração manual.
  - Apagar `dataType="string"` e `iconDisplay`.
  - Converter os 7 `dataType="date"` na borda do app.
  - Apagar `dateFormat="dd/mm/yy"`, que vira o padrão.
  - Trocar `yy-mm-dd` por `displayFormat` ou adotar o padrão pt-BR.
  - Trocar `styleClass`/`inputStyleClass` por `fluid`/`class`/tokens.
- **checkbox (8 tags):**
  - hourlog: remover `[binary]` e passar o texto para `label` ou usar `inputId`.
  - gantt: `(change)="…$event.checked"` vira `(checkedChange)`, e o `<label>` externo aninhado sai.
- **switch (1):** `styleClass` vira `class`.
- **slider (1)** e **color-picker (1):** sem mudança.
