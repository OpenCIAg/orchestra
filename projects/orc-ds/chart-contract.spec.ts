import { TestBed } from '@angular/core/testing';
import { ChartComponent, ChartData } from './p2/p2-chart-editor-components';

describe('ChartComponent contract', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('reports unsupported chart types and renders pie and doughnut geometry distinctly', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('type', 'scatter');
    fixture.componentRef.setInput('data', {
      labels: ['Only'],
      datasets: [{ data: [4] }],
    } satisfies ChartData);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.unsupported')?.textContent,
    ).toContain('Unsupported chart type: scatter');
    expect(fixture.nativeElement.querySelector('path')).toBeNull();

    for (const unsupportedType of ['bubble', 'polarArea', 'radar'] as const) {
      fixture.componentRef.setInput('type', unsupportedType);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.unsupported')?.textContent,
      ).toContain(`Unsupported chart type: ${unsupportedType}`);
      expect(fixture.nativeElement.querySelector('path')).toBeNull();
    }

    fixture.componentRef.setInput('type', 'pie');
    fixture.detectChanges();
    const piePath = fixture.nativeElement.querySelector(
      'path',
    ) as SVGPathElement;
    expect(piePath.getAttribute('d')).toContain('A 20 20 0 1 1');
    expect(piePath.getAttribute('d')).not.toContain('A 10 10');

    fixture.componentRef.setInput('type', 'doughnut');
    fixture.detectChanges();
    const doughnutPath = fixture.nativeElement.querySelector(
      'path',
    ) as SVGPathElement;
    expect(doughnutPath.getAttribute('d')).toContain('A 20 20 0 1 1');
    expect(doughnutPath.getAttribute('d')).toContain('A 10 10');
    expect(doughnutPath.getAttribute('fill-rule')).toBe('evenodd');

    fixture.componentRef.setInput('data', {
      labels: ['Large A', 'Large B'],
      datasets: [{ data: [Number.MAX_VALUE, Number.MAX_VALUE] }],
    } satisfies ChartData);
    fixture.detectChanges();
    const largePaths = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('path'),
    ) as SVGPathElement[];
    expect(
      largePaths.every((path) => !path.getAttribute('d')?.includes('NaN')),
    ).toBeTrue();
  });

  it('normalizes non-finite and negative values into finite in-view geometry', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', {
      labels: ['Negative', 'NaN', 'Infinity'],
      datasets: [{ data: [-10, Number.NaN, Number.POSITIVE_INFINITY] }],
    } satisfies ChartData);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const rects = Array.from(root.querySelectorAll<SVGRectElement>('rect'));
    expect(rects).toHaveSize(3);
    for (const rect of rects) {
      for (const attribute of ['x', 'y', 'width', 'height']) {
        const value = Number(rect.getAttribute(attribute));
        expect(Number.isFinite(value)).toBeTrue();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }

    fixture.componentRef.setInput('data', {
      labels: ['Negative', 'Positive'],
      datasets: [{ data: [-5, 5] }],
    } satisfies ChartData);
    fixture.detectChanges();
    const signedBars = Array.from(
      root.querySelectorAll<SVGRectElement>('rect'),
    );
    expect(Number(signedBars[0].getAttribute('y'))).toBe(30);
    expect(Number(signedBars[1].getAttribute('y'))).toBe(6);
    expect(Number(signedBars[0].getAttribute('height'))).toBeGreaterThan(0);
    expect(Number(signedBars[1].getAttribute('height'))).toBeGreaterThan(0);
    const zeroAxis = root.querySelectorAll<SVGLineElement>('.grid line')[1];
    expect(Number(zeroAxis.getAttribute('y1'))).toBe(30);
    expect(Number(zeroAxis.getAttribute('y2'))).toBe(30);

    fixture.componentRef.setInput('type', 'line');
    fixture.detectChanges();
    const points = Array.from(
      root.querySelectorAll<SVGCircleElement>('circle'),
    );
    expect(points).toHaveSize(2);
    expect(Number(points[0].getAttribute('cy'))).toBe(54);
    expect(Number(points[1].getAttribute('cy'))).toBe(6);
    expect(Number(zeroAxis.getAttribute('y1'))).toBe(30);
    for (const point of points) {
      expect(Number.isFinite(Number(point.getAttribute('cx')))).toBeTrue();
      expect(Number.isFinite(Number(point.getAttribute('cy')))).toBeTrue();
      expect(Number(point.getAttribute('cy'))).toBeGreaterThanOrEqual(0);
      expect(Number(point.getAttribute('cy'))).toBeLessThanOrEqual(60);
    }
  });

  it('keeps points available when dataset values outnumber labels', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', {
      labels: ['Named'],
      datasets: [
        { label: 'North', data: [2, 3] },
        { label: 'South', data: [4] },
      ],
    } satisfies ChartData);
    fixture.detectChanges();

    const points = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<SVGRectElement>(
        'rect[role="button"]',
      ),
    );
    expect(points.map((point) => point.getAttribute('aria-label'))).toEqual([
      'North, Named, value 2',
      'North, Point 2, value 3',
      'South, Named, value 4',
    ]);
    expect(
      points.map((point) => point.getAttribute('data-chart-point-order')),
    ).toEqual(['0', '1', '2']);
  });

  it('honors presentation and accessible-name inputs and exports the rendered SVG', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('width', '480px');
    fixture.componentRef.setInput('height', '320px');
    fixture.componentRef.setInput('styleClass', 'custom-chart');
    fixture.componentRef.setInput('ariaLabelledBy', 'chart-title');
    fixture.componentRef.setInput('plugins', [{ id: 'compatibility-only' }]);
    fixture.componentRef.setInput('responsive', false);
    fixture.componentRef.setInput('data', {
      labels: ['Revenue'],
      datasets: [{ data: [8] }],
    } satisfies ChartData);
    fixture.detectChanges();

    const chart = fixture.nativeElement.querySelector(
      '.orc-chart',
    ) as HTMLElement;
    const svg = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    expect(chart.classList.contains('custom-chart')).toBeTrue();
    expect(chart.style.width).toBe('480px');
    expect(chart.style.height).toBe('320px');
    expect(svg.getAttribute('aria-label')).toBeNull();
    expect(svg.getAttribute('aria-labelledby')).toBe('chart-title');
    expect(fixture.nativeElement.querySelectorAll('rect')).toHaveSize(1);

    const image = fixture.componentInstance.getBase64Image();
    expect(image).toMatch(/^data:image\/svg\+xml;base64,/);
    const serialized = atob(image!.slice(image!.indexOf(',') + 1));
    expect(serialized).toContain('<svg');
    expect(serialized).toContain('aria-labelledby="chart-title"');
  });

  it('uses one roving chart tab stop and preserves point identity across input methods', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('ariaLabel', 'Revenue chart');
    fixture.componentRef.setInput('data', {
      labels: ['Q1', 'Q2'],
      datasets: [
        { label: 'North', data: [1, 2] },
        { label: 'South', data: [3, 4] },
      ],
    } satisfies ChartData);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-label')).toBe('Revenue chart');
    const points = Array.from(
      root.querySelectorAll<SVGRectElement>('rect[role="button"]'),
    );
    expect(points).toHaveSize(4);
    expect(points[0].getAttribute('aria-label')).toBe('North, Q1, value 1');
    expect(points.map((point) => point.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
      '-1',
    ]);

    const clicked: number[] = [];
    const selected: Array<{
      index: number;
      datasetIndex?: number;
      originalEvent?: Event;
    }> = [];
    fixture.componentInstance.pointClick.subscribe((index) =>
      clicked.push(index),
    );
    fixture.componentInstance.onDataSelect.subscribe((event) =>
      selected.push(event),
    );

    const key = (point: SVGElement, keyName: string): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', {
        key: keyName,
        bubbles: true,
        cancelable: true,
      });
      point.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };

    points[2].focus();
    fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[2]);
    expect(points.map((point) => point.tabIndex)).toEqual([-1, -1, 0, -1]);
    expect(key(points[2], 'ArrowRight').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[3]);
    expect(points.map((point) => point.tabIndex)).toEqual([-1, -1, -1, 0]);
    expect(key(points[3], 'ArrowDown').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[3]);
    expect(key(points[3], 'ArrowLeft').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[2]);
    expect(key(points[2], 'ArrowUp').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[1]);
    expect(key(points[1], 'Home').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[0]);
    expect(key(points[0], 'ArrowRight').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[1]);
    expect(key(points[1], 'ArrowRight').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[2]);
    expect(key(points[2], 'ArrowDown').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[3]);
    expect(key(points[3], 'End').defaultPrevented).toBeTrue();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[3]);
    expect(clicked).toEqual([]);
    expect(selected).toEqual([]);

    expect(key(points[3], 'Enter').defaultPrevented).toBeTrue();
    expect(clicked).toEqual([1]);
    expect(selected).toHaveSize(1);
    expect(selected[0].datasetIndex).toBe(1);
    expect(selected[0].index).toBe(1);
    expect(selected[0].originalEvent?.type).toBe('keydown');
    const repeatedEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      repeat: true,
      bubbles: true,
      cancelable: true,
    });
    points[3].dispatchEvent(repeatedEnter);
    fixture.detectChanges();
    expect(repeatedEnter.defaultPrevented).toBeTrue();
    expect(clicked).toEqual([1]);
    expect(selected).toHaveSize(1);
    expect(key(points[3], ' ').defaultPrevented).toBeTrue();
    expect(clicked).toEqual([1, 1]);
    expect(selected).toHaveSize(2);
    expect(selected[1].originalEvent?.type).toBe('keydown');

    points[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(points[1]);
    expect(points.map((point) => point.tabIndex)).toEqual([-1, 0, -1, -1]);
    expect(clicked).toEqual([1, 1, 1]);
    expect(selected).toHaveSize(3);
    expect(selected[2].datasetIndex).toBe(0);
    expect(selected[2].index).toBe(1);

    fixture.componentRef.setInput('type', 'line');
    fixture.detectChanges();
    expect(
      Array.from(root.querySelectorAll('.legend span')).map((item) =>
        item.textContent?.trim(),
      ),
    ).toEqual(['North', 'South']);
    expect(fixture.componentInstance.generateLegend()).toBe('North, South');
    const linePoints = Array.from(
      root.querySelectorAll<SVGCircleElement>('circle[role="button"]'),
    );
    expect(linePoints[0].getAttribute('aria-label')).toBe('North, Q1, value 1');
    expect(linePoints.filter((point) => point.tabIndex === 0)).toHaveSize(1);
    expect(linePoints[1].tabIndex).toBe(0);
    key(linePoints[1], 'ArrowDown');
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(
      linePoints[2],
    );
    expect(linePoints[2].getAttribute('aria-label')).toBe('South, Q1, value 3');

    for (const type of ['pie', 'doughnut'] as const) {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();
      expect(root.querySelectorAll('[role="button"][tabindex="0"]')).toHaveSize(
        1,
      );
      expect(
        Array.from(root.querySelectorAll<SVGElement>('[role="button"]')).filter(
          (point) => point.tabIndex === 0,
        ),
      ).toHaveSize(1);
    }
  });

  it('keeps roving focus valid when chart data shrinks, empties, and returns', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', {
      labels: ['First', 'Second', 'Third'],
      datasets: [{ data: [1, 2, 3] }],
    } satisfies ChartData);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    let points = Array.from(
      root.querySelectorAll<SVGRectElement>('rect[role="button"]'),
    );
    points[2].focus();
    fixture.detectChanges();
    expect(points.map((point) => point.tabIndex)).toEqual([-1, -1, 0]);

    fixture.componentRef.setInput('data', {
      labels: ['Only'],
      datasets: [{ data: [4] }],
    } satisfies ChartData);
    fixture.detectChanges();
    points = Array.from(
      root.querySelectorAll<SVGRectElement>('rect[role="button"]'),
    );
    expect(points).toHaveSize(1);
    expect(points[0].tabIndex).toBe(0);

    fixture.componentRef.setInput('data', {
      labels: [],
      datasets: [],
    } satisfies ChartData);
    fixture.detectChanges();
    expect(root.querySelectorAll('[role="button"]')).toHaveSize(0);

    const restoredData: ChartData = {
      labels: ['Back', 'Again'],
      datasets: [{ data: [5, 6] }],
    };
    fixture.componentRef.setInput('data', restoredData);
    fixture.detectChanges();
    points = Array.from(
      root.querySelectorAll<SVGRectElement>('rect[role="button"]'),
    );
    expect(points).toHaveSize(2);
    expect(points.filter((point) => point.tabIndex === 0)).toHaveSize(1);
    expect(points[0].tabIndex).toBe(0);

    points[1].focus();
    fixture.detectChanges();
    restoredData.datasets[0].data.splice(1, 1);
    restoredData.labels.splice(1, 1);
    fixture.componentInstance.refresh();
    fixture.detectChanges();
    points = Array.from(
      root.querySelectorAll<SVGRectElement>('rect[role="button"]'),
    );
    expect(points).toHaveSize(1);
    expect(points[0].tabIndex).toBe(0);
  });

  it('makes refresh and reinit update calculations after in-place data changes', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    const data: ChartData = {
      labels: ['First', 'Second'],
      datasets: [{ data: [1, 2] }],
    };
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
    const initialHeight = Number(
      (
        fixture.nativeElement.querySelector('rect') as SVGRectElement
      ).getAttribute('height'),
    );
    data.datasets[0].data[0] = 10;
    fixture.componentInstance.refresh();
    fixture.detectChanges();
    const refreshedHeight = Number(
      (
        fixture.nativeElement.querySelector('rect') as SVGRectElement
      ).getAttribute('height'),
    );
    expect(refreshedHeight).toBeGreaterThan(initialHeight);
    data.datasets[0].data[0] = 1;
    fixture.componentInstance.reinit();
    fixture.detectChanges();
    const reinitializedHeight = Number(
      (
        fixture.nativeElement.querySelector('rect') as SVGRectElement
      ).getAttribute('height'),
    );
    expect(reinitializedHeight).toBeLessThan(refreshedHeight);

    fixture.componentRef.setInput('type', 'doughnut');
    fixture.detectChanges();
    const initialPath = (
      fixture.nativeElement.querySelector('path') as SVGPathElement
    ).getAttribute('d');
    data.datasets[0].data[0] = 2;
    fixture.componentInstance.refresh();
    fixture.detectChanges();
    const refreshedPath = (
      fixture.nativeElement.querySelector('path') as SVGPathElement
    ).getAttribute('d');
    expect(refreshedPath).not.toBe(initialPath);
  });
});
