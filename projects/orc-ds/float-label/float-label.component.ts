import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { P2_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-float-label',
  standalone: true,
  templateUrl: './float-label.component.html',
  styles: [P2_SHARED_STYLES],
  styleUrl: './float-label.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatLabelComponent implements AfterViewInit {
  readonly variant = input<'in' | 'over' | 'on'>('over');
  readonly styleClass = input('');
  readonly focused = signal(false);
  readonly filled = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  ngAfterViewInit(): void {
    this.syncFilled();
  }
  onInput(event: Event): void {
    this.filled.set(
      String(
        (
          event.target as
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
        )?.value ?? '',
      ).length > 0,
    );
  }
  private syncFilled(): void {
    const control = this.host.nativeElement.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input,textarea,select');
    this.filled.set(!!control?.value);
  }
}
