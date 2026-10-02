import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TagsInputComponent } from '@ciag/orchestra/p2-doc-components';
import { EXAMPLE_STYLES } from './example-shared.styles';

@Component({
  selector: 'doc-tags-input-example',
  standalone: true,
  imports: [TagsInputComponent],
  template: `
    <div class="example-stack">
      <div class="example">
        <span class="example__label">Tags + suggestions</span>
        <orc-tags-input
          label="Tecnologias"
          [(value)]="tags"
          separator=","
          [suggestions]="['Angular', 'React', 'Vue', 'A11y', 'Tokens']"
          placeholder="Adicione uma tag"
          helperText="Pressione Enter ou vírgula para confirmar."
          (tagAdded)="onTagAdded($event)"
          (tagRemoved)="onTagRemoved($event)"
        />
        <code>tags = {{ tags().join(', ') }}</code>
      </div>
      <div class="example" data-testid="tags-input-tab-example">
        <span class="example__label">Opt-in add on Tab</span>
        <orc-tags-input
          label="Technologies (Tab commit)"
          [(value)]="tabTags"
          [addOnTab]="true"
          placeholder="Type, then press Tab"
        />
        <orc-tags-input
          label="Next control"
          data-testid="tags-input-tab-next"
        />
      </div>
    </div>
  `,
  styles: [EXAMPLE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputExampleComponent implements OnInit {
  readonly stateChange = output<Record<string, unknown>>();
  readonly tags = signal<string[]>(['Angular', 'A11y']);
  readonly tabTags = signal<string[]>([]);
  readonly message = signal('Nenhuma ação emitida ainda.');

  ngOnInit(): void {
    this.emit();
  }

  onTagAdded(tag: string): void {
    this.message.set(`Tag adicionada: ${tag}`);
    this.emit();
  }

  onTagRemoved(tag: string): void {
    this.message.set(`Tag removida: ${tag}`);
    this.emit();
  }

  private emit(): void {
    this.stateChange.emit({ tags: this.tags(), state: this.message() });
  }
}
