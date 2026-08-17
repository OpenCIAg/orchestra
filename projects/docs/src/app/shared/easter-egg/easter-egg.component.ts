import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EasterEggService } from '../../services/easter-egg.service';
import { BATON_B64, CIAG_B64, SPOTIFY_B64 } from './images';

@Component({
  selector: 'app-easter-egg',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './easter-egg.component.html',
  styleUrl: './easter-egg.component.scss'
})
export class EasterEggComponent {
  private easterEggService = inject(EasterEggService);
  
  isOpen = this.easterEggService.isOpen;
  showFinalScreen = signal(false);

  batonSrc = BATON_B64;
  ciagSrc = CIAG_B64;
  spotifySrc = SPOTIFY_B64;

  ngOnInit() {
    setTimeout(() => {
      this.showFinalScreen.set(true);
    }, 3500); // 3.5 seconds of animation before showing the final screen
  }

  // Grid config
  columns = 12;
  rows = 12;
  colors = ['#FFFFFF', '#1CEDB9', '#FF6A1C', '#0406AB'];
  
  batons = Array.from({ length: this.columns * this.rows }, (_, i) => {
    const row = Math.floor(i / this.columns);
    const col = i % this.columns;
    return {
      id: i,
      // Diagonal pattern: shift color by 1 each row
      color: this.colors[(col + row) % 4]
    };
  });

  @HostListener('window:keydown.Escape')
  onEscape() {
    if (this.isOpen()) {
      this.easterEggService.close();
    }
  }

  close() {
    this.easterEggService.close();
  }
}
