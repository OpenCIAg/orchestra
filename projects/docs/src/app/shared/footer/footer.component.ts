import {
  ChangeDetectionStrategy,
  Component,
  inject,
  VERSION,
} from '@angular/core';
import { EasterEggService } from '../../services/easter-egg.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly angularMajor = VERSION.major;
  private easterEggService = inject(EasterEggService);

  triggerEasterEgg() {
    this.easterEggService.trigger();
  }
}
