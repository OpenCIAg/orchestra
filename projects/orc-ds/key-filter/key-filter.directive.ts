import { booleanAttribute, Directive, HostListener, input, output } from '@angular/core';

@Directive({ selector: '[orcKeyFilter],[pKeyFilter]', standalone: true })
export class KeyFilterDirective {
  readonly pattern = input<string | RegExp>('[0-9]');
  readonly validateOnly = input(false, {
    transform: booleanAttribute,
    alias: 'pValidateOnly',
  });
  readonly ngModelChange = output<string | number>();
  private matches(value: string): boolean {
    try {
      const regex =
        this.pattern() instanceof RegExp
          ? (this.pattern() as RegExp)
          : new RegExp(this.pattern());
      return [...value].every((character) => {
        regex.lastIndex = 0;
        return regex.test(character);
      });
    } catch {
      return true;
    }
  }
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (
      this.validateOnly() ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    )
      return;
    if (!this.matches(event.key)) event.preventDefault();
  }
  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent): void {
    if (this.validateOnly()) return;
    const value = event.clipboardData?.getData('text') ?? '';
    if (!this.matches(value)) event.preventDefault();
  }
  @HostListener('input', ['$event']) onInput(event: Event): void {
    if (!this.validateOnly()) return;
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.ngModelChange.emit(value);
  }
}

