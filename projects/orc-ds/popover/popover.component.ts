import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, model } from '@angular/core';
export type PopoverPlacement = 'top'|'right'|'bottom'|'left';
@Component({selector:'orc-popover',standalone:true,templateUrl:'./popover.component.html',styleUrl:'./popover.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class PopoverComponent {
  readonly open=model(false); readonly placement=input<PopoverPlacement>('bottom'); readonly label=input('Conteúdo adicional');
  private readonly host=inject(ElementRef<HTMLElement>);
  toggle():void { this.open.update(v=>!v); }
  close():void { this.open.set(false); }
  @HostListener('document:keydown.escape') onEscape():void { this.close(); }
  @HostListener('document:click',['$event']) onOutside(event:MouseEvent):void { if(this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(); }
}
