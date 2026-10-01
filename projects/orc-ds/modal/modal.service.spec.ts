import {
  ApplicationRef,
  Component,
  Inject,
  Injectable,
  Input,
  input,
  Type,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalRef } from './modal-ref';
import { ModalService, ORC_MODAL_DATA } from './modal.service';

@Component({
  selector: 'orc-modal-service-host',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <orc-modal [isOpen]="open" header="Dynamic service modal">
      <p class="payload">{{ label }} / {{ title() }} / {{ dataName }}</p>
    </orc-modal>
  `,
})
class ServiceModalHost {
  open = true;
  @Input() label = 'default';
  readonly title = input('default-title');
  readonly dataName: string;

  constructor(
    @Inject(ORC_MODAL_DATA) data: { name: string; destroy?: () => void },
  ) {
    this.dataName = data.name;
  }
}

@Component({
  selector: 'orc-modal-service-dismissible-host',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <orc-modal [isOpen]="true" (closed)="closeFn()">
      <span modal-header>Dynamic dismissible modal</span>
    </orc-modal>
  `,
})
class DismissibleServiceModalHost {
  closeFn: () => void = () => {};
}

@Component({
  selector: 'orc-modal-service-failing-host',
  standalone: true,
  template: '<span>never renders</span>',
})
class FailingInputHost {
  @Input() set explode(value: unknown) {
    if (value) throw new Error('input setup failed');
  }
}

@Injectable()
class ThrowingDestroyDependency {
  static destroyCalls = 0;

  ngOnDestroy(): void {
    ThrowingDestroyDependency.destroyCalls += 1;
    throw 'dependency teardown';
  }
}

class DestroyableModalData {
  destroyCalls = 0;

  constructor(readonly name: string) {}

  ngOnDestroy(): void {
    this.destroyCalls += 1;
  }
}

@Component({
  selector: 'orc-modal-service-throwing-host',
  standalone: true,
  providers: [ThrowingDestroyDependency],
  template: '<span>teardown probe</span>',
})
class ThrowingDestroyHost {
  constructor(
    _dependency: ThrowingDestroyDependency,
    @Inject(ORC_MODAL_DATA) _data: DestroyableModalData,
  ) {}
}

describe('ModalService dynamic lifecycle', () => {
  let service: ModalService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ModalService] });
    service = TestBed.inject(ModalService);
    appRef = TestBed.inject(ApplicationRef);
  });

  function openHost(config?: {
    data?: { name: string };
    inputs?: Partial<Record<keyof ServiceModalHost, unknown>>;
  }) {
    return service.open<ServiceModalHost, { name: string }, unknown>(
      ServiceModalHost,
      {
        data: config?.data ?? { name: 'Ada' },
        inputs: config?.inputs,
      },
    );
  }

  it('injects modal data, ordinary inputs and signal inputs into an attached host', () => {
    const ref = openHost({
      inputs: { label: 'provided', title: 'signal value' },
    });
    appRef.tick();

    const host = ref.instance as ServiceModalHost;
    expect(host.dataName).toBe('Ada');
    expect(host.label).toBe('provided');
    expect(host.title()).toBe('signal value');
    const element = document.querySelector('orc-modal-service-host')!;
    expect(element.querySelector('.payload')?.textContent).toContain(
      'provided / signal value / Ada',
    );
    expect(element.querySelector('dialog')?.open).toBeTrue();

    ref.close('saved');
    expect(element.isConnected).toBeFalse();
  });

  it('keeps simultaneous refs independent and closes only their own hosts', () => {
    const first = openHost({ data: { name: 'first' } });
    const second = openHost({ data: { name: 'second' } });
    appRef.tick();

    const hosts = Array.from(
      document.querySelectorAll('orc-modal-service-host'),
    );
    expect(hosts).toHaveSize(2);
    expect(hosts.map((host) => host.textContent)).toEqual(
      jasmine.arrayContaining([
        jasmine.stringMatching('first'),
        jasmine.stringMatching('second'),
      ]),
    );

    first.close('first-result');
    expect(hosts[0].isConnected).toBeFalse();
    expect(hosts[1].isConnected).toBeTrue();
    expect(second.afterClosed()).toBeUndefined();
    second.close('second-result');
  });

  it('emits after cleanup, replays synchronously, and resolves the promise result', async () => {
    const ref = openHost();
    appRef.tick();
    const host = document.querySelector('orc-modal-service-host')!;
    const seen: Array<{ result: unknown; connected: boolean }> = [];
    ref.afterClosed$.subscribe((result) =>
      seen.push({ result, connected: host.isConnected }),
    );
    const promise = ref.afterClosedPromise();

    ref.close({ saved: true });
    expect(seen).toEqual([{ result: { saved: true }, connected: false }]);
    expect(ref.afterClosed()).toEqual({ saved: true });
    expect(await promise).toEqual({ saved: true });

    const replayed: unknown[] = [];
    ref.afterClosed$.subscribe((result) => replayed.push(result));
    expect(replayed).toEqual([{ saved: true }]);
  });

  it('closes a service-opened modal on Escape and restores the opener focus', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const ref = service.open<DismissibleServiceModalHost, undefined, string>(
      DismissibleServiceModalHost,
    );
    try {
      ref.instance.closeFn = () => ref.close('escape');
      appRef.tick();

      const host = document.querySelector(
        'orc-modal-service-dismissible-host',
      ) as HTMLElement;
      const dialog = host.querySelector('dialog') as HTMLDialogElement;
      expect(dialog.open).toBeTrue();

      const cancel = new Event('cancel', { cancelable: true });
      dialog.dispatchEvent(cancel);

      expect(cancel.defaultPrevented).toBeTrue();
      expect(host.isConnected).toBeFalse();
      expect(ref.afterClosed()).toBe('escape');
      expect(document.activeElement).toBe(opener);
    } finally {
      ref.close();
      opener.remove();
    }
  });

  it('matches the docs ModalService example with focus and Tab containment', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const ref = service.open<DismissibleServiceModalHost, undefined, string>(
      DismissibleServiceModalHost,
    );
    try {
      ref.instance.closeFn = () => ref.close();
      appRef.tick();
      await Promise.resolve();

      const dialog = document.querySelector(
        'orc-modal-service-dismissible-host dialog',
      ) as HTMLDialogElement;
      const firstControl = dialog.querySelector(
        '.orc-modal__close-btn button',
      ) as HTMLButtonElement;
      expect(dialog.open).toBeTrue();
      expect(document.activeElement).toBe(firstControl);

      const tab = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(tab);

      expect(tab.defaultPrevented).toBeTrue();
      expect(document.activeElement).toBe(firstControl);

      ref.close();
      expect(document.activeElement).toBe(opener);
    } finally {
      ref.close();
      opener.remove();
    }
  });

  it('closes a service-opened modal on backdrop click and restores the opener focus', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const ref = service.open<DismissibleServiceModalHost, undefined, string>(
      DismissibleServiceModalHost,
    );
    try {
      ref.instance.closeFn = () => ref.close('backdrop');
      appRef.tick();

      const host = document.querySelector(
        'orc-modal-service-dismissible-host',
      ) as HTMLElement;
      const dialog = host.querySelector('dialog') as HTMLDialogElement;
      expect(dialog.open).toBeTrue();

      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(host.isConnected).toBeFalse();
      expect(ref.afterClosed()).toBe('backdrop');
      expect(document.activeElement).toBe(opener);
    } finally {
      ref.close();
      opener.remove();
    }
  });

  it('cleans all open refs when the application is destroyed', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ModalService] });
    appRef = TestBed.inject(ApplicationRef);
    const applicationDestroy = spyOn(appRef, 'onDestroy').and.callThrough();
    service = TestBed.inject(ModalService);
    const destroyCallback = applicationDestroy.calls.mostRecent().args[0];
    const first = openHost({ data: { name: 'first' } });
    const second = openHost({ data: { name: 'second' } });
    appRef.tick();
    const hosts = Array.from(
      document.querySelectorAll('orc-modal-service-host'),
    );
    const firstResult: unknown[] = [];
    first.afterClosed$.subscribe((result) => firstResult.push(result));
    const secondResult: unknown[] = [];
    second.afterClosed$.subscribe((result) => secondResult.push(result));

    // Invoke the registered application teardown callback directly. Calling
    // ApplicationRef.destroy() inside a TestBed spec also destroys TestBed's
    // root injector before its automatic teardown can run.
    destroyCallback();

    expect(hosts.every((host) => !host.isConnected)).toBeTrue();
    expect(firstResult).toEqual([undefined]);
    expect(secondResult).toEqual([undefined]);
  });

  it('cleans tracked refs when the service injector is torn down', () => {
    const ref = openHost({ data: { name: 'service-teardown' } });
    appRef.tick();
    const host = document.querySelector('orc-modal-service-host')!;

    TestBed.resetTestingModule();

    expect(host.isConnected).toBeFalse();
    expect(ref.afterClosed()).toBeUndefined();
  });

  it('rejects a document without a body before creating a component', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: DOCUMENT, useValue: { body: null } },
      ],
    });
    const nonBrowserService = TestBed.inject(ModalService);

    expect(() => nonBrowserService.open(ServiceModalHost)).toThrowError(
      /requires a document with a body/,
    );
  });

  it('cleans a component when input setup or view attachment fails', () => {
    const baseline = appRef.viewCount;
    expect(() =>
      service.open(FailingInputHost as Type<FailingInputHost>, {
        inputs: { explode: true },
      }),
    ).toThrowError('input setup failed');
    expect(appRef.viewCount).toBe(baseline);
    expect(document.querySelector('orc-modal-service-failing-host')).toBeNull();

    spyOn(appRef, 'attachView').and.throwError('attach failed');
    expect(() =>
      service.open(ServiceModalHost, { data: { name: 'attach' } }),
    ).toThrowError('attach failed');
    expect(appRef.viewCount).toBe(baseline);
    expect(document.querySelector('orc-modal-service-host')).toBeNull();
  });

  it('attempts detach, component and injected data cleanup once before surfacing the first failure', () => {
    ThrowingDestroyDependency.destroyCalls = 0;
    const data = new DestroyableModalData('throwing');
    const ref = service.open<
      ThrowingDestroyHost,
      DestroyableModalData,
      unknown
    >(ThrowingDestroyHost, { data });
    const realDetach = appRef.detachView.bind(appRef);
    const detach = spyOn(appRef, 'detachView').and.callFake((view) => {
      realDetach(view);
      throw new Error('detach failed');
    });
    let thrown: unknown;
    try {
      ref.close('done');
    } catch (error) {
      thrown = error;
    }

    expect((thrown as Error).message).toBe('detach failed');
    expect(detach).toHaveBeenCalledTimes(1);
    expect(ThrowingDestroyDependency.destroyCalls).toBe(1);
    expect(data.destroyCalls).toBe(1);
    expect(
      document.querySelector('orc-modal-service-throwing-host'),
    ).toBeNull();
  });

  it('destroys a destroyable ORC_MODAL_DATA provider with the host', () => {
    const data = new DestroyableModalData('data-cleanup');
    const ref = openHost({ data });
    appRef.tick();

    ref.close();

    expect(data.destroyCalls).toBe(1);
    expect(document.querySelector('orc-modal-service-host')).toBeNull();
  });
});

describe('ModalRef lifecycle contract', () => {
  it('is idempotent while still publishing a result if cleanup throws', () => {
    const destroyed = jasmine.createSpy('destroyed').and.throwError('cleanup');
    const ref = new ModalRef({ instance: {} } as never, destroyed);
    const values: unknown[] = [];
    ref.afterClosed$.subscribe((value) => values.push(value));

    expect(() => ref.close('result')).toThrowError('cleanup');
    expect(values).toEqual(['result']);
    expect(ref.afterClosed()).toBe('result');
    ref.close('ignored');
    expect(destroyed).toHaveBeenCalledTimes(1);
    expect(values).toEqual(['result']);
  });

  it('surfaces falsy cleanup failures after publishing the result', () => {
    const ref = new ModalRef({ instance: {} } as never, () => {
      throw 0;
    });
    const values: unknown[] = [];
    ref.afterClosed$.subscribe((value) => values.push(value));

    let thrown: unknown;
    try {
      ref.close('result');
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBe(0);
    expect(values).toEqual(['result']);
    ref.close('ignored');
    expect(values).toEqual(['result']);
  });
});
