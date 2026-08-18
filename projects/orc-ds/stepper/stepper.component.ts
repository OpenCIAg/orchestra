import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
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
  selector: 'orc-stepper',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
  // ── Inputs & Models ───────────────────────────────────────
  /** Lista de etapas a serem exibidas */
  readonly steps = input<StepItem[]>([]);

  /** Índice da etapa ativa atual (0-indexed) */
  readonly currentStep = model<number>(0);
  readonly activeIndex = model<number>(0, { alias: 'activeIndex' });
  readonly model = input<StepItem[] | undefined>(undefined);
  readonly readonly = input(false);
  readonly exact = input(false);
  readonly style = input<Record<string, string> | null>(null);
  readonly styleClass = input('');

  /** Orientação do layout: 'horizontal' ou 'vertical' */
  readonly orientation = input<StepperOrientation>('horizontal');

  /** Estilo dos marcadores de etapa: 'numeric' (1, 2, 3...) ou 'icon' */
  readonly type = input<StepperType>('numeric');

  /** Permite que o usuário clique nos passos para navegar */
  readonly clickable = input<boolean>(true);

  /** Automatically activate a step when it receives keyboard focus. */
  readonly selectOnFocus = input<boolean>(false);

  /** Accessible label for the stepper navigation. */
  readonly ariaLabel = input<string>('Steps');

  /** Modo linear: impede pular etapas à frente */
  readonly linear = input<boolean>(false);

  /** Evento emitido quando o usuário clica em uma etapa */
  readonly stepChange = output<{ step: StepItem; index: number }>();
  readonly onChange = output<{ index: number; step: StepItem }>();
  readonly completed = output<void>();

  // ── Helpers & Métodos ─────────────────────────────────────
  getStepStatus(index: number, step: StepItem): StepStatus {
    if (step.status) return step.status;
    const current = this.currentStep();
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return 'pending';
  }

  isStepClickable(index: number, step: StepItem): boolean {
    if (step.disabled || !this.clickable()) return false;
    if (this.linear() && index > this.currentStep() + 1) return false;
    return true;
  }

  selectStep(index: number, step: StepItem): void {
    if (!step) return;
    if (!this.isStepClickable(index, step)) return;
    this.currentStep.set(index);
    this.stepChange.emit({ step, index });
    this.onChange.emit({ index, step });
    if (index === this.steps().length - 1) this.completed.emit();
  }

  next(): void { this.selectStep(this.currentStep() + 1, this.steps()[this.currentStep() + 1]); }
  previous(): void { this.selectStep(this.currentStep() - 1, this.steps()[this.currentStep() - 1]); }
  reset(): void { this.currentStep.set(0); }

  isConnectorCompleted(index: number): boolean {
    return index < this.currentStep();
  }
}
