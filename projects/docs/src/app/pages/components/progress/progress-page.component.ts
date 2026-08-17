import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ProgressBarComponent,
  ProgressCircleComponent,
  ProgressMode,
  ProgressVariant,
  ProgressSize,
} from '@ciag/orchestra/progress';
import {
  StepperComponent,
  StepItem,
  StepperOrientation,
  StepperType,
} from '@ciag/orchestra/stepper';
import { FooterComponent } from '../../../shared/footer/footer.component';

export type PlaygroundTab = 'bar' | 'circle' | 'segmented' | 'stepper';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProgressBarComponent,
    ProgressCircleComponent,
    StepperComponent,
    FooterComponent,
  ],
  templateUrl: './progress-page.component.html',
  styleUrl: './progress-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPageComponent implements OnDestroy {
  // ── Active Playground Tab ─────────────────────────────────
  readonly activeTab = signal<PlaygroundTab>('bar');

  // ── 1. Progress Bar Playground Signals ────────────────────
  readonly barValue = signal<number>(65);
  readonly barMode = signal<ProgressMode>('determinate');
  readonly barVariant = signal<ProgressVariant>('primary');
  readonly barSize = signal<ProgressSize>('md');
  readonly barLabel = signal<string>('Progresso');
  readonly barShowValue = signal<boolean>(true);
  readonly barRounded = signal<boolean>(true);

  // ── 2. Progress Circle Playground Signals ─────────────────
  readonly circleValue = signal<number>(75);
  readonly circleMode = signal<ProgressMode>('determinate');
  readonly circleVariant = signal<ProgressVariant>('primary');
  readonly circleSize = signal<ProgressSize | number>('md');
  readonly circleStrokeWidth = signal<number | undefined>(undefined);
  readonly circleShowValue = signal<boolean>(true);
  readonly circleRounded = signal<boolean>(true);

  // ── 3. Segmented Progress Playground Signals ──────────────
  readonly segTotal = signal<number>(4);
  readonly segCurrent = signal<number>(2);
  readonly segVariant = signal<ProgressVariant>('success');
  readonly segHeight = signal<number>(6);

  // ── 4. Stepper Playground Signals ─────────────────────────
  readonly stepperOrientation = signal<StepperOrientation>('horizontal');
  readonly stepperType = signal<StepperType>('numeric');
  readonly stepperCurrentIndex = signal<number>(1);
  readonly stepperClickable = signal<boolean>(true);
  readonly stepperLinear = signal<boolean>(false);
  readonly stepperActiveProgress = signal<number>(78);

  // Stepper items definidos para os modos
  readonly numericSteps = signal<StepItem[]>([
    { id: 1, title: 'Step 1', subtitle: 'Informações iniciais' },
    { id: 2, title: 'Step 2', subtitle: 'Configurações de conta' },
    { id: 3, title: 'Step 3', subtitle: 'Revisão e envio' },
  ]);

  readonly iconSteps = signal<StepItem[]>([
    { id: 'personal', title: 'Personal info', subtitle: 'Lorem Ipsum is simply', icon: '👤' },
    { id: 'social', title: 'Social accounts', subtitle: 'Lorem Ipsum is simply', icon: '🔗' },
    { id: 'payment', title: 'Payment info', subtitle: 'Lorem Ipsum is simply', icon: '💳' },
  ]);

  readonly verticalProcessSteps = computed<StepItem[]>(() => [
    {
      id: 'upload',
      title: 'Upload',
      subtitle: 'Arquivo enviado com sucesso',
      icon: '✓',
    },
    {
      id: 'process',
      title: 'Processando',
      subtitle: 'Validando dados...',
      progress: this.stepperActiveProgress(),
    },
    {
      id: 'finish',
      title: 'Finalização',
      subtitle: 'Aguardando etapa anterior',
    },
  ]);

  readonly activeStepperSteps = computed<StepItem[]>(() => {
    if (this.stepperOrientation() === 'vertical') {
      return this.verticalProcessSteps();
    }
    return this.stepperType() === 'numeric' ? this.numericSteps() : this.iconSteps();
  });

  // ── Simulações de Progresso em Tempo Real ─────────────────
  readonly isSimulatingBar = signal<boolean>(false);
  readonly isSimulatingCircle = signal<boolean>(false);
  private barInterval: any = null;
  private circleInterval: any = null;

  toggleBarSimulation(): void {
    if (this.isSimulatingBar()) {
      this.stopBarSimulation();
    } else {
      this.isSimulatingBar.set(true);
      this.barValue.set(0);
      this.barInterval = setInterval(() => {
        this.barValue.update(v => {
          if (v >= 100) {
            this.stopBarSimulation();
            return 100;
          }
          return Math.min(100, v + Math.floor(Math.random() * 8) + 2);
        });
      }, 200);
    }
  }

  stopBarSimulation(): void {
    if (this.barInterval) {
      clearInterval(this.barInterval);
      this.barInterval = null;
    }
    this.isSimulatingBar.set(false);
  }

  toggleCircleSimulation(): void {
    if (this.isSimulatingCircle()) {
      this.stopCircleSimulation();
    } else {
      this.isSimulatingCircle.set(true);
      this.circleValue.set(0);
      this.circleInterval = setInterval(() => {
        this.circleValue.update(v => {
          if (v >= 100) {
            this.stopCircleSimulation();
            return 100;
          }
          return Math.min(100, v + Math.floor(Math.random() * 8) + 2);
        });
      }, 200);
    }
  }

  stopCircleSimulation(): void {
    if (this.circleInterval) {
      clearInterval(this.circleInterval);
      this.circleInterval = null;
    }
    this.isSimulatingCircle.set(false);
  }

  // Métodos de controle de etapas
  nextSegment(): void {
    this.segCurrent.update(c => Math.min(this.segTotal(), c + 1));
  }

  prevSegment(): void {
    this.segCurrent.update(c => Math.max(0, c - 1));
  }

  nextStep(): void {
    const max = this.activeStepperSteps().length - 1;
    this.stepperCurrentIndex.update(idx => Math.min(max, idx + 1));
  }

  prevStep(): void {
    this.stepperCurrentIndex.update(idx => Math.max(0, idx - 1));
  }

  resetStepper(): void {
    this.stepperCurrentIndex.set(0);
  }

  onStepSelected(event: { step: StepItem; index: number }): void {
    this.stepperCurrentIndex.set(event.index);
  }

  ngOnDestroy(): void {
    this.stopBarSimulation();
    this.stopCircleSimulation();
  }
}
