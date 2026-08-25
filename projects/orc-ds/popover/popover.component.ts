import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, model, output } from '@angular/core';
export type PopoverPlacement = 'top'|'right'|'bottom'|'left';
export type PopoverAlign = 'start'|'center'|'end';
@Component({selector:'orc-popover',standalone:true,templateUrl:'./popover.component.html',styleUrl:'./popover.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class PopoverComponent {
  readonly open=model(false); readonly placement=input<PopoverPlacement>('bottom'); readonly align=input<PopoverAlign>('start'); readonly label=input('Conteúdo adicional'); readonly ariaLabel=input<string | undefined>(undefined); readonly ariaLabelledBy=input<string | undefined>(undefined); readonly dismissable=input(true); readonly style=input<Record<string, string | number> | undefined>(undefined); readonly styleClass=input(''); readonly appendTo=input<unknown>(undefined); readonly autoZIndex=input(true); readonly baseZIndex=input(0); readonly focusOnShow=input(true); readonly showTransitionOptions=input('150ms cubic-bezier(0, 0, 0.2, 1)'); readonly hideTransitionOptions=input('100ms linear'); readonly ariaCloseLabel=input('Close'); readonly onShow=output<void>(); readonly onHide=output<void>();
  private readonly host=inject(ElementRef<HTMLElement>);
  toggle():void { this.open() ? this.close() : this.show(); }
  show():void { if (!this.open()) { this.open.set(true); this.onShow.emit(); } }
  close():void { if (this.open()) { this.open.set(false); this.onHide.emit(); } }
  @HostListener('document:keydown.escape') onEscape():void { if (this.dismissable()) this.close(); }
  @HostListener('document:click',['$event']) onOutside(event:MouseEvent):void { if(this.dismissable() && this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(); }
}
