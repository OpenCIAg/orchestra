import {
  Directive,
  input,
  contentChild,
  booleanAttribute,
} from '@angular/core';
import { ColumnAlign } from './table.types';
import { CellDefDirective, HeaderCellDefDirective } from './table-cell-def.directive';

@Directive({
  selector: 'orc-column, app-column',
  standalone: true,
})
export class ColumnDirective {
  /** Chave do objeto que identifica a propriedade da coluna */
  readonly key = input.required<string>();

  /** Título do cabeçalho da coluna */
  readonly header = input<string>('');

  /** Habilita ordenação para esta coluna */
  readonly sortable = input(false, { transform: booleanAttribute });

  /** Largura customizada da coluna (ex: '120px', '20%') */
  readonly width = input<string>('');

  /** Alinhamento do conteúdo: 'left' | 'center' | 'right' */
  readonly align = input<ColumnAlign>('left');

  /** Template customizado de corpo da célula */
  readonly cellTemplate = contentChild(CellDefDirective);

  /** Template customizado de cabeçalho da coluna */
  readonly headerTemplate = contentChild(HeaderCellDefDirective);
}
