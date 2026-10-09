import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { IconComponent, type IconFamily } from '@ciag/orchestra/icon';
import { ORC_MATERIAL_SYMBOLS } from '../../../data/icon-catalog';
import { EXAMPLE_STYLES } from './examples/example-shared.styles';

@Component({
  selector: 'app-icon-catalog-preview',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './icon-catalog-preview.component.html',
  styles: [
    EXAMPLE_STYLES +
      `
.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: start;
}
.icon-row > span {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 44px;
  color: var(--orc-color-azul-eletrico);
}
.icon-row small {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
}
.icon-row--named {
  justify-content: space-between;
}
.icon-search-demo {
  width: 100%;
}
.icon-search-controls {
  display: flex;
  gap: var(--space-3);
  align-items: end;
  flex-wrap: wrap;
  margin: var(--space-3) 0 var(--space-2);
}
.icon-search-input {
  flex: 1 1 260px;
}
.icon-search-select {
  display: grid;
  gap: 4px;
  min-width: 180px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.icon-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
  gap: var(--space-2);
  max-height: 360px;
  overflow: auto;
  padding: var(--space-2) 0;
}
.icon-catalog-item {
  display: grid;
  justify-items: center;
  gap: 6px;
  min-height: 84px;
  padding: 10px 6px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font: inherit;
  font-size: 0.68rem;
  cursor: pointer;
}
.icon-catalog-item:hover {
  border-color: var(--orc-color-azul-eletrico);
  color: var(--text-primary);
}
`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconCatalogPreviewComponent {
  readonly iconSymbols = ORC_MATERIAL_SYMBOLS;
  readonly iconQuery = signal('');
  readonly iconFill = signal<'outline' | 'filled'>('outline');
  readonly iconFamily = signal<IconFamily>('rounded');
  readonly filteredIconMetadata = computed(() => {
    const query = this.iconQuery().trim().toLowerCase();
    return ORC_MATERIAL_SYMBOLS.filter(
      (entry) =>
        !query ||
        entry.name.includes(query) ||
        (entry.tags ?? []).some((tag) => tag.toLowerCase().includes(query)),
    ).slice(0, 48);
  });

  iconDeclaration(name: string): string {
    const fill = this.iconFill() === 'filled' ? ' fill="filled"' : '';
    const family =
      this.iconFamily() === 'rounded' ? '' : ` family="${this.iconFamily()}"`;
    return `<orc-icon name="${name}"${family}${fill} ariaLabel="${name}" />`;
  }

  async copyIconDeclaration(name: string): Promise<void> {
    const declaration = this.iconDeclaration(name);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(declaration);
        return;
      } catch {
        // Fall through to the legacy copy path when clipboard permission fails.
      }
    }
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = declaration;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      if (typeof document.execCommand === 'function')
        document.execCommand('copy');
    } finally {
      textarea.remove();
    }
  }
}
