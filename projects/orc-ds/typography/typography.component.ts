import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ORC_SHARED_STYLES } from '@ciag/orchestra/internal';

@Component({
  selector: 'orc-typography',
  standalone: true,
  template: `@switch (semanticTag()) {
    @case ('p') {
      <p [class]="typographyClass()" [style]="typographyStyle()">
        <ng-content />
      </p>
    }
    @case ('h1') {
      <h1 [class]="typographyClass()" [style]="typographyStyle()">
        <ng-content />
      </h1>
    }
    @case ('h2') {
      <h2 [class]="typographyClass()" [style]="typographyStyle()">
        <ng-content />
      </h2>
    }
    @case ('h3') {
      <h3 [class]="typographyClass()" [style]="typographyStyle()">
        <ng-content />
      </h3>
    }
    @default {
      <span [class]="typographyClass()" [style]="typographyStyle()"
        ><ng-content
      /></span>
    }
  }`,
  styles: [
    ORC_SHARED_STYLES +
      `.orc-p2-typography { display: inline; line-height: 1.5; } .orc-p2-typography--xs { font-size: .75rem; } .orc-p2-typography--sm { font-size: .875rem; } .orc-p2-typography--md { font-size: 1rem; } .orc-p2-typography--lg { font-size: 1.25rem; } .orc-p2-typography--xl { font-size: 1.75rem; } .truncate { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyComponent {
  readonly as = input<'span' | 'p' | 'h1' | 'h2' | 'h3'>('span');
  readonly semanticTag = computed(() => this.as());
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly weight = input<number | string>(400);
  readonly color = input('');
  readonly truncate = input(false, { transform: booleanAttribute });

  readonly typographyClass = computed(
    () =>
      `orc-p2-typography orc-p2-typography--${this.size()}${this.truncate() ? ' truncate' : ''}`,
  );
  readonly typographyStyle = computed(() => ({
    'font-weight': this.weight(),
    color: this.color() || null,
  }));
}
