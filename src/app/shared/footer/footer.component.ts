import { Component, inject } from '@angular/core';
import { EasterEggService } from '../../services/easter-egg.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private easterEggService = inject(EasterEggService);

  triggerEasterEgg() {
    this.easterEggService.trigger();
  }
}
