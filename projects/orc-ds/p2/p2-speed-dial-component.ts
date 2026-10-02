import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { P2Option, P2_SHARED_STYLES } from './p2-shared';

export interface SpeedDialAction extends P2Option<string> {
  color?: string;
}

type SpeedDialDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right';

@Component({
  selector: 'orc-speed-dial',
  standalone: true,
  template: `<div class="orc-p2-speed-dial-host">
    @if (mask() && open()) {
      <div
        class="orc-p2-speed-dial__mask"
        aria-hidden="true"
        (click)="onMaskClick($event)"
      ></div>
    }
    <div
      [class]="rootClasses()"
      [attr.data-direction]="direction()"
      [attr.data-type]="type()"
    >
      <button
        type="button"
        [class]="'trigger ' + buttonClass()"
        [disabled]="disabled()"
        [attr.aria-expanded]="open()"
        [attr.aria-haspopup]="'menu'"
        [attr.aria-label]="
          ariaLabel() || (open() ? closeLabel() : openLabel()) || null
        "
        (keydown)="onTriggerKeydown($event)"
        (click)="toggleButton($event)"
      >
        {{ open() ? '×' : icon() }}
      </button>
      <div
        class="actions"
        [class.open]="open()"
        [attr.role]="open() ? 'menu' : null"
        [attr.aria-label]="ariaLabel() || null"
      >
        @if (open()) {
          @for (action of effectiveActions(); track action.value) {
            <button
              type="button"
              class="action"
              [style]="actionStyle($index)"
              [style.background]="action.color || null"
              [disabled]="disabled() || action.disabled"
              [attr.tabindex]="actionTabIndex($index)"
              [attr.role]="'menuitem'"
              [attr.aria-label]="action.label || null"
              [attr.aria-disabled]="
                action.disabled || disabled() ? 'true' : null
              "
              (keydown)="onActionKeydown($event, $index)"
              (click)="activate(action)"
            >
              {{ action.icon }}
            </button>
          }
        }
      </div>
    </div>
  </div>`,
  styles: [
    P2_SHARED_STYLES +
      `.orc-p2-speed-dial-host{position:relative;display:inline-block;isolation:isolate;direction:inherit}.orc-p2-speed-dial{--orc-speed-dial-button-size:2.6rem;position:relative;z-index:1;display:inline-grid;width:var(--orc-speed-dial-button-size);height:var(--orc-speed-dial-button-size);place-items:center;direction:inherit}.orc-p2-speed-dial__mask{position:fixed;z-index:0;inset:0;background:var(--orc-component-scrim);cursor:default}.actions{position:absolute;z-index:1;inset:0;pointer-events:none}.actions.open{pointer-events:auto}.actions .action,.trigger{display:grid;place-items:center;width:var(--orc-speed-dial-button-size);height:var(--orc-speed-dial-button-size);border:0;border-radius:999px;background:var(--orc-component-surface-subtle);color:var(--orc-component-text);font:inherit}.actions .action{position:absolute;inset:50% auto auto 50%;margin:0;transform-origin:center;white-space:nowrap;transition:transform 180ms cubic-bezier(.4,0,.2,1),opacity 180ms ease,background-color 120ms ease,color 120ms ease;will-change:transform,opacity}.actions .action:hover:not(:disabled),.actions .action:focus-visible{background:var(--orc-component-interactive-soft);color:var(--orc-component-interactive)}.trigger{position:relative;z-index:2;background:var(--orc-component-interactive);color:var(--orc-component-on-interactive);font-size:1.3rem;transition:transform 180ms ease,background-color 120ms ease}.trigger:hover:not(:disabled){background:var(--orc-component-interactive-hover)}.orc-p2-speed-dial.p-speeddial-open .trigger{transform:rotate(45deg)}.orc-p2-speed-dial.p-speeddial-open .actions .action{opacity:1}.orc-p2-speed-dial:not(.p-speeddial-open) .actions .action{opacity:0;pointer-events:none}.orc-p2-speed-dial.p-disabled{opacity:.7}.orc-p2-speed-dial__mask + .orc-p2-speed-dial{z-index:1}@media (max-width:30rem){.orc-p2-speed-dial{--orc-speed-dial-button-size:2.35rem}}@media (prefers-reduced-motion:reduce){.actions .action,.trigger{transition:none!important}}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDialComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private ownerDocument: Document | null = null;
  private readonly documentMouseDown = (event: MouseEvent): void =>
    this.onDocumentClick(event);
  readonly actions = input<SpeedDialAction[]>([]);
  readonly model = input<SpeedDialAction[] | null>(null);
  readonly direction = input<SpeedDialDirection>('up');
  readonly type = input<'linear' | 'circle' | 'semi-circle' | 'quarter-circle'>(
    'linear',
  );
  readonly radius = input(0);
  readonly transitionDelay = input(0);
  readonly mask = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hideOnClickOutside = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly buttonClass = input('');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly open = model(false);
  readonly activeActionIndex = signal(-1);
  readonly icon = input('+');
  readonly openLabel = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly actionSelect = output<SpeedDialAction>();
  readonly visibleChange = output<boolean>();
  readonly onVisibleChange = output<boolean>();
  readonly onShow = output<Event>();
  readonly onHide = output<Event>();
  readonly onClick = output<MouseEvent>();

  ngAfterViewInit(): void {
    const ownerDocument = this.host.nativeElement.ownerDocument;
    this.ownerDocument = ownerDocument;
    ownerDocument.addEventListener('mousedown', this.documentMouseDown);
  }

  ngOnDestroy(): void {
    this.ownerDocument?.removeEventListener(
      'mousedown',
      this.documentMouseDown,
    );
    this.ownerDocument = null;
  }
  readonly rootClasses = computed(() =>
    [
      'orc-p2-speed-dial',
      'p-component',
      `p-speeddial-${this.type()}`,
      `p-speeddial-direction-${this.direction()}`,
      this.open() ? 'p-speeddial-open' : '',
      this.disabled() ? 'p-disabled' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );
  effectiveActions(): SpeedDialAction[] {
    return this.model() ?? this.actions();
  }
  toggleButton(event: MouseEvent): void {
    this.onClick.emit(event);
    if (this.open()) this.hide(event);
    else this.show(event);
  }
  show(event?: Event): void {
    if (this.disabled()) return;
    this.activeActionIndex.set(this.firstEnabledActionIndex());
    this.open.set(true);
    this.visibleChange.emit(true);
    this.onVisibleChange.emit(true);
    if (event) this.onShow.emit(event);
  }
  hide(event?: Event): void {
    this.open.set(false);
    this.visibleChange.emit(false);
    this.onVisibleChange.emit(false);
    if (event) this.onHide.emit(event);
  }
  activate(action: SpeedDialAction): void {
    if (!this.disabled() && !action.disabled) {
      this.actionSelect.emit(action);
      this.hide();
      this.focusTrigger();
    }
  }
  actionTabIndex(index: number): number {
    return index === this.tabbableActionIndex() ? 0 : -1;
  }
  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open()) return;
    event.preventDefault();
    this.hide(event);
    this.focusTrigger();
  }
  onActionKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide(event);
      this.focusTrigger();
      return;
    }
    const enabled = this.enabledActionIndexes();
    const current = enabled.indexOf(index);
    if (current < 0 || !enabled.length) return;
    let next = current;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = enabled.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
      next = (current + 1) % enabled.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
      next = (current - 1 + enabled.length) % enabled.length;
    else return;
    event.preventDefault();
    this.focusAction(enabled[next]);
  }
  actionStyle(index: number): Record<string, string> {
    const count = this.effectiveActions().length;
    const { x, y } = this.actionOffset(index, count);
    return {
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
      transitionDelay: `${this.actionTransitionDelay(index)}ms`,
    };
  }
  onMaskClick(event: MouseEvent): void {
    if (this.hideOnClickOutside()) this.hide(event);
  }
  onDocumentClick(event: MouseEvent): void {
    if (!this.hideOnClickOutside() || !this.open()) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) this.hide(event);
  }

  private actionTransitionDelay(index: number): number {
    const delay = Number.isFinite(this.transitionDelay())
      ? Math.max(0, this.transitionDelay())
      : 0;
    return index * delay;
  }

  private enabledActionIndexes(): number[] {
    if (this.disabled()) return [];
    return this.effectiveActions().reduce<number[]>(
      (indexes, action, index) => {
        if (!action.disabled) indexes.push(index);
        return indexes;
      },
      [],
    );
  }

  private firstEnabledActionIndex(): number {
    return this.enabledActionIndexes()[0] ?? -1;
  }

  private tabbableActionIndex(): number {
    const enabled = this.enabledActionIndexes();
    if (!enabled.length) return -1;
    return enabled.includes(this.activeActionIndex())
      ? this.activeActionIndex()
      : enabled[0];
  }

  private focusAction(index: number): void {
    if (!this.enabledActionIndexes().includes(index)) return;
    this.activeActionIndex.set(index);
    const actions = Array.from(
      this.host.nativeElement.querySelectorAll('.actions .action'),
    ) as HTMLButtonElement[];
    actions[index]?.focus();
  }

  private focusTrigger(): void {
    const trigger = this.host.nativeElement.querySelector(
      '.trigger',
    ) as HTMLButtonElement | null;
    trigger?.focus();
  }

  private effectiveRadius(count: number): number {
    const radius = this.radius();
    if (Number.isFinite(radius) && radius > 0) return radius;
    return Math.max(1, count * 20);
  }

  private actionOffset(index: number, count: number): { x: number; y: number } {
    const direction = this.direction();
    const type = this.type();
    if (type === 'linear') {
      const distance =
        (Number.isFinite(this.radius()) && this.radius() > 0
          ? this.radius()
          : 3.05 * 16) *
        (index + 1);
      switch (direction) {
        case 'down':
          return { x: 0, y: distance };
        case 'left':
          return { x: -distance, y: 0 };
        case 'right':
          return { x: distance, y: 0 };
        case 'up-left':
          return { x: -distance, y: -distance };
        case 'up-right':
          return { x: distance, y: -distance };
        case 'down-left':
          return { x: -distance, y: distance };
        case 'down-right':
          return { x: distance, y: distance };
        case 'up':
        default:
          return { x: 0, y: -distance };
      }
    }

    const radius = this.effectiveRadius(count);
    const safeCount = Math.max(1, count);
    const sweep =
      type === 'circle'
        ? 2 * Math.PI
        : type === 'semi-circle'
          ? Math.PI
          : Math.PI / 2;
    const startAngle = type === 'circle' ? this.circleStartAngle(direction) : 0;
    const angle =
      startAngle +
      (sweep * index) /
        Math.max(1, type === 'circle' ? safeCount : safeCount - 1);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (type === 'circle') return this.cleanOffset(x, y);
    if (type === 'semi-circle') {
      switch (direction) {
        case 'down':
          return this.cleanOffset(x, y);
        case 'left':
          return this.cleanOffset(-y, x);
        case 'right':
          return this.cleanOffset(y, x);
        case 'up':
        default:
          return this.cleanOffset(x, -y);
      }
    }
    switch (direction) {
      case 'up-left':
        return this.cleanOffset(-x, -y);
      case 'down-left':
        return this.cleanOffset(-y, x);
      case 'down-right':
        return this.cleanOffset(y, x);
      case 'up-right':
      default:
        return this.cleanOffset(x, -y);
    }
  }

  private circleStartAngle(direction: SpeedDialDirection): number {
    switch (direction) {
      case 'up':
        return -Math.PI / 2;
      case 'up-right':
        return -Math.PI / 4;
      case 'right':
        return 0;
      case 'down-right':
        return Math.PI / 4;
      case 'down':
        return Math.PI / 2;
      case 'down-left':
        return (3 * Math.PI) / 4;
      case 'left':
        return Math.PI;
      case 'up-left':
        return (5 * Math.PI) / 4;
      default:
        return -Math.PI / 2;
    }
  }

  private cleanOffset(x: number, y: number): { x: number; y: number } {
    const clean = (value: number): number =>
      Math.abs(value) < 0.000001 ? 0 : Number(value.toFixed(6));
    return { x: clean(x), y: clean(y) };
  }
}
