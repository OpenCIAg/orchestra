import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.update());

    this.update();
  }

  private update(): void {
    const route = this.getDeepestRoute(this.router.routerState.snapshot.root);
    const pageTitle = route.title || 'Orchestra Design System — Angular Components';
    const description = route.data['description'] as string ||
      'Orchestra é um design system Angular com componentes standalone, Signals, acessibilidade WCAG 2.1 AA, tokens e APIs TypeScript estritas.';
    const path = this.router.url.split(/[?#]/, 1)[0] || '/';
    const canonical = `${this.document.location?.origin || 'https://orchestra.ciag.org.br'}${path === '/' ? '/' : path}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    let canonicalLink = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');
      canonicalLink.rel = 'canonical';
      this.document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  }

  private getDeepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
