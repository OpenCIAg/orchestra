import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  input,
  model,
  output,
  computed,
  contentChildren,
  ElementRef,
  effect,
  inject,
  booleanAttribute,
  signal,
  viewChild,
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
export class TabGroupComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  // Inputs & Model (Signals API)
  readonly selectedIndex = model<number>(0);
  readonly value = model<string | number | undefined>(undefined, {
    alias: 'value',
  });
  readonly variant = input<TabVariant>('line');
  readonly size = input<TabSize>('md');
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly selectOnFocus = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly controlClose = input(false, { transform: booleanAttribute });
  readonly showNavigators = input(true, { transform: booleanAttribute });
  readonly nextButtonAriaLabel = input<string | undefined>(undefined);
  readonly prevButtonAriaLabel = input<string | undefined>(undefined);
  readonly autoHideButtons = input(true, { transform: booleanAttribute });
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  readonly tabindex = input(0);
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  // Outputs (Signals API)
  readonly tabChange = output<TabChangeEvent>();
  readonly onChange = output<TabChangeEvent>();
  readonly tabFocus = output<{ index: number; tab: TabComponent }>();
  readonly onClose = output<{
    originalEvent: Event;
    index: number;
    tab: TabComponent;
  }>();

  // Abas filhas registradas via contentChildren
  readonly tabs = contentChildren(TabComponent);
  readonly visibleTabs = computed(() =>
    this.tabs().filter((tab) => !tab.closed()),
  );
  readonly loadedTabs = new Set<TabComponent>();
  private readonly selectionIntent = signal<number | string | undefined>(
    undefined,
  );
  private lastSelectedIndex = this.selectedIndex();
  private lastValue = this.value();
  private initialized = false;
  readonly focusedIndex = signal<number | undefined>(undefined);

  // Referências dos botões de abas para navegação por teclado e foco programático
  readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');
  readonly tabHeader = viewChild<ElementRef<HTMLElement>>('tabHeader');
  readonly navigation = signal({ previous: false, next: false });
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private readonly observedTabItems = new Set<HTMLElement>();
  private rtlScrollMode?: 'negative' | 'positive';
  private focusRequest = 0;
  private destroyed = false;
  readonly activeIndex = computed(() => {
    const intent = this.selectionIntent();
    if (typeof intent === 'number') return this.boundIndex(intent);
    if (typeof intent === 'string') {
      const index = this.visibleTabs().findIndex(
        (tab) => tab.tabId() === intent,
      );
      if (index >= 0) return index;
    }
    const selectedTab = this.visibleTabs().findIndex((tab) => tab.selected());
    return selectedTab >= 0
      ? selectedTab
      : this.boundIndex(this.selectedIndex());
  });

  constructor() {
    effect(() => {
      const selectedIndex = this.selectedIndex();
      const value = this.value();
      const selectedChanged = selectedIndex !== this.lastSelectedIndex;
      const valueChanged = value !== this.lastValue;

      if (!this.initialized) {
        this.initialized = true;
        this.lastSelectedIndex = selectedIndex;
        this.lastValue = value;
        if (value !== undefined) this.selectionIntent.set(value);
      } else if (selectedChanged || valueChanged) {
        // If both aliases change in one update, `value` is the deterministic
        // winner. A single-alias update keeps that alias as the intent.
        this.selectionIntent.set(valueChanged ? value : selectedIndex);
        this.lastSelectedIndex = selectedIndex;
        this.lastValue = value;
        this.focusedIndex.set(this.activeIndex());
      }

      const visible = this.visibleTabs();
      const activeIndex = this.activeIndex();
      const active = visible[activeIndex];
      if (active) this.loadedTabs.add(active);
      const focused = this.focusedIndex();
      if (
        focused === undefined ||
        !visible[focused] ||
        visible[focused].disabled()
      ) {
        this.focusedIndex.set(
          visible.length ? this.nearestEnabledIndex(activeIndex) : 0,
        );
      }
      for (const tab of this.loadedTabs) {
        if (!visible.includes(tab) || tab.closed()) this.loadedTabs.delete(tab);
      }
    });
  }

  private boundIndex(index: number): number {
    const count = this.visibleTabs().length;
    if (!count || !Number.isFinite(index)) return 0;
    return Math.min(count - 1, Math.max(0, Math.trunc(index)));
  }

  ngAfterViewInit(): void {
    this.updateNavigation();
    const header = this.tabHeader()?.nativeElement;
    const view = this.host.nativeElement.ownerDocument?.defaultView;
    if (header && view?.ResizeObserver) {
      const observer = new view.ResizeObserver(() => this.updateNavigation());
      observer.observe(header);
      this.observeTabItems(observer, header);
      this.resizeObserver = observer;
    }
    if (header && view?.MutationObserver) {
      const observer = new view.MutationObserver(() => {
        if (this.resizeObserver)
          this.observeTabItems(this.resizeObserver, header);
        this.updateNavigation();
      });
      observer.observe(header, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });
      this.mutationObserver = observer;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.focusRequest++;
    this.resizeObserver?.disconnect();
    this.observedTabItems.clear();
    this.mutationObserver?.disconnect();
  }

  updateNavigation(): void {
    const header = this.tabHeader()?.nativeElement;
    if (!header) return;
    const max = this.maxScroll(header);
    const logicalLeft = this.logicalScrollLeft(header, max);
    const state = {
      previous: logicalLeft > 1,
      next: max - logicalLeft > 1,
    };
    const current = this.navigation();
    if (current.previous !== state.previous || current.next !== state.next) {
      this.navigation.set(state);
    }
  }

  scrollTabs(direction: 'previous' | 'next'): void {
    const header = this.tabHeader()?.nativeElement;
    if (!header) return;
    const max = this.maxScroll(header);
    const amount = Math.max(1, Math.floor(header.clientWidth * 0.8));
    const current = this.logicalScrollLeft(header, max);
    const nextLeft =
      direction === 'next'
        ? Math.min(max, current + amount)
        : Math.max(0, current - amount);
    if (this.isRtl()) {
      header.scrollLeft = -nextLeft;
      if (nextLeft > 0 && header.scrollLeft === 0) {
        header.scrollLeft = nextLeft;
        if (header.scrollLeft > 0) this.rtlScrollMode = 'positive';
      } else if (nextLeft > 0 && header.scrollLeft < 0) {
        this.rtlScrollMode = 'negative';
      }
    } else {
      header.scrollLeft = nextLeft;
    }
    this.updateNavigation();
  }

  isRtl(): boolean {
    const element = this.tabHeader()?.nativeElement ?? this.host.nativeElement;
    return (
      this.host.nativeElement.ownerDocument.defaultView?.getComputedStyle(
        element,
      ).direction === 'rtl'
    );
  }

  private maxScroll(header: HTMLElement): number {
    return Math.max(0, header.scrollWidth - header.clientWidth);
  }

  private logicalScrollLeft(header: HTMLElement, max: number): number {
    if (!this.isRtl()) {
      return Math.min(max, Math.max(0, header.scrollLeft));
    }
    if (header.scrollLeft < 0) {
      this.rtlScrollMode = 'negative';
      return Math.min(max, -header.scrollLeft);
    }
    if (this.rtlScrollMode === 'positive') {
      return Math.min(max, Math.max(0, header.scrollLeft));
    }
    return 0;
  }

  private observeTabItems(observer: ResizeObserver, header: HTMLElement): void {
    const current = new Set(
      Array.from(
        header.querySelectorAll<HTMLElement>('.orc-tab-group__tab-item'),
      ),
    );
    for (const item of this.observedTabItems) {
      if (!current.has(item)) {
        observer.unobserve(item);
        this.observedTabItems.delete(item);
      }
    }
    for (const item of current) {
      if (!this.observedTabItems.has(item)) {
        observer.observe(item);
        this.observedTabItems.add(item);
      }
    }
  }

  private nearestEnabledIndex(index: number): number {
    const tabs = this.visibleTabs();
    const start = Math.min(tabs.length - 1, Math.max(0, index));
    for (let candidate = start; candidate < tabs.length; candidate++) {
      const tab = tabs[candidate];
      if (tab && !tab.disabled()) return candidate;
    }
    for (let candidate = start - 1; candidate >= 0; candidate--) {
      const tab = tabs[candidate];
      if (tab && !tab.disabled()) return candidate;
    }
    return this.boundIndex(start);
  }

  // ── Seleção de Aba ────────────────────────────────────────
  selectTab(index: number): void {
    const tabList = this.visibleTabs();
    if (index < 0 || index >= tabList.length) return;

    const targetTab = tabList[index];
    if (targetTab.disabled()) return;
    if (this.activeIndex() === index) return;

    this.selectedIndex.set(index);
    this.value.set(index);
    this.lastSelectedIndex = index;
    this.lastValue = index;
    this.selectionIntent.set(index);
    this.focusedIndex.set(index);
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
      .filter((idx) => idx !== -1);

    if (enabledIndices.length === 0) return;

    const currentPos = enabledIndices.indexOf(currentIndex);
    let targetIndex = -1;

    const rtl =
      this.host.nativeElement.ownerDocument.defaultView?.getComputedStyle(
        this.host.nativeElement,
      ).direction === 'rtl';
    const forward = rtl
      ? event.key === 'ArrowLeft'
      : event.key === 'ArrowRight';
    const backward = rtl
      ? event.key === 'ArrowRight'
      : event.key === 'ArrowLeft';

    if (forward || event.key === 'ArrowDown') {
      event.preventDefault();
      targetIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
    } else if (backward || event.key === 'ArrowUp') {
      event.preventDefault();
      targetIndex =
        enabledIndices[
          (currentPos - 1 + enabledIndices.length) % enabledIndices.length
        ];
    } else if (event.key === 'Home') {
      event.preventDefault();
      targetIndex = enabledIndices[0];
    } else if (event.key === 'End') {
      event.preventDefault();
      targetIndex = enabledIndices[enabledIndices.length - 1];
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.selectTab(currentIndex);
      return;
    }

    if (targetIndex !== -1) {
      this.focusTab(targetIndex);
    }
  }

  onFocus(index: number): void {
    const tab = this.visibleTabs()[index];
    if (!tab || tab.disabled()) return;
    this.focusedIndex.set(index);
    this.tabFocus.emit({ index, tab });
    if (this.selectOnFocus() && this.activeIndex() !== index)
      this.selectTab(index);
  }

  private focusTab(index: number): boolean {
    const buttons = this.tabButtons();
    if (buttons && buttons[index]) {
      buttons[index].nativeElement.focus();
      return true;
    }
    return false;
  }

  closeTab(index: number, event: Event): void {
    const tab = this.visibleTabs()[index];
    if (!tab || !tab.closable() || tab.disabled()) return;
    // Invalidate any pending recovery before a new close is processed. A
    // consumer-controlled close may leave the old tab in place, but it still
    // must not allow an earlier microtask to steal focus later.
    const request = ++this.focusRequest;
    this.onClose.emit({ originalEvent: event, index, tab });
    if (this.controlClose()) return;
    const documentRef = this.host.nativeElement.ownerDocument;
    const activeElement = documentRef.activeElement;
    const target = event.target;
    const ElementConstructor = documentRef.defaultView?.Element;
    const item =
      !!ElementConstructor && target instanceof ElementConstructor
        ? (target as Element).closest('.orc-tab-group__tab-item')
        : null;
    const hadFocus = !!item && !!activeElement && item.contains(activeElement);
    const previousActive = this.activeIndex();
    tab.closed.set(true);
    this.loadedTabs.delete(tab);
    const nextIndex = this.nearestEnabledIndex(
      index < previousActive ? previousActive - 1 : previousActive,
    );
    this.selectedIndex.set(nextIndex);
    this.value.set(nextIndex);
    this.lastSelectedIndex = nextIndex;
    this.lastValue = nextIndex;
    this.selectionIntent.set(nextIndex);
    this.focusedIndex.set(nextIndex);
    if (hadFocus) {
      queueMicrotask(() => {
        if (this.destroyed || request !== this.focusRequest) return;
        if (
          documentRef.activeElement !== activeElement &&
          documentRef.activeElement !== documentRef.body
        ) {
          return;
        }
        this.focusTab(nextIndex);
      });
    }
  }
}
