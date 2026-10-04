import {
  isolateModalBackground,
  isTopOverlay,
  registerOverlay,
} from './overlay-lifecycle';
import { createModalIsolation } from './modal-isolation';

describe('Modal background ownership', () => {
  let root: HTMLDivElement;
  let releases: (() => void)[];
  const own = (release: () => void) => {
    releases.push(release);
    return release;
  };
  beforeEach(() => {
    releases = [];
    root = document.createElement('div');
    root.innerHTML = `<button class="background" style="position:fixed;left:8px;top:8px;width:80px;height:32px">Background</button><div class="preserved" inert="consumer"><button>Unavailable</button></div><section class="lower" tabindex="-1" style="position:fixed;left:200px;top:150px"><button>First modal</button></section><section class="upper" tabindex="-1" style="position:fixed;left:300px;top:250px"><button>Second modal</button></section><div class="backdrop"></div>`;
    document.body.append(root);
  });
  afterEach(() => {
    releases.reverse().forEach((release) => release());
    root.remove();
  });
  const get = (selector: string) => root.querySelector<HTMLElement>(selector)!;

  it('blocks programmatic focus and pointer hit-testing outside the modal, preserving the backdrop', () => {
    const background = get('.background');
    expect(document.elementFromPoint(20, 20)).toBe(background);
    own(registerOverlay(get('.lower')));
    const release = own(
      isolateModalBackground(get('.lower'), [get('.backdrop')]),
    );
    get('.lower button').focus();
    background.focus();
    expect(document.activeElement).toBe(get('.lower button'));
    expect(document.elementFromPoint(20, 20)).not.toBe(background);
    expect(get('.backdrop').inert).toBeFalse();
    release();
    release();
    expect(background.inert).toBeFalse();
    expect(get('.preserved').getAttribute('inert')).toBe('consumer');
  });

  it('gives the latest modal exclusive ownership and supports out-of-order disposal', () => {
    const lowerLayer = own(registerOverlay(get('.lower')));
    const lowerScope = own(isolateModalBackground(get('.lower')));
    const upperLayer = own(registerOverlay(get('.upper')));
    const upperScope = own(isolateModalBackground(get('.upper')));
    get('.upper button').focus();
    get('.lower button').focus();
    expect(document.activeElement).toBe(get('.upper button'));
    lowerScope();
    lowerLayer();
    expect(get('.background').inert).toBeTrue();
    expect(get('.upper').closest('[inert]')).toBeNull();
    upperScope();
    upperLayer();
    expect(get('.background').inert).toBeFalse();
    expect(get('.lower').inert).toBeFalse();
    expect(get('.preserved').getAttribute('inert')).toBe('consumer');
  });

  it('keeps later interactive overlays and descriptive tooltips available without changing keyboard ownership', () => {
    own(registerOverlay(get('.lower')));
    own(isolateModalBackground(get('.lower')));
    own(registerOverlay(get('.upper')));
    expect(get('.upper').closest('[inert]')).toBeNull();
    const tooltip = document.createElement('div');
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = 'Details';
    root.append(tooltip);
    own(registerOverlay(tooltip, { interactive: false }));
    expect(tooltip.closest('[inert]')).toBeNull();
    expect(isTopOverlay(get('.upper'))).toBeTrue();
    expect(isTopOverlay(tooltip)).toBeFalse();
  });

  it('isolates newly mounted background nodes and stops observing after release', async () => {
    own(registerOverlay(get('.lower')));
    const release = own(isolateModalBackground(get('.lower')));
    const added = document.createElement('button');
    root.append(added);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(added.inert).toBeTrue();
    release();
    expect(added.inert).toBeFalse();
    const after = document.createElement('button');
    root.append(after);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(after.inert).toBeFalse();
  });

  it('restores the previous modal when a nested modal closes', () => {
    own(registerOverlay(get('.lower')));
    own(isolateModalBackground(get('.lower')));
    const upperLayer = own(registerOverlay(get('.upper')));
    const upperScope = own(isolateModalBackground(get('.upper')));
    upperScope();
    upperLayer();
    get('.lower button').focus();
    expect(document.activeElement).toBe(get('.lower button'));
    expect(get('.background').inert).toBeTrue();
    expect(get('.upper').inert).toBeTrue();
  });

  it('handles a modal inside a closed shadow root, including new shadow siblings', async () => {
    const host = document.createElement('div');
    root.append(host);
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.innerHTML =
      '<section tabindex="-1"><button>Inside</button></section><button class="background">Outside</button>';
    const panel = shadow.querySelector('section')!;
    own(registerOverlay(panel));
    const release = own(isolateModalBackground(panel));
    const inside = panel.querySelector('button')!;
    const outside = shadow.querySelector<HTMLButtonElement>('.background')!;
    inside.focus();
    outside.focus();
    expect(shadow.activeElement).toBe(inside);
    expect(outside.inert).toBeTrue();
    expect(host.inert).toBeFalse();
    const added = document.createElement('button');
    shadow.append(added);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(added.inert).toBeTrue();
    release();
    expect(outside.inert).toBeFalse();
    expect(added.inert).toBeFalse();
  });

  it('constructs the mutation observer from a same-origin iframe window', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (!frameDocument || !frameWindow)
      throw new Error('same-origin iframe unavailable');
    const modal = frameDocument.createElement('section');
    frameDocument.body.append(modal);
    class FrameMutationObserver {
      static instances: FrameMutationObserver[] = [];
      constructor(_callback: MutationCallback) {
        FrameMutationObserver.instances.push(this);
      }
      observe(_target: Node, _options?: MutationObserverInit): void {}
      disconnect(): void {}
      takeRecords(): MutationRecord[] {
        return [];
      }
    }
    const originalMutationObserver = (
      frameWindow as unknown as { MutationObserver?: unknown }
    ).MutationObserver;
    Object.defineProperty(frameWindow, 'MutationObserver', {
      configurable: true,
      value: FrameMutationObserver,
    });
    try {
      const isolation = createModalIsolation(frameDocument, () => []);
      isolation.register(modal);
      expect(FrameMutationObserver.instances.length).toBe(1);
    } finally {
      Object.defineProperty(frameWindow, 'MutationObserver', {
        configurable: true,
        value: originalMutationObserver,
      });
      frame.remove();
    }
  });
});
