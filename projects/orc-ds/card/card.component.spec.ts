import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardBodyComponent } from './card-body.component';
import { CardFooterComponent } from './card-footer.component';
import { CardHeaderComponent } from './card-header.component';
import { CardComponent } from './card.component';

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `<orc-card clickable header="Summary">
    <button
      type="button"
      class="nested-action"
      (click)="nestedClicks = nestedClicks + 1"
    >
      <svg class="nested-icon" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M0 0h10v10H0z" />
      </svg>
    </button>
    <span class="nested-widget" role="slider" tabindex="0">Adjust</span>
  </orc-card>`,
})
class NestedCardHost {
  nestedClicks = 0;
}

@Component({
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
  ],
  template: `<orc-card
    ><orc-card-header>Header</orc-card-header><orc-card-body>Body</orc-card-body
    ><orc-card-footer>Footer</orc-card-footer></orc-card
  >`,
})
class ProjectedCardHost {}

describe('CardComponent browser behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [CardComponent] }),
  );

  function create(): ComponentFixture<CardComponent> {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();
    return fixture;
  }

  function key(target: HTMLElement, value: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key: value,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    return event;
  }

  it('coerces clickable/selected attributes and emits once for native click', () => {
    const fixture = create();
    fixture.componentRef.setInput('clickable', '');
    fixture.componentRef.setInput('selected', '');
    fixture.componentRef.setInput('header', 'Summary');
    fixture.componentRef.setInput('style', { width: '240px', height: '120px' });
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    const selected = jasmine.createSpy('selected');
    const clicked = jasmine.createSpy('clicked');
    fixture.componentInstance.cardClick.subscribe(selected);
    fixture.componentInstance.onClickEvent.subscribe(clicked);

    expect(card.tagName).toBe('ARTICLE');
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('tabindex')).toBeNull();
    expect(card.getAttribute('aria-selected')).toBeNull();
    const primary = card.querySelector(
      '.card__primary-action',
    ) as HTMLButtonElement;
    expect(primary.type).toBe('button');
    expect(primary.getAttribute('aria-label')).toBe('Summary');
    expect(primary.getAttribute('aria-pressed')).toBe('true');
    expect(primary.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(primary.getBoundingClientRect().height).toBeGreaterThan(0);
    const originalEvent = new MouseEvent('click', {
      bubbles: true,
      clientX: 37,
      clientY: 41,
    });
    card.dispatchEvent(originalEvent);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(clicked.calls.mostRecent().args[0]).toBe(originalEvent);
  });

  it('uses the native primary action for keyboard activation and focus outline', () => {
    const fixture = create();
    fixture.componentRef.setInput('clickable', true);
    fixture.componentRef.setInput('header', 'Summary');
    fixture.componentRef.setInput('style', { width: '240px', height: '120px' });
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    const primary = card.querySelector(
      '.card__primary-action',
    ) as HTMLButtonElement;
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.cardClick.subscribe(selected);

    primary.focus();
    expect(document.activeElement).toBe(primary);
    expect(card.matches(':focus-within')).toBeTrue();
    primary.click();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('leaves nested native actions independent of parent activation', () => {
    const fixture = TestBed.createComponent(NestedCardHost);
    fixture.detectChanges();
    Object.assign(fixture.nativeElement.style, {
      position: 'fixed',
      left: '20px',
      top: '20px',
      width: '240px',
      height: '120px',
      zIndex: '10000',
    });
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    const nested = fixture.nativeElement.querySelector(
      '.nested-action',
    ) as HTMLButtonElement;
    const widget = fixture.nativeElement.querySelector(
      '.nested-widget',
    ) as HTMLElement;
    const nestedPath = fixture.nativeElement.querySelector(
      '.nested-icon path',
    ) as SVGPathElement;
    const primary = card.querySelector(
      '.card__primary-action',
    ) as HTMLButtonElement;
    const selected = jasmine.createSpy('selected');
    const component = fixture.debugElement.query(By.directive(CardComponent))
      .componentInstance as CardComponent;
    component.cardClick.subscribe(selected);

    nested.click();
    expect(fixture.componentInstance.nestedClicks).toBe(1);
    expect(selected).not.toHaveBeenCalled();
    const nestedSpace = key(nested, ' ');
    expect(nestedSpace.defaultPrevented).toBeFalse();
    const widgetSpace = key(widget, ' ');
    expect(widgetSpace.defaultPrevented).toBeFalse();
    expect(selected).not.toHaveBeenCalled();
    nestedPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.nestedClicks).toBe(2);
    expect(selected).not.toHaveBeenCalled();
    const nestedRect = nested.getBoundingClientRect();
    expect(nestedRect.width).toBeGreaterThan(0);
    const hit = document.elementFromPoint(
      nestedRect.left + nestedRect.width / 2,
      nestedRect.top + nestedRect.height / 2,
    );
    expect(hit === nested || nested.contains(hit)).toBeTrue();
    primary.click();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(card).toBeTruthy();
  });

  it('keeps nested actions independent in a same-origin iframe realm', () => {
    const fixture = TestBed.createComponent(NestedCardHost);
    fixture.detectChanges();
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    if (!frameDocument)
      throw new Error('same-origin iframe document unavailable');
    const card = frameDocument.createElement('article');
    const nested = frameDocument.createElement('button');
    card.appendChild(nested);
    frameDocument.body.appendChild(card);
    const selected = jasmine.createSpy('selected');
    const component = fixture.debugElement.query(By.directive(CardComponent))
      .componentInstance as CardComponent;
    component.cardClick.subscribe(selected);
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperties(event, {
      target: { value: nested },
      currentTarget: { value: card },
      composedPath: { value: () => [nested, card] },
    });

    component.onCardClick(event);

    expect(selected).not.toHaveBeenCalled();
    expect(
      (component as unknown as { clickable: () => boolean }).clickable(),
    ).toBeTrue();
    iframe.remove();
  });

  it('preserves projected card section content and consumer styles', () => {
    const fixture = TestBed.createComponent(ProjectedCardHost);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.card-header')?.textContent,
    ).toContain('Header');
    expect(
      fixture.nativeElement.querySelector('.card-body')?.textContent,
    ).toContain('Body');
    expect(
      fixture.nativeElement.querySelector('.card-footer')?.textContent,
    ).toContain('Footer');
    const styled = create();
    styled.componentRef.setInput('styleClass', 'consumer-card');
    styled.detectChanges();
    expect(styled.nativeElement.querySelector('.consumer-card')).not.toBeNull();
  });
});
