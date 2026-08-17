import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EasterEggService {
  readonly isOpen = signal<boolean>(false);
  
  private clickCount = 0;
  private clickTimeout: any;

  trigger() {
    this.clickCount++;
    
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    if (this.clickCount >= 3) {
      this.isOpen.set(true);
      this.clickCount = 0;
    } else {
      this.clickTimeout = setTimeout(() => {
        this.clickCount = 0;
      }, 500); // 500ms to click 3 times
    }
  }

  close() {
    this.isOpen.set(false);
  }
}

