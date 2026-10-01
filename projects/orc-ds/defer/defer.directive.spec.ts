import {
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeferDirective } from './defer.directive';

@Component({
  standalone: true,
  imports: [DeferDirective],
  template: `
    <section class="target">
      <div *orcDefer><span class="deferred">Loaded</span></div>
    </section>
  `,
})
class DeferHost {
  @ViewChild(DeferDirective) directive?: DeferDirective;
}

class ControlledIntersectionObserver {
  static instances: ControlledIntersectionObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: IntersectionObserverCallback) {
    ControlledIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }
  unobserve(_target: Element): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  emit(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('DeferDirective', () => {
  let originalIntersectionObserver: unknown;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeferHost],
    }).compileComponents();
    originalIntersectionObserver = (
      window as unknown as { IntersectionObserver?: unknown }
    ).IntersectionObserver;
    ControlledIntersectionObserver.instances = [];
  });

  afterEach(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: originalIntersectionObserver,
    });
  });

  function installObserver(): void {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: ControlledIntersectionObserver,
    });
  }

  it('renders structural content only after intersection and emits onLoad once', () => {
    installObserver();
    const fixture: ComponentFixture<DeferHost> =
      TestBed.createComponent(DeferHost);
    fixture.detectChanges();

    const observer = ControlledIntersectionObserver.instances[0];
    const directive = fixture.componentInstance.directive;
    if (!directive)
      throw new Error(
        'DeferDirective was not queried from the structural anchor',
      );
    const loaded = jasmine.createSpy('loaded');
    directive.onLoad.subscribe(loaded);
    expect(observer.observed).toHaveSize(1);
    expect(observer.observed[0]).toBe(
      fixture.nativeElement.querySelector('.target'),
    );
    expect(fixture.nativeElement.querySelector('.deferred')).toBeNull();
    expect(loaded).not.toHaveBeenCalled();

    observer.emit(false);
    expect(fixture.nativeElement.querySelector('.deferred')).toBeNull();
    observer.emit(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.deferred')?.textContent).toBe(
      'Loaded',
    );
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(observer.disconnected).toBeTrue();

    observer.emit(true);
    fixture.detectChanges();
    expect(loaded).toHaveBeenCalledTimes(1);
  });

  it('loads immediately when IntersectionObserver is unavailable', () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const fixture = TestBed.createComponent(DeferHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.deferred')?.textContent).toBe(
      'Loaded',
    );
    expect(ControlledIntersectionObserver.instances).toHaveSize(0);
  });

  it('loads immediately when a structural anchor has no real target', () => {
    installObserver();
    const comment = document.createComment('defer-anchor');
    const createEmbeddedView = jasmine
      .createSpy('createEmbeddedView')
      .and.returnValue({ destroy: jasmine.createSpy('destroy') });
    const template = {} as TemplateRef<unknown>;
    const container = { createEmbeddedView } as unknown as ViewContainerRef;
    const directive = TestBed.runInInjectionContext(
      () => new DeferDirective(template, container, new ElementRef(comment)),
    );
    const loaded = jasmine.createSpy('loaded');
    directive.onLoad.subscribe(loaded);

    directive.ngAfterViewInit();
    expect(createEmbeddedView).toHaveBeenCalledWith(template);
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(ControlledIntersectionObserver.instances).toHaveSize(0);
  });

  it('disconnects the observer on destroy before intersection', () => {
    installObserver();
    const fixture = TestBed.createComponent(DeferHost);
    fixture.detectChanges();
    const observer = ControlledIntersectionObserver.instances[0];
    fixture.destroy();
    expect(observer.disconnected).toBeTrue();
    expect(() => observer.emit(true)).not.toThrow();
  });

  it('observes an element from its same-origin iframe realm', () => {
    installObserver();
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    if (!frameDocument)
      throw new Error('same-origin iframe document unavailable');
    const frameWindow = frameDocument.defaultView;
    if (!frameWindow) throw new Error('same-origin iframe window unavailable');
    const FrameIntersectionObserver = class extends ControlledIntersectionObserver {};
    Object.defineProperty(frameWindow, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: FrameIntersectionObserver,
    });
    const target = frameDocument.createElement('section');
    frameDocument.body.appendChild(target);
    const createEmbeddedView = jasmine
      .createSpy('createEmbeddedView')
      .and.returnValue({
        destroy: jasmine.createSpy('destroy'),
      });
    const directive = TestBed.runInInjectionContext(
      () =>
        new DeferDirective(
          {} as TemplateRef<unknown>,
          { createEmbeddedView } as unknown as ViewContainerRef,
          new ElementRef(target),
        ),
    );

    directive.ngAfterViewInit();

    expect(ControlledIntersectionObserver.instances[0].observed[0]).toBe(
      target,
    );
    expect(ControlledIntersectionObserver.instances[0].constructor).toBe(
      FrameIntersectionObserver,
    );
    directive.ngOnDestroy();
    iframe.remove();
  });
});
