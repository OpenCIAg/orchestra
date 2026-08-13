import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EasterEggComponent } from './shared/easter-egg/easter-egg.component';
import { EasterEggService } from './services/easter-egg.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EasterEggComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private easterEggService = inject(EasterEggService);
  isOpen = this.easterEggService.isOpen;
}
