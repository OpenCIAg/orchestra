import { ChangeDetectionStrategy, Component, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({selector:'orc-date-picker',standalone:true,templateUrl:'./date-picker.component.html',styleUrl:'./date-picker.component.scss',changeDetection:ChangeDetectionStrategy.OnPush,providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>DatePickerComponent),multi:true}]})
export class DatePickerComponent implements ControlValueAccessor {
  readonly value=model(''); readonly label=input(''); readonly min=input(''); readonly max=input(''); readonly helperText=input(''); readonly error=input(''); readonly required=input(false); readonly disabled=input(false); protected readonly cvaDisabled=signal(false);
  private onChange:(value:string)=>void=()=>{}; private onTouched:()=>void=()=>{};
  writeValue(value:string|null):void{this.value.set(value??'');} registerOnChange(fn:(value:string)=>void):void{this.onChange=fn;} registerOnTouched(fn:()=>void):void{this.onTouched=fn;} setDisabledState(value:boolean):void{this.cvaDisabled.set(value);}
  update(event:Event):void{const value=(event.target as HTMLInputElement).value;this.value.set(value);this.onChange(value);} touch():void{this.onTouched();}
}
