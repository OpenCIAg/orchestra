import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@ciag/orchestra/icon';
import { DOCS_LOCALE } from '../../i18n/docs-ui';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { DocTextComponent } from '../../shared/doc-text/doc-text.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { gettingStartedContent } from './getting-started.content';

/** Introdução, instalação, rótulos e princípios (textos por locale). */
@Component({
  selector: 'app-getting-started',
  standalone: true,
  imports: [
    RouterLink,
    IconComponent,
    CodeBlockComponent,
    DocTextComponent,
    FooterComponent,
  ],
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedComponent {
  protected readonly content = gettingStartedContent(DOCS_LOCALE);
}
