import { ComponentRef } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

export class ModalRef<TComponent = unknown, TResult = unknown> {
  private readonly closed = new ReplaySubject<TResult | undefined>(1);
  private hasClosed = false;
  private result: TResult | undefined;
  readonly afterClosed$: Observable<TResult | undefined> = this.closed.asObservable();
  constructor(private componentRef: ComponentRef<TComponent>, private destroyCallback: () => void) {}

  get instance(): TComponent {
    return this.componentRef.instance;
  }

  close(result?: TResult): void {
    if (this.hasClosed) return;
    this.hasClosed = true;
    this.result = result;
    this.closed.next(result);
    this.closed.complete();
    this.destroyCallback();
  }

  /** Backwards-compatible synchronous access to the close result. */
  afterClosed(): TResult | undefined { return this.result; }

  /** Promise-friendly alternative to `afterClosed$`. */
  afterClosedPromise(): Promise<TResult | undefined> {
    return new Promise(resolve => this.afterClosed$.subscribe(resolve));
  }
}
