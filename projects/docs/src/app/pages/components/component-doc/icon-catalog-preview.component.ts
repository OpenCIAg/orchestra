import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { IconComponent, type IconFamily } from '@ciag/orchestra/icon';
import { ORC_MATERIAL_SYMBOLS } from '@ciag/orchestra/icons';

@Component({
  selector: 'app-icon-catalog-preview',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './icon-catalog-preview.component.html',
  styleUrl: './icon-catalog-preview.component.scss',
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
