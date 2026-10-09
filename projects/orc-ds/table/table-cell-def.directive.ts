import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[orcCellDef]',
  standalone: true,
})
export class CellDefDirective {
  readonly templateRef = inject(TemplateRef<any>);
}

@Directive({
  selector: '[orcHeaderCellDef]',
  standalone: true,
})
export class HeaderCellDefDirective {
  readonly templateRef = inject(TemplateRef<any>);
}
