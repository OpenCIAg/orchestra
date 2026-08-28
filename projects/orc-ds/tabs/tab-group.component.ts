import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  computed,
  contentChildren,
  ElementRef,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from './tab.component';
import { TabChangeEvent, TabSize, TabVariant } from './tabs.types';

@Component({
  selector: 'orc-tab-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabGroupComponent {
  // Inputs & Model (Signals API)
  readonly selectedIndex = model<number>(0);
  readonly value = model<string | number>(0, { alias: 'value' });
  readonly variant = input<TabVariant>('line');
  readonly size = input<TabSize>('md');
  readonly fullWidth = input<boolean>(false);
  readonly scrollable = input<boolean>(false);
  readonly selectOnFocus = input<boolean>(false);
  readonly lazy = input(false);
  readonly controlClose = input(false);
  readonly showNavigators = input(true);
  readonly nextButtonAriaLabel = input<string | undefined>(undefined);
  readonly prevButtonAriaLabel = input<string | undefined>(undefined);
  readonly autoHideButtons = input(true);
  readonly style = input<Record<string, string | number> | undefined>(undefined);
  readonly styleClass = input('');
  readonly tabindex = input(0);
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  // Outputs (Signals API)
  readonly tabChange = output<TabChangeEvent>();
  readonly onChange = output<TabChangeEvent>();
  readonly tabFocus = output<{ index: number; tab: TabComponent }>();
  readonly onClose = output<{ originalEvent: Event; index: number; tab: TabComponent }>();

  // Abas filhas registradas via contentChildren
  readonly tabs = contentChildren(TabComponent);
  readonly visibleTabs = computed(() => this.tabs().filter(tab => !tab.closed()));
  readonly loadedTabs = new Set<TabComponent>();

  // Referências dos botões de abas para navegação por teclado e foco programático
  readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');
  readonly activeIndex = computed(() => typeof this.value() === 'number' ? this.value() as number : this.selectedIndex());

  // ── Seleção de Aba ────────────────────────────────────────
  selectTab(index: number): void {
    const tabList = this.visibleTabs();
    if (index < 0 || index >= tabList.length) return;

    const targetTab = tabList[index];
    if (targetTab.disabled()) return;

    this.selectedIndex.set(index);
    this.value.set(index);
    this.loadedTabs.add(targetTab);
    const event = { index, tab: targetTab };
    this.tabChange.emit(event);
    this.onChange.emit(event);
  }

  // ── Navegação Acessível por Teclado (WAI-ARIA Tabs) ───────
  onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabList = this.visibleTabs();
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
      this.focusTab(targetIndex);
      if (this.selectOnFocus()) this.selectTab(targetIndex);
    }
  }

  onFocus(index: number): void {
    const tab = this.visibleTabs()[index];
    if (!tab || tab.disabled()) return;
    this.tabFocus.emit({ index, tab });
    if (this.selectOnFocus()) this.selectTab(index);
  }

  private focusTab(index: number): void {
    const buttons = this.tabButtons();
    if (buttons && buttons[index]) {
      buttons[index].nativeElement.focus();
    }
  }

  closeTab(index: number, event: Event): void {
    const tab = this.visibleTabs()[index];
    if (!tab || !tab.closable() || tab.disabled()) return;
    this.onClose.emit({ originalEvent: event, index, tab });
    if (this.controlClose()) return;
    tab.closed.set(true);
    const nextIndex = Math.min(this.activeIndex(), Math.max(0, this.visibleTabs().length - 1));
    this.selectedIndex.set(nextIndex);
    this.value.set(nextIndex);
  }
}
