import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'orc-card-header',
  standalone: true,
  templateUrl: './card-header.component.html',
  styleUrl: './card-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderComponent {}
