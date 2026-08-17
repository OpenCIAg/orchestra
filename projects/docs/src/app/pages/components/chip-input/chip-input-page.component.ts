import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { ChipInputComponent } from '@ciag/orchestra/chip-input';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chip-input-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ChipInputComponent,
    FooterComponent
  ],
  templateUrl: './chip-input-page.component.html',
  styleUrl: './chip-input-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipInputPageComponent {
  availableSkills = ['Angular', 'React', 'Vue', 'Svelte', 'Figma', 'TypeScript', 'Node.js', 'RxJS'];
  
  form = new FormGroup({
    skills: new FormControl<string[]>(['TypeScript', 'Figma'])
  });

  readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
}
