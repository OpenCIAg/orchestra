import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { axe, toHaveNoViolations } from 'jasmine-axe';
import { MessagesComponent, MessageItem } from '@ciag/orchestra/messages';

@Component({
  standalone: true,
  imports: [MessagesComponent],
  template: `<orc-messages
    [messages]="messages"
    (messagesChange)="onMessagesChange($event)"
    (messageClose)="closed.push($event)"
    (clear)="onClear()"
  />`,
})
class MessagesConsumer {
  messages: MessageItem[] = [];
  readonly messagesChanged: MessageItem[][] = [];
  readonly closed: MessageItem[] = [];
  clearCount = 0;

  onMessagesChange(messages: MessageItem[]): void {
    this.messages = messages;
    this.messagesChanged.push(messages);
  }

  onClear(): void {
    this.clearCount++;
  }
}

describe('MessagesComponent behavior', () => {
  beforeEach(() => jasmine.addMatchers(toHaveNoViolations));

  it('renders a named polite live region, accessible dismiss controls, and severity roles', async () => {
    const fixture = TestBed.createComponent(MessagesComponent);
    fixture.componentInstance.messages.set([
      {
        id: 'saved',
        severity: 'success',
        summary: 'Saved',
        detail: 'Changes saved.',
      },
      {
        id: 'warning',
        severity: 'warn',
        detail: 'Review the configuration.',
        closable: false,
      },
      {
        id: 'neutral',
        severity: 'secondary',
        detail: 'Background task completed.',
      },
    ]);
    fixture.detectChanges();

    let region = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(region.getAttribute('aria-label')).toBe('Messages');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.classList.contains('orc-messages')).toBeTrue();
    const articles = fixture.nativeElement.querySelectorAll(
      '.message',
    ) as NodeListOf<HTMLElement>;
    expect(articles).toHaveSize(3);
    expect(articles[0].getAttribute('role')).toBe('status');
    expect(articles[1].getAttribute('role')).toBe('alert');
    expect(articles[2].getAttribute('role')).toBe('status');
    expect(articles[2].classList.contains('severity-secondary')).toBeTrue();

    let closeButtons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(closeButtons).toHaveSize(2);
    expect(closeButtons[0].getAttribute('aria-label')).toBe('Dismiss message');
    expect(closeButtons[1].getAttribute('aria-label')).toBe('Dismiss message');
    expect(
      closeButtons[0].querySelector('[aria-hidden="true"]')?.textContent,
    ).toBe('×');
    expect(await axe(fixture.nativeElement)).toHaveNoViolations();

    fixture.componentRef.setInput('ariaLabel', 'System notifications');
    fixture.componentRef.setInput('ariaLive', 'assertive');
    fixture.componentRef.setInput('closeLabel', 'Dismiss notification');
    fixture.componentRef.setInput('styleClass', 'notification-stack compact');
    fixture.detectChanges();

    region = fixture.nativeElement.querySelector('section') as HTMLElement;
    closeButtons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(region.getAttribute('aria-label')).toBe('System notifications');
    expect(region.getAttribute('aria-live')).toBe('assertive');
    expect(region.classList.contains('notification-stack')).toBeTrue();
    expect(region.classList.contains('compact')).toBeTrue();
    expect(closeButtons[0].getAttribute('aria-label')).toBe(
      'Dismiss notification',
    );

    fixture.componentRef.setInput('closable', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('button')).toHaveSize(0);
  });

  it('removes one duplicate-id message and emits one close and model-change event', () => {
    const fixture = TestBed.createComponent(MessagesConsumer);
    const consumer = fixture.componentInstance;
    const first: MessageItem = { id: 'duplicate', summary: 'First notice' };
    const second: MessageItem = { id: 'duplicate', summary: 'Second notice' };
    consumer.messages = [first, second];
    fixture.detectChanges();

    const firstClose = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    firstClose.click();
    fixture.detectChanges();

    expect(consumer.messages).toEqual([second]);
    expect(consumer.closed).toEqual([first]);
    expect(consumer.messagesChanged).toEqual([[second]]);
    expect(fixture.nativeElement.querySelectorAll('.message')).toHaveSize(1);
    expect(
      fixture.nativeElement.querySelector('.message strong').textContent,
    ).toBe('Second notice');
  });

  it('clears the model once and preserves an empty live region without placeholder rows', () => {
    const fixture = TestBed.createComponent(MessagesConsumer);
    const consumer = fixture.componentInstance;
    consumer.messages = [{ id: 1, summary: 'Ready' }];
    fixture.detectChanges();

    fixture.debugElement
      .query(By.directive(MessagesComponent))
      .componentInstance.clearMessages();
    fixture.detectChanges();

    expect(consumer.messages).toEqual([]);
    expect(consumer.messagesChanged).toEqual([[]]);
    expect(consumer.clearCount).toBe(1);
    expect(consumer.closed).toEqual([]);
    expect(fixture.nativeElement.querySelectorAll('.message')).toHaveSize(0);
    expect(
      fixture.nativeElement.querySelector('section').getAttribute('aria-label'),
    ).toBe('Messages');
  });
});
