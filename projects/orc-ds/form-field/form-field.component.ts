import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({selector:'orc-form-field',standalone:true,templateUrl:'./form-field.component.html',styleUrl:'./form-field.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class FormFieldComponent { readonly label=input(''); readonly helperText=input(''); readonly error=input(''); readonly required=input(false); }
