import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  defineOrcLabels,
  injectOrcLabels,
  mergeOrcLabels,
  ORC_LABELS_PT_BR,
  ORC_SIZES,
  ORC_TONES,
  orcDefaultCompareWith,
  orcId,
  ORCHESTRA_VERSION,
  OrcLabels,
  provideOrcLabels,
} from './index';

/** Collects every leaf of the labels object with its path. */
function leaves(labels: OrcLabels): [string, unknown][] {
  return Object.entries(labels).flatMap(([group, values]) =>
    Object.entries(values as Record<string, unknown>).map(
      ([key, value]) => [`${group}.${key}`, value] as [string, unknown],
    ),
  );
}

@Component({
  selector: 'orc-test-labels-child',
  template: `<span class="close">{{ labels().common.close }}</span
    ><span class="empty">{{ labels().table.empty }}</span>`,
  providers: [provideOrcLabels({ table: { empty: 'Sem projetos' } })],
})
class LabelsChildComponent {
  readonly labels = injectOrcLabels();
}

@Component({
  selector: 'orc-test-labels-host',
  imports: [LabelsChildComponent],
  template: `<span class="host-empty">{{ labels().table.empty }}</span
    ><orc-test-labels-child />`,
})
class LabelsHostComponent {
  readonly labels = injectOrcLabels();
}

describe('@ciag/orchestra/core', () => {
  it('exposes the release version', () => {
    expect(ORCHESTRA_VERSION).toBe('22.4.0-rc.0');
  });

  describe('default labels (pt-BR)', () => {
    it('are the default of injectOrcLabels()', () => {
      const labels = TestBed.runInInjectionContext(() => injectOrcLabels());
      expect(labels()).toBe(ORC_LABELS_PT_BR);
      expect(labels().common.close).toBe('Fechar');
      expect(labels().common.loading).toBe('Carregando');
      expect(labels().selection.clear).toBe('Limpar seleção');
      expect(labels().input.showPassword).toBe('Mostrar senha');
      expect(labels().dialog.close).toBe('Fechar diálogo');
      expect(labels().toast.region).toBe('Notificações');
    });

    it('have no empty text and every function returns text', () => {
      for (const [path, value] of leaves(ORC_LABELS_PT_BR)) {
        if (typeof value === 'function') {
          const text = (value as (...args: unknown[]) => unknown)(2, 5, 'x');
          expect(typeof text)
            .withContext(path)
            .toBe('string');
          expect((text as string).length)
            .withContext(path)
            .toBeGreaterThan(0);
        } else if (Array.isArray(value)) {
          expect(value.length).withContext(path).toBeGreaterThan(0);
        } else {
          expect(typeof value)
            .withContext(path)
            .toBe('string');
          expect((value as string).trim().length)
            .withContext(path)
            .toBeGreaterThan(0);
        }
      }
    });

    it('do not leak the English defaults found in the 22.3 audit', () => {
      const english = [
        'Close',
        'Loading',
        'No results found',
        'Clear selection',
        'Filter options',
        'Previous page',
        'Next page',
        'Show password',
        'Dismiss alert',
        'Select all rows',
        'Copy',
      ];
      const texts = leaves(ORC_LABELS_PT_BR)
        .map(([, value]) => value)
        .filter((value): value is string => typeof value === 'string');
      for (const word of english) expect(texts).not.toContain(word);
    });

    it('format parameterized texts naturally', () => {
      const l = ORC_LABELS_PT_BR;
      expect(l.pagination.page(2, 10)).toBe('Página 2 de 10');
      expect(l.pagination.range(11, 20, 95)).toBe('11–20 de 95');
      expect(l.pagination.range(0, 0, 0)).toBe('0 de 0');
      expect(l.selection.selectedCount(1)).toBe('1 selecionado');
      expect(l.selection.selectedCount(3)).toBe('3 selecionados');
      expect(l.common.remove('Ana')).toBe('Remover Ana');
      expect(l.otp.digit(1, 6)).toBe('Dígito 1 de 6');
      expect(l.fileUpload.limit(1)).toBe('Máximo de 1 arquivo');
      expect(l.fileUpload.limit(4)).toBe('Máximo de 4 arquivos');
      expect(l.rating.star(1, 5)).toBe('1 estrela de 5');
      expect(l.autocomplete.resultsCount(0)).toBe('Nenhum resultado');
      expect(l.fileUpload.sizeUnits).toEqual(['bytes', 'KB', 'MB', 'GB']);
    });
  });

  describe('provideOrcLabels', () => {
    it('merges a partial override and keeps every other default', () => {
      TestBed.configureTestingModule({
        providers: [
          provideOrcLabels({
            common: { close: 'Sair' },
            pagination: { page: (p, t) => `${p}/${t}` },
          }),
        ],
      });
      const labels = TestBed.runInInjectionContext(() => injectOrcLabels())();
      expect(labels.common.close).toBe('Sair');
      expect(labels.common.clear).toBe('Limpar');
      expect(labels.pagination.page(1, 3)).toBe('1/3');
      expect(labels.pagination.first).toBe('Primeira página');
      expect(labels.dialog).toBe(ORC_LABELS_PT_BR.dialog);
    });

    it('composes app-level and component-level providers', () => {
      TestBed.configureTestingModule({
        providers: [provideOrcLabels({ common: { close: 'Sair' } })],
      });
      const fixture = TestBed.createComponent(LabelsHostComponent);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.host-empty')!.textContent).toBe(
        'Nenhum dado encontrado',
      );
      expect(el.querySelector('.empty')!.textContent).toBe('Sem projetos');
      expect(el.querySelector('.close')!.textContent).toBe('Sair');
    });

    it('follows a signal source (runtime language switch)', () => {
      const english = signal({ common: { close: 'Close' } });
      const child = createEnvironmentInjector(
        [provideOrcLabels(english)],
        TestBed.inject(EnvironmentInjector),
      );
      const labels = runInInjectionContext(child, () => injectOrcLabels());
      expect(labels().common.close).toBe('Close');
      english.set({ common: { close: 'Schließen' } });
      expect(labels().common.close).toBe('Schließen');
      expect(labels().common.clear).toBe('Limpar');
    });

    it('accepts a factory that runs in an injection context', () => {
      class AppTexts {
        readonly close = 'Fechar janela';
      }
      TestBed.configureTestingModule({
        providers: [
          AppTexts,
          provideOrcLabels(() => ({
            common: { close: inject(AppTexts).close },
          })),
        ],
      });
      const labels = TestBed.runInInjectionContext(() => injectOrcLabels());
      expect(labels().common.close).toBe('Fechar janela');
    });

    it('accepts a complete language pack', () => {
      const pack = defineOrcLabels(
        mergeOrcLabels(ORC_LABELS_PT_BR, { common: { close: 'X' } }),
      );
      TestBed.configureTestingModule({ providers: [provideOrcLabels(pack)] });
      const labels = TestBed.runInInjectionContext(() => injectOrcLabels());
      expect(labels().common.close).toBe('X');
      expect(labels().tree.label).toBe('Árvore');
    });

    it('ignores undefined override values', () => {
      const merged = mergeOrcLabels(ORC_LABELS_PT_BR, {
        common: { close: undefined },
      });
      expect(merged.common.close).toBe('Fechar');
    });
  });

  describe('shared types and utilities', () => {
    it('lists sizes and tones', () => {
      expect(ORC_SIZES).toEqual(['sm', 'md', 'lg']);
      expect(ORC_TONES).toEqual([
        'neutral',
        'info',
        'success',
        'warning',
        'danger',
      ]);
    });

    it('compares with Object.is by default', () => {
      expect(orcDefaultCompareWith(NaN, NaN)).toBeTrue();
      expect(orcDefaultCompareWith({}, {})).toBeFalse();
    });

    it('generates unique prefixed ids', () => {
      const [a, b] = TestBed.runInInjectionContext(() => [
        orcId('orc-select'),
        orcId('orc-select-'),
      ]);
      expect(a).toMatch(/^orc-select-/);
      expect(b).toMatch(/^orc-select-/);
      expect(a).not.toBe(b);
    });
  });
});
