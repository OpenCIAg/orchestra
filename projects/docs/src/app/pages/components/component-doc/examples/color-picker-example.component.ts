import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ColorPickerComponent } from '@ciag/orchestra/color-picker';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-color-picker-example',
  standalone: true,
  imports: [ColorPickerComponent],
  template: `
    <div class="example-grid example-grid--two">
      <div class="example">
        <span class="example__label">Default + presets</span>
        <orc-color-picker
          label="Cor de destaque"
          [(value)]="accent"
          [presets]="colorPresets"
        />
        <div class="color-value" [style.background]="accent()">
          {{ accent() }}
        </div>
      </div>
      <div class="example">
        <span class="example__label">No text input</span>
        <orc-color-picker
          label="Apenas swatch"
          value="#FF6A1C"
          [showInput]="false"
        />
      </div>
      <div class="example">
        <span class="example__label">Clearable</span>
        <orc-color-picker
          label="Cor opcional"
          value="#1CEDB9"
          [clearable]="true"
        />
      </div>
      <div class="example">
        <span class="example__label">Disabled</span>
        <orc-color-picker
          label="Token protegido"
          value="#0406AB"
          [disabled]="true"
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly accent = signal('#1C6AED');
  readonly colorPresets = ['#1C6AED', '#0406AB', '#FF6A1C', '#1CEDB9'];

  ngOnInit(): void {
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ value: this.accent(), state: 'hexadecimal' });
  }
}
