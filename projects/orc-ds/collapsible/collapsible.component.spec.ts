import { Component, OnInit, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CollapsibleComponent } from './collapsible.component';

@Component({
  standalone: true,
  imports: [CollapsibleComponent],
  template: `<orc-collapsible
    [title]="title()"
    [summary]="summary()"
    [lazy]="lazy()"
    [disabled]="disabled()"
    [open]="open()"
    (openChange)="open.set($event)"
    (toggleChange)="changes.push($event)"
    ><input class="projected"
  /></orc-collapsible>`,
})
class CollapsibleHostComponent {
  title = signal('');
  summary = signal('');
  lazy = signal(false);
  disabled = signal(false);
  open = signal(false);
  changes: boolean[] = [];
}

let lazyChildConstructed = 0;
let lazyChildInitialized = 0;

@Component({
  selector: 'orc-test-collapsible-lazy-child',
  standalone: true,
  template: '<span class="lazy-child">lazy child</span>',
})
class LazyChildComponent implements OnInit {
  constructor() {
    lazyChildConstructed += 1;
  }
  ngOnInit(): void {
    lazyChildInitialized += 1;
  }
}

@Component({
  standalone: true,
  imports: [CollapsibleComponent, LazyChildComponent],
  template: `<ng-template #content><orc-test-collapsible-lazy-child /></ng-template
    ><orc-collapsible
      title="Deferred"
      [lazy]="true"
      [lazyContent]="content"
      [open]="open()"
      (openChange)="open.set($event)"
    />`,
})
class LazyTemplateHostComponent {
  open = signal(false);
}

describe('CollapsibleComponent contract', () => {
  beforeEach(async () => {
    lazyChildConstructed = 0;
    lazyChildInitialized = 0;
    await TestBed.configureTestingModule({
      imports: [
        CollapsibleComponent,
        CollapsibleHostComponent,
        LazyTemplateHostComponent,
      ],
    }).compileComponents();
  });

  it('names blank triggers while preserving visible title and summary names', () => {
    const blank = TestBed.createComponent(CollapsibleComponent);
    blank.detectChanges();
    const blankTrigger = blank.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(blankTrigger.getAttribute('aria-label')).toBe('Collapsible section');

    const titled = TestBed.createComponent(CollapsibleComponent);
    titled.componentRef.setInput('title', 'Details');
    titled.componentRef.setInput('summary', 'More information');
    titled.detectChanges();
    const titledTrigger = titled.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(titledTrigger.getAttribute('aria-label')).toBeNull();
    expect(titledTrigger.textContent).toContain('Details');
    expect(titledTrigger.textContent).toContain('More information');

    const summaryOnly = TestBed.createComponent(CollapsibleComponent);
    summaryOnly.componentRef.setInput('summary', 'Summary only');
    summaryOnly.detectChanges();
    const summaryTrigger = summaryOnly.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(summaryTrigger.getAttribute('aria-label')).toBeNull();
    expect(summaryTrigger.textContent).toContain('Summary only');
  });

  it('keeps aria-expanded, controls, and region labelling linked', () => {
    const fixture = TestBed.createComponent(CollapsibleComponent);
    fixture.componentRef.setInput('title', 'Details');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    const region = fixture.nativeElement.querySelector(
      '[role="region"]',
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('aria-labelledby')).toBe(trigger.id);

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.open()).toBeTrue();
  });

  it('retains lazy projected content after first open, including external model writes', () => {
    const fixture = TestBed.createComponent(CollapsibleHostComponent);
    fixture.componentInstance.lazy.set(true);
    fixture.detectChanges();
    let trigger = fixture.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeNull();
    expect(trigger.getAttribute('aria-controls')).toBeNull();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    const firstRegion = fixture.nativeElement.querySelector(
      '[role="region"]',
    ) as HTMLElement;
    const firstInput = firstRegion.querySelector(
      '.projected',
    ) as HTMLInputElement;
    trigger = fixture.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-controls')).toBe(firstRegion.id);

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    const retainedRegion = fixture.nativeElement.querySelector(
      '[role="region"]',
    ) as HTMLElement;
    expect(retainedRegion).toBe(firstRegion);
    expect(retainedRegion.hidden).toBeTrue();
    expect(retainedRegion.querySelector('.projected')).toBe(firstInput);
    expect(trigger.getAttribute('aria-controls')).toBe(retainedRegion.id);

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    const reopenedRegion = fixture.nativeElement.querySelector(
      '[role="region"]',
    ) as HTMLElement;
    expect(reopenedRegion).toBe(firstRegion);
    expect(reopenedRegion.querySelector('.projected')).toBe(firstInput);
    expect(reopenedRegion.hidden).toBeFalse();
  });

  it('defers lazyContent template creation until first open and retains its child instance', () => {
    const fixture = TestBed.createComponent(LazyTemplateHostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(lazyChildConstructed).toBe(0);
    expect(lazyChildInitialized).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeNull();
    expect(trigger.getAttribute('aria-controls')).toBeNull();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    const firstRegion = fixture.nativeElement.querySelector(
      '[role="region"]',
    ) as HTMLElement;
    const firstChild = firstRegion.querySelector('.lazy-child');
    expect(lazyChildConstructed).toBe(1);
    expect(lazyChildInitialized).toBe(1);
    expect(firstChild).not.toBeNull();

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    expect(lazyChildConstructed).toBe(1);
    expect(lazyChildInitialized).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBe(
      firstRegion,
    );

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    expect(lazyChildConstructed).toBe(1);
    expect(lazyChildInitialized).toBe(1);
    expect(fixture.nativeElement.querySelector('.lazy-child')).toBe(firstChild);
  });

  it('keeps ordinary projected content available when lazy is disabled', () => {
    const fixture = TestBed.createComponent(CollapsibleHostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="region"] .projected'),
    ).not.toBeNull();
  });

  it('keeps disabled native/programmatic behavior and emits toggleChange once per user toggle', () => {
    const fixture = TestBed.createComponent(CollapsibleHostComponent);
    fixture.detectChanges();
    const component = fixture.debugElement.query(
      By.directive(CollapsibleComponent),
    ).componentInstance as CollapsibleComponent;
    const trigger = fixture.nativeElement.querySelector(
      '.orc-collapsible__trigger',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.changes).toEqual([true, false]);

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(trigger.disabled).toBeTrue();
    trigger.click();
    expect(fixture.componentInstance.changes).toEqual([true, false]);
    expect(fixture.componentInstance.open()).toBeFalse();
    component.toggle();
    expect(fixture.componentInstance.changes).toEqual([true, false]);
    expect(fixture.componentInstance.open()).toBeFalse();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(fixture.componentInstance.changes).toEqual([true, false]);
  });
});
