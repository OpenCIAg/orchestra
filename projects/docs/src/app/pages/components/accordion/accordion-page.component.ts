import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AccordionComponent,
  AccordionItemComponent,
  AccordionVariant,
} from '@ciag/orchestra/accordion';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-accordion-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AccordionComponent,
    AccordionItemComponent,
    FooterComponent,
  ],
  templateUrl: './accordion-page.component.html',
  styleUrl: './accordion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundMultiple = signal<boolean>(false);
  readonly playgroundVariant = signal<AccordionVariant>('default');
  readonly item1Expanded = signal<boolean>(true);
  readonly item2Expanded = signal<boolean>(false);
  readonly item3Expanded = signal<boolean>(false);
  readonly item4Disabled = signal<boolean>(false);

  // ── Event Logs ────────────────────────────────────────────
  readonly eventLogs = signal<string[]>([]);

  logEvent(msg: string): void {
    this.eventLogs.update(logs => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...logs.slice(0, 4),
    ]);
  }

  resetPlayground(): void {
    this.playgroundMultiple.set(false);
    this.playgroundVariant.set('default');
    this.item1Expanded.set(true);
    this.item2Expanded.set(false);
    this.item3Expanded.set(false);
    this.item4Disabled.set(false);
  }
}
