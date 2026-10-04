import { TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent interactive and status semantics', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();
  });

  it('uses image semantics for display-only avatars and announces status', () => {
    const fixture = TestBed.createComponent(AvatarComponent);
    fixture.componentRef.setInput('status', 'online');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector(
      '.orc-avatar',
    ) as HTMLElement;
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('User, Online');
    expect(avatar.hasAttribute('tabindex')).toBeFalse();
    fixture.destroy();
  });

  it('uses button semantics and native click events for Enter and Space', () => {
    const fixture = TestBed.createComponent(AvatarComponent);
    fixture.componentRef.setInput('clickable', true);
    fixture.componentRef.setInput('name', 'Ada Lovelace');
    fixture.componentRef.setInput('status', 'busy');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector(
      '.orc-avatar',
    ) as HTMLElement;
    const events: MouseEvent[] = [];
    fixture.componentInstance.avatarClick.subscribe((event) =>
      events.push(event),
    );
    expect(avatar.getAttribute('role')).toBe('button');
    expect(avatar.getAttribute('aria-label')).toBe('Ada Lovelace, Busy');
    expect(avatar.tabIndex).toBe(0);

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    avatar.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBeTrue();
    expect(events).toHaveSize(1);

    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    avatar.dispatchEvent(space);
    expect(space.defaultPrevented).toBeTrue();
    expect(events).toHaveSize(2);
    expect(events.every((event) => event instanceof MouseEvent)).toBeTrue();
    fixture.destroy();
  });
});
