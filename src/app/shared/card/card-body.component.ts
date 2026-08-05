import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card-body',
  standalone: true,
  templateUrl: './card-body.component.html',
  styleUrl: './card-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBodyComponent {}
