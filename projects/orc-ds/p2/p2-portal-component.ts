import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';
import { isElementTarget } from './p2-dom-target';

@Component({
  selector: 'orc-portal',
  standalone: true,
  template: `<ng-content />`,
  styles: [P2_SHARED_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalComponent implements AfterViewInit, OnDestroy {
  readonly target = input<HTMLElement | string | null>(null);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private nodes: Node[] = [];
  private destroyed = false;
  private mutationObserver: MutationObserver | null = null;
  private unresolvedTargetObserver: MutationObserver | null = null;
  private observedTarget: HTMLElement | null = null;

  constructor() {
    effect(() => {
      this.target();
      this.disconnectUnresolvedTargetObserver();
      if (!this.destroyed)
        afterNextRender(
          () => {
            if (!this.destroyed) this.move();
          },
          { injector: this.injector },
        );
    });
  }

  ngAfterViewInit(): void {
    this.nodes = Array.from(this.host.nativeElement.childNodes);
    this.move();
  }

  private resolveTarget(target: HTMLElement | string | null): {
    element: HTMLElement | null;
    waitForSelector: boolean;
  } {
    if (isElementTarget(target))
      return { element: target, waitForSelector: false };
    if (typeof target !== 'string')
      return { element: null, waitForSelector: false };
    try {
      const ownerDocument = this.host.nativeElement.ownerDocument;
      const element = ownerDocument.querySelector<HTMLElement>(target);
      return { element, waitForSelector: element === null };
    } catch {
      return { element: null, waitForSelector: false };
    }
  }

  private move(): void {
    const requestedTarget = this.target();
    const resolution = this.resolveTarget(requestedTarget);
    this.observeUnresolvedTarget(requestedTarget, resolution.waitForSelector);
    const target = resolution.element ?? this.host.nativeElement;
    this.flushMutations();
    this.observeChanges(target);
    for (const node of Array.from(this.host.nativeElement.childNodes))
      if (!this.nodes.includes(node)) this.nodes.push(node);
    if (this.nodes.some((node) => node === target || node.contains(target)))
      return;
    for (const node of this.nodes)
      if (node.parentNode !== target) target.appendChild(node);
  }

  private observeUnresolvedTarget(
    target: HTMLElement | string | null,
    unresolved: boolean,
  ): void {
    if (!unresolved || typeof target !== 'string') {
      this.disconnectUnresolvedTargetObserver();
      return;
    }
    if (this.unresolvedTargetObserver) return;
    const ownerDocument = this.host.nativeElement.ownerDocument;
    const MutationObserverConstructor =
      ownerDocument.defaultView?.MutationObserver;
    if (!MutationObserverConstructor) return;
    this.unresolvedTargetObserver = new MutationObserverConstructor(() => {
      if (this.destroyed) return;
      const current = this.resolveTarget(this.target());
      if (current.waitForSelector) return;
      this.disconnectUnresolvedTargetObserver();
      if (!current.element) return;
      afterNextRender(
        () => {
          if (!this.destroyed) this.move();
        },
        { injector: this.injector },
      );
    });
    // This observer only detects a newly resolvable selector. Its records are
    // deliberately kept out of the projected-node ownership observer below.
    this.unresolvedTargetObserver.observe(ownerDocument, {
      childList: true,
      subtree: true,
    });
  }

  private disconnectUnresolvedTargetObserver(): void {
    this.unresolvedTargetObserver?.disconnect();
    this.unresolvedTargetObserver = null;
  }

  private observeChanges(target: HTMLElement): void {
    if (this.observedTarget === target && this.mutationObserver) return;
    this.mutationObserver?.disconnect();
    this.observedTarget = target;
    const MutationObserverConstructor =
      this.host.nativeElement.ownerDocument.defaultView?.MutationObserver;
    if (!MutationObserverConstructor) {
      this.mutationObserver = null;
      return;
    }
    this.mutationObserver = new MutationObserverConstructor((records) => {
      if (this.destroyed) return;
      if (this.updateNodes(records))
        afterNextRender(
          () => {
            if (!this.destroyed) this.move();
          },
          { injector: this.injector },
        );
    });
    this.mutationObserver.observe(this.host.nativeElement, { childList: true });
    if (target !== this.host.nativeElement)
      this.mutationObserver.observe(target, { childList: true });
  }

  private flushMutations(): void {
    const records = this.mutationObserver?.takeRecords();
    if (records?.length) this.updateNodes(records);
  }

  private updateNodes(records: MutationRecord[]): boolean {
    let changed = false;
    for (const record of records) {
      for (const node of Array.from(record.removedNodes)) {
        if (!node.parentNode) {
          const index = this.nodes.indexOf(node);
          if (index >= 0) {
            this.nodes.splice(index, 1);
            changed = true;
          }
        }
      }
      for (const node of Array.from(record.addedNodes)) {
        if (!this.nodes.includes(node)) {
          this.nodes.push(node);
          changed = true;
        }
      }
    }
    return changed;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.disconnectUnresolvedTargetObserver();
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    for (const node of this.nodes) this.host.nativeElement.appendChild(node);
    this.nodes = [];
  }
}
