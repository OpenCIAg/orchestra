import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: '[orcTableFooter]', standalone: true })
export class TableFooterDirective { readonly templateRef = inject(TemplateRef<unknown>); }

@Directive({ selector: '[orcRowExpansion]', standalone: true })
export class TableRowExpansionDirective { readonly templateRef = inject(TemplateRef<unknown>); }
