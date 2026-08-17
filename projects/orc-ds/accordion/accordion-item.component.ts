import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  computed,
  inject,
  OnInit,
  OnDestroy,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion.component';

let uniqueIdCounter = 0;

@Component({
  selector: 'orc-accordion-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  private readonly accordion = inject(AccordionComponent, { optional: true });

  // Inputs (Signals API)
  readonly id = input<string>('');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly hideToggle = input<boolean>(false);

  // Model (Two-way binding Signals API)
  readonly expanded = model<boolean>(false);

  // Outputs (Signals API)
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly toggle = output<boolean>();

  // Referência do botão de cabeçalho para foco programático
  readonly headerButton = viewChild<ElementRef<HTMLButtonElement>>('headerBtn');

  // ID interno garantido
  private readonly fallbackId = `orc-accordion-item-${++uniqueIdCounter}`;

  readonly itemId = computed(() => this.id() || this.fallbackId);
  readonly headerId = computed(() => `orc-accordion-header-${this.itemId()}`);
  readonly panelId = computed(() => `orc-accordion-panel-${this.itemId()}`);

  ngOnInit(): void {
    if (this.accordion) {
      this.accordion.registerItem(this);
    }
  }

  ngOnDestroy(): void {
    if (this.accordion) {
      this.accordion.unregisterItem(this);
    }
  }

  // ── Métodos de Controle ───────────────────────────────────
  toggleExpanded(): void {
    if (this.disabled()) return;

    const nextState = !this.expanded();
    this.expanded.set(nextState);

    if (nextState) {
      this.opened.emit();
    } else {
      this.closed.emit();
    }
    this.toggle.emit(nextState);

    if (this.accordion) {
      this.accordion.onItemToggle(this, nextState);
    }
  }

  focusHeader(): void {
    this.headerButton()?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.accordion) {
      this.accordion.handleKeyNavigation(event, this);
    }
  }
}
