
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RatingComponent } from '../../../shared/rating/rating.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-rating-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RatingComponent, FooterComponent],
  templateUrl: './rating-page.component.html',
  styleUrl: './rating-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingPageComponent {
  readonly standardRating = signal(3);
  readonly halfRating = signal(2.5);
  readonly numericRating = signal(8);
  readonly customRating = signal(4);

  readonly tooltips = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'];
  readonly npsTooltips = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    service: [4],
    product: [4.5],
  });

  readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
}
