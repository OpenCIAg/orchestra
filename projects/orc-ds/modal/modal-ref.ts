import { ComponentRef } from '@angular/core';
import { signal } from '@angular/core';

export class ModalRef<T = any> {
  readonly onClose = signal<unknown | undefined>(undefined);
  constructor(private componentRef: ComponentRef<T>, private destroyCallback: () => void) {}

  get instance(): T {
    return this.componentRef.instance;
  }

  close(result?: unknown): void {
    this.onClose.set(result);
    this.destroyCallback();
  }

  afterClosed(): unknown | undefined { return this.onClose(); }
}
