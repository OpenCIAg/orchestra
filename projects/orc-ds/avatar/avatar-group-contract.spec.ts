import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { AvatarGroupComponent } from './avatar-group.component';
import { AvatarItem } from './avatar.types';

@Component({
  standalone: true,
  imports: [AvatarComponent, AvatarGroupComponent],
  template: `
    <orc-avatar-group
      [items]="items()"
      [max]="max()"
      [excessCount]="excessCount()"
      [size]="size()"
      [label]="label"
    >
      <orc-avatar name="Projected member"></orc-avatar>
    </orc-avatar-group>
  `,
})
class AvatarGroupHostComponent {
  readonly items = signal<AvatarItem[]>([
    { name: 'Ada Lovelace' },
    { name: 'Grace Hopper' },
    { name: 'Katherine Johnson' },
  ]);
  readonly max = signal(2);
  readonly excessCount = signal(0);
  readonly size = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  readonly label = 'Project team';
}

describe('AvatarGroupComponent contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarGroupHostComponent],
    }).compileComponents();
  });

  it('renders items mode exclusively and exposes bounded overflow semantics', () => {
    const fixture = TestBed.createComponent(AvatarGroupHostComponent);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector(
      '.orc-avatar-group',
    ) as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Project team');
    expect(group.classList.contains('orc-avatar-group--size-lg')).toBeTrue();
    expect(group.querySelector('[aria-label="Ada Lovelace"]')).not.toBeNull();
    expect(group.querySelector('[aria-label="Grace Hopper"]')).not.toBeNull();
    expect(group.querySelector('[aria-label="Katherine Johnson"]')).toBeNull();
    expect(group.querySelector('[aria-label="Projected member"]')).toBeNull();
    expect(group.querySelector('[aria-label="Mais 1 membros"]')).not.toBeNull();

    fixture.componentInstance.excessCount.set(7);
    fixture.detectChanges();
    expect(group.querySelector('[aria-label="Mais 7 membros"]')).not.toBeNull();
    fixture.destroy();
  });

  it('renders projected avatars when the items collection is empty', () => {
    const fixture = TestBed.createComponent(AvatarGroupHostComponent);
    fixture.componentInstance.items.set([]);
    fixture.componentInstance.max.set(0);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector(
      '.orc-avatar-group',
    ) as HTMLElement;
    expect(
      group.querySelector('[aria-label="Projected member"]'),
    ).not.toBeNull();
    expect(group.querySelector('[aria-label="Ada Lovelace"]')).toBeNull();
    expect(group.querySelector('.orc-avatar-group__excess')).toBeNull();
    fixture.destroy();
  });
});
