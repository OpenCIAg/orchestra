import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EasterEggComponent } from './shared/easter-egg/easter-egg.component';
import { EasterEggService } from './services/easter-egg.service';
import { ThemeToggleComponent } from './shared/theme-toggle/theme-toggle.component';
import { SiteHeaderComponent } from './shared/site-header/site-header.component';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EasterEggComponent, ThemeToggleComponent, SiteHeaderComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private easterEggService = inject(EasterEggService);
  private readonly seoService = inject(SeoService);
  isOpen = this.easterEggService.isOpen;
}
