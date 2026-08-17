import { ComponentRef } from '@angular/core';

export class ModalRef<T = any> {
  constructor(private componentRef: ComponentRef<T>, private destroyCallback: () => void) {}

  get instance(): T {
    return this.componentRef.instance;
  }

  close(): void {
    this.destroyCallback();
  }
}
