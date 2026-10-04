import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  effect,
  booleanAttribute,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '@ciag/orchestra/progress';
import {
  StepperOrientation,
  StepperType,
  StepStatus,
  StepItem,
} from './stepper.types';

@Component({
  selector: 'orc-stepper, orc-steps',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  // ── Inputs & Models ───────────────────────────────────────
  /** Lista de etapas a serem exibidas */
  readonly steps = input<StepItem[]>([]);

  /** Índice da etapa ativa atual (0-indexed) */
  readonly currentStep = model<number>(0);
  readonly activeIndex = model<number>(0, { alias: 'activeIndex' });
  readonly model = input<StepItem[] | undefined>(undefined);
  readonly readonly = input(false, { transform: booleanAttribute });
  /** @deprecated Compatibility-only input; exact-match navigation is not implemented. */
  readonly exact = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');

  /** Orientação do layout: 'horizontal' ou 'vertical' */
  readonly orientation = input<StepperOrientation>('horizontal');

  /** Estilo dos marcadores de etapa: 'numeric' (1, 2, 3...) ou 'icon' */
  readonly type = input<StepperType>('numeric');

  /** Permite que o usuário clique nos passos para navegar */
  readonly clickable = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  /** Automatically activate a step when it receives keyboard focus. */
  readonly selectOnFocus = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** Accessible label for the stepper navigation. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Modo linear: impede pular etapas à frente */
  readonly linear = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** Evento emitido quando o usuário clica em uma etapa */
  readonly stepChange = output<{ step: StepItem; index: number }>();
  readonly onChange = output<{ index: number; step: StepItem }>();
  readonly completed = output<void>();
  readonly effectiveSteps = computed(() => this.model() ?? this.steps());

  private boundStep(index: number): number {
    const count = this.effectiveSteps().length;
    if (!count || !Number.isFinite(index)) return 0;
    return Math.min(count - 1, Math.max(0, Math.trunc(index)));
  }

  private firstReachable(preferred: number): number {
    const steps = this.effectiveSteps();
    if (!steps.length) return 0;
    if (steps[preferred] && this.isStepClickable(preferred, steps[preferred])) {
      return preferred;
    }
    const first = steps.findIndex((step, index) =>
      this.isStepClickable(index, step),
    );
    return first >= 0 ? first : 0;
  }

  constructor() {
    effect(() => {
      const current = this.boundStep(this.currentStep());
      const active = this.boundStep(this.activeIndex());
      if (this.currentStep() !== current) this.currentStep.set(current);
      if (this.activeIndex() !== active) this.activeIndex.set(active);
      if (!this.initialized) {
        this.initialized = true;
        this.lastCurrentStep = current;
        this.lastActiveIndex = active;
        if (current !== active) {
          if (current !== 0 || active === 0) this.activeIndex.set(current);
          else this.currentStep.set(active);
        }
        this.focusedIndex.set(this.firstReachable(current));
        return;
      }
      const currentChanged = current !== this.lastCurrentStep;
      const activeChanged = active !== this.lastActiveIndex;
      if (currentChanged && !activeChanged) this.activeIndex.set(current);
      else if (activeChanged) this.currentStep.set(active);
      if (currentChanged || activeChanged) {
        this.focusedIndex.set(this.firstReachable(this.currentStep()));
      }
      const reachable = this.reachableIndices();
      if (!reachable.includes(this.focusedIndex() ?? -1)) {
        this.focusedIndex.set(reachable[0] ?? 0);
      }
      this.lastCurrentStep = current;
      this.lastActiveIndex = active;
    });
  }

  private initialized = false;
  private lastCurrentStep = 0;
  private lastActiveIndex = 0;
  readonly focusedIndex = signal<number | undefined>(undefined);

  // ── Helpers & Métodos ─────────────────────────────────────
  getStepStatus(index: number, step: StepItem): StepStatus {
    if (step.status && step.status !== 'active') return step.status;
    const current = this.currentStep();
    if (index === current && step.status === 'active') return 'active';
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return 'pending';
  }

  isStepClickable(index: number, step: StepItem): boolean {
    if (step.disabled || this.readonly() || !this.clickable()) return false;
    if (this.linear() && index > this.currentStep() + 1) return false;
    return true;
  }

  private reachableIndices(): number[] {
    return this.effectiveSteps()
      .map((step, index) => (this.isStepClickable(index, step) ? index : -1))
      .filter((index) => index >= 0);
  }

  selectStep(index: number, step: StepItem): void {
    if (!step) return;
    if (!this.isStepClickable(index, step)) return;
    if (this.currentStep() === index) return;
    this.currentStep.set(index);
    this.activeIndex.set(index);
    this.focusedIndex.set(index);
    this.stepChange.emit({ step, index });
    this.onChange.emit({ index, step });
    if (index === this.effectiveSteps().length - 1) this.completed.emit();
  }

  onFocus(index: number): void {
    const step = this.effectiveSteps()[index];
    if (!step || !this.isStepClickable(index, step)) return;
    this.focusedIndex.set(index);
    if (this.selectOnFocus() && index !== this.currentStep()) {
      this.selectStep(index, step);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const steps = this.effectiveSteps();
    const reachable = this.reachableIndices();
    if (!steps.length || !reachable.length) return;

    let target = -1;
    const rtl =
      this.orientation() === 'horizontal' &&
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
      target = reachable.find((candidate) => candidate > index) ?? -1;
    } else if (backward || event.key === 'ArrowUp') {
      target =
        [...reachable].reverse().find((candidate) => candidate < index) ?? -1;
    } else if (event.key === 'Home') {
      target = reachable[0];
    } else if (event.key === 'End') {
      target = reachable.at(-1) ?? -1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectStep(index, steps[index]);
      return;
    } else {
      return;
    }

    event.preventDefault();
    if (target < 0 || target === index) return;
    const buttons = this.host.nativeElement.querySelectorAll(
      '.orc-stepper__step-btn',
    );
    (buttons[target] as HTMLElement | undefined)?.focus();
  }

  next(): void {
    this.selectStep(
      this.currentStep() + 1,
      this.effectiveSteps()[this.currentStep() + 1],
    );
  }
  previous(): void {
    this.selectStep(
      this.currentStep() - 1,
      this.effectiveSteps()[this.currentStep() - 1],
    );
  }
  reset(): void {
    this.currentStep.set(0);
    this.activeIndex.set(0);
    this.focusedIndex.set(0);
  }

  isConnectorCompleted(index: number): boolean {
    return index < this.currentStep();
  }
}
