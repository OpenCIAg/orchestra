import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
export interface ListItem { id:string; label:string; description?:string; disabled?:boolean; selected?:boolean; }
@Component({selector:'orc-list',standalone:true,templateUrl:'./list.component.html',styleUrl:'./list.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class ListComponent { readonly items=input<ListItem[]>([]); readonly label=input('Lista'); readonly selection=input<'none'|'single'|'multiple'>('none'); readonly itemSelect=output<ListItem>(); select(item:ListItem):void{if(!item.disabled)this.itemSelect.emit(item);} }
