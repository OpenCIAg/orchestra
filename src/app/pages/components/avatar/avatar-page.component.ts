import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AvatarComponent,
  AvatarGroupComponent,
  AvatarItem,
  AvatarShape,
  AvatarSize,
  AvatarStatus,
  AvatarColorVariant,
} from '../../../shared/avatar';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-avatar-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AvatarComponent,
    AvatarGroupComponent,
    FooterComponent,
  ],
  templateUrl: './avatar-page.component.html',
  styleUrl: './avatar-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarPageComponent {
  // ── Playground Signals ────────────────────────────────────
  readonly playgroundMode = signal<'image' | 'initials' | 'icon'>('image');
  readonly playgroundSize = signal<AvatarSize>('xl');
  readonly playgroundShape = signal<AvatarShape>('circular');
  readonly playgroundStatus = signal<AvatarStatus | undefined>('online');
  readonly playgroundColorVariant = signal<AvatarColorVariant>('default');
  readonly playgroundBordered = signal<boolean>(false);
  readonly playgroundName = signal<string>('Mariana Silva');
  readonly playgroundInitials = signal<string>('MS');
  readonly playgroundSrc = signal<string>(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  );

  // ── Avatar Group Sample List ──────────────────────────────
  readonly teamMembers: AvatarItem[] = [
    { name: 'Alexandre Silva', initials: 'AS', colorVariant: 'primary' },
    { name: 'Carla Lima', initials: 'CL', colorVariant: 'royal' },
    { name: 'Marcos Santos', initials: 'MS', colorVariant: 'orange' },
    { name: 'Julia Pereira', initials: 'JP', colorVariant: 'purple' },
    { name: 'Rodrigo Fernandes', initials: 'RF', colorVariant: 'default' },
  ];

  readonly sampleUsers: AvatarItem[] = [
    {
      src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      name: 'Sofia Rocha',
      status: 'online',
    },
    {
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      name: 'Bruno Ramos',
      status: 'away',
    },
    {
      src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      name: 'Camila Gomes',
      status: 'busy',
    },
    {
      name: 'Thiago Moura',
      initials: 'TM',
      colorVariant: 'orange',
      status: 'offline',
    },
  ];

  setPlaygroundMode(mode: 'image' | 'initials' | 'icon'): void {
    this.playgroundMode.set(mode);
    if (mode === 'image') {
      this.playgroundSrc.set(
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      );
    } else {
      this.playgroundSrc.set('');
    }
  }

  resetPlayground(): void {
    this.playgroundMode.set('image');
    this.playgroundSize.set('xl');
    this.playgroundShape.set('circular');
    this.playgroundStatus.set('online');
    this.playgroundColorVariant.set('default');
    this.playgroundBordered.set(false);
    this.playgroundName.set('Mariana Silva');
    this.playgroundInitials.set('MS');
    this.playgroundSrc.set(
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    );
  }
}
