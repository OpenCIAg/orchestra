import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  contentChildren,
  ElementRef,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from './tab.component';
import { TabChangeEvent, TabSize, TabVariant } from './tabs.types';

@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabGroupComponent {
  // Inputs & Model (Signals API)
  readonly selectedIndex = model<number>(0);
  readonly variant = input<TabVariant>('line');
  readonly size = input<TabSize>('md');
  readonly fullWidth = input<boolean>(false);
  readonly ariaLabel = input<string>('Abas de navegação');

  // Outputs (Signals API)
  readonly tabChange = output<TabChangeEvent>();

  // Abas filhas registradas via contentChildren
  readonly tabs = contentChildren(TabComponent);

  // Referências dos botões de abas para navegação por teclado e foco programático
  readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  // ── Seleção de Aba ────────────────────────────────────────
  selectTab(index: number): void {
    const tabList = this.tabs();
    if (index < 0 || index >= tabList.length) return;

    const targetTab = tabList[index];
    if (targetTab.disabled()) return;

    this.selectedIndex.set(index);
    this.tabChange.emit({ index, tab: targetTab });
  }

  // ── Navegação Acessível por Teclado (WAI-ARIA Tabs) ───────
  onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabList = this.tabs();
    if (!tabList || tabList.length === 0) return;

    const enabledIndices = tabList
      .map((tab, idx) => (!tab.disabled() ? idx : -1))
      .filter(idx => idx !== -1);

    if (enabledIndices.length === 0) return;

    const currentPos = enabledIndices.indexOf(currentIndex);
    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex =
          enabledIndices[(currentPos + 1) % enabledIndices.length];
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex =
          enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
        break;

      case 'Home':
        event.preventDefault();
        targetIndex = enabledIndices[0];
        break;

      case 'End':
        event.preventDefault();
        targetIndex = enabledIndices[enabledIndices.length - 1];
        break;

      case ' ':
      case 'Enter':
        event.preventDefault();
        this.selectTab(currentIndex);
        return;
    }

    if (targetIndex !== -1) {
      this.selectTab(targetIndex);
      this.focusTab(targetIndex);
    }
  }

  private focusTab(index: number): void {
    const buttons = this.tabButtons();
    if (buttons && buttons[index]) {
      buttons[index].nativeElement.focus();
    }
  }
}
