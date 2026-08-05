import {
  Component,
  ChangeDetectionStrategy,
  input,
  TemplateRef,
  viewChild,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabIconPosition } from './tabs.types';

let uniqueTabIdCounter = 0;

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  // Inputs (Signals API)
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly iconPosition = input<TabIconPosition>('start');
  readonly disabled = input<boolean>(false);
  readonly badge = input<string | number | undefined>(undefined);
  readonly id = input<string>('');

  // Templates internos para projeção sob demanda
  readonly contentTemplate = viewChild<TemplateRef<unknown>>('contentTemplate');
  readonly customLabelTemplate = viewChild<TemplateRef<unknown>>('customLabelTemplate');

  // Identificador único garantido
  private readonly fallbackId = `orc-tab-${++uniqueTabIdCounter}`;
  readonly tabId = computed(() => this.id() || this.fallbackId);
  readonly panelId = computed(() => `${this.tabId()}-panel`);
}
