import { Component, ElementRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { OptionComponent } from './option.component';
import { SelectComponent } from './select.component';

@Component({
  standalone: true,
  imports: [SelectComponent, OptionComponent],
  template: `<orc-select
    label="City"
    [multiple]="true"
    [helperText]="helper()"
    [errorMessage]="error()"
    ><orc-option value="a">Alpha</orc-option
    ><orc-option value="b" disabled>Beta</orc-option
    ><orc-option value="c" [disabled]="disableGamma()"
      >Gamma</orc-option
    ></orc-select
  >`,
})
class ProjectedSelectHost {
  error = signal('');
  helper = signal('Choose a city');
  disableGamma = signal(false);
}

@Component({
  standalone: true,
  imports: [OptionComponent],
  template: `<div (click)="clicks = clicks + 1">
    <orc-option value="orphan"></orc-option>
  </div>`,
})
class StandaloneOptionHost {
  clicks = 0;
}

@Component({
  standalone: true,
  imports: [SelectComponent, OptionComponent],
  template: `<orc-select>
    <orc-option value="value-only" icon="pi pi-star"></orc-option>
    <orc-option value="projected">Projected label</orc-option>
    <orc-option icon="pi pi-info"></orc-option>
    <orc-option [value]="objectValue"></orc-option>
  </orc-select>`,
})
class OptionAccessibilityHost {
  objectValue = { id: 1 };
}

@Component({
  standalone: true,
  imports: [SelectComponent, OptionComponent],
  template: `<orc-select searchable filterLocale="tr-TR">
    <orc-option value="istanbul">Istanbul</orc-option>
  </orc-select>`,
})
class TurkishProjectedSelectHost {}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent],
  template: `<orc-select
    multiple
    [options]="options"
    [formControl]="control"
  ></orc-select>`,
})
class SelectBlurFormHost {
  readonly control = new FormControl<string[]>([], {
    nonNullable: true,
    updateOn: 'blur',
  });
  readonly options = [
    { label: 'Alpha', value: 'a' },
    { label: 'Beta', value: 'b' },
  ];
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent],
  template: `<orc-select
    multiple
    searchable
    [options]="options"
    [formControl]="control"
  ></orc-select>`,
})
class SearchableSelectBlurFormHost {
  readonly control = new FormControl<string[]>([], {
    nonNullable: true,
    updateOn: 'blur',
  });
  readonly options = [
    { label: 'Alpha', value: 'a' },
    { label: 'Beta', value: 'b' },
  ];
}

function dispatchKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('Select repairs', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OverlayModule,
        SelectComponent,
        OptionComponent,
        ProjectedSelectHost,
        StandaloneOptionHost,
        OptionAccessibilityHost,
        TurkishProjectedSelectHost,
        SelectBlurFormHost,
        SearchableSelectBlurFormHost,
      ],
    }).compileComponents();
  });

  it('navigates projected options by visible index and selects the option named by aria-activedescendant', () => {
    const fixture = TestBed.createComponent(ProjectedSelectHost);
    const select = fixture.nativeElement.querySelector(
      'orc-select',
    ) as HTMLElement;
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    component.writeValue(['a']);
    fixture.detectChanges();

    const trigger = select.querySelector('[role="combobox"]') as HTMLElement;
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();

    const activeId = trigger.getAttribute('aria-activedescendant');
    expect(activeId).toBe(component.projectedOptions()[2].defaultId);
    expect(document.getElementById(activeId!)).toBeTruthy();
    expect(component.projectedOptions()[1].isActive()).toBeFalse();

    dispatchKey(trigger, 'Enter');
    fixture.detectChanges();
    expect(component.value()).toEqual(['a', 'c']);
  });

  it('connects generated label, helper, and message-only error descriptions', () => {
    const fixture = TestBed.createComponent(ProjectedSelectHost);
    const select = fixture.nativeElement.querySelector(
      'orc-select',
    ) as HTMLElement;
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    const trigger = select.querySelector('[role="combobox"]') as HTMLElement;

    expect(trigger.getAttribute('aria-labelledby')).toBe(component.labelId());
    expect(document.getElementById(component.labelId())?.textContent).toContain(
      'City',
    );
    expect(trigger.getAttribute('aria-describedby')).toBe(component.helperId());
    expect(
      document.getElementById(component.helperId())?.textContent,
    ).toContain('Choose a city');

    fixture.componentInstance.error.set('Required');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.getAttribute('aria-describedby')).toBe(component.errorId());
    expect(document.getElementById(component.errorId())?.textContent).toContain(
      'Required',
    );
  });

  it('clears a projected active highlight when that option becomes disabled', () => {
    const fixture = TestBed.createComponent(ProjectedSelectHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;

    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(
      component.projectedOptions()[2].defaultId,
    );

    fixture.componentInstance.disableGamma.set(true);
    fixture.detectChanges();
    expect(trigger.hasAttribute('aria-activedescendant')).toBeFalse();
    expect(component.projectedOptions()[2].isActive()).toBeFalse();
  });

  it('skips disabled data options while keeping active descendants and Enter on the same DOM option', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { label: 'A', value: 'a' },
      { label: 'Disabled', value: 'b', disabled: true },
      { label: 'C', value: 'c' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    dispatchKey(trigger, 'ArrowDown');
    fixture.detectChanges();
    const activeId = trigger.getAttribute('aria-activedescendant');
    expect(activeId).toBe(`${component.listboxId()}-option-2`);
    expect(document.getElementById(activeId!)?.textContent).toContain('C');
    dispatchKey(trigger, 'Enter');
    fixture.detectChanges();
    expect(component.value()).toBe('c');
  });

  it('assigns distinct option IDs to repeated references in the data source', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    const duplicate = { label: 'Repeated', value: 'repeat' };
    fixture.componentRef.setInput('options', [duplicate, duplicate]);
    fixture.detectChanges();
    component.openPanel();
    fixture.detectChanges();

    const rendered = Array.from(
      document
        .getElementById(component.listboxId())!
        .querySelectorAll<HTMLElement>('[role="option"]'),
    );
    expect(rendered.map((option) => option.id)).toEqual([
      `${component.listboxId()}-option-0`,
      `${component.listboxId()}-option-1`,
    ]);
    expect(new Set(rendered.map((option) => option.id)).size).toBe(2);
  });

  it('keeps searchable filtering enabled when the compatibility filter input is omitted', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('searchable', true);
    fixture.componentRef.setInput('options', [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
    ]);
    fixture.detectChanges();

    expect(component.filterEnabled()).toBeTrue();
    component.openPanel();
    fixture.detectChanges();
    expect(
      document
        .getElementById(component.listboxId())
        ?.parentElement?.querySelector('.orc-select-search-input'),
    ).not.toBeNull();
  });

  it('applies the configured locale before case-folding data and projected filters', () => {
    const dataFixture = TestBed.createComponent(SelectComponent);
    const dataSelect = dataFixture.componentInstance;
    dataFixture.componentRef.setInput('options', [
      { label: 'Istanbul', value: 'istanbul' },
    ]);
    dataFixture.componentRef.setInput('filterLocale', 'tr-TR');
    dataSelect.searchTerm.set('I');
    dataFixture.detectChanges();
    expect(dataSelect.filteredDataOptions()).toHaveSize(1);

    const projectedFixture = TestBed.createComponent(
      TurkishProjectedSelectHost,
    );
    projectedFixture.detectChanges();
    const projectedSelect = projectedFixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    projectedSelect.searchTerm.set('I');
    projectedFixture.detectChanges();
    expect(projectedSelect.projectedOptions()[0].isHidden()).toBeFalse();
  });

  it('defers multiple-selection CVA updates until the composite control blurs', () => {
    const fixture = TestBed.createComponent(SelectBlurFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const component = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;

    trigger.focus();
    component.openPanel();
    fixture.detectChanges();
    const option = document.getElementById(
      `${component.listboxId()}-option-0`,
    ) as HTMLElement;
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.value()).toEqual(['a']);
    expect(host.control.value).toEqual([]);
    expect(host.control.touched).toBeFalse();

    trigger.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    fixture.detectChanges();
    expect(host.control.value).toEqual(['a']);
    expect(host.control.touched).toBeTrue();
    fixture.destroy();
  });

  it('keeps searchable Select focus internal until focus leaves the portaled panel', () => {
    const fixture = TestBed.createComponent(SearchableSelectBlurFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const component = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;
    let blurCount = 0;
    component.blur.subscribe(() => blurCount++);

    trigger.focus();
    component.openPanel();
    fixture.detectChanges();
    const search = document.querySelector(
      '.orc-select-search-input',
    ) as HTMLInputElement;
    expect(search).not.toBeNull();
    search.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(search);
    expect(host.control.touched).toBeFalse();
    expect(blurCount).toBe(0);

    const option = document.getElementById(
      `${component.listboxId()}-option-0`,
    ) as HTMLElement;
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toEqual(['a']);
    expect(host.control.value).toEqual([]);
    expect(host.control.touched).toBeFalse();

    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    fixture.detectChanges();

    expect(host.control.touched).toBeTrue();
    expect(host.control.value).toEqual(['a']);
    expect(blurCount).toBe(1);
    expect(component.isOpen()).toBeFalse();
    outside.remove();
    fixture.destroy();
  });

  it('marks a focused searchable Select touched when an outside click closes its panel', () => {
    const fixture = TestBed.createComponent(SearchableSelectBlurFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const component = fixture.debugElement.query(By.directive(SelectComponent))
      .componentInstance as SelectComponent;
    const trigger = fixture.nativeElement.querySelector(
      '[role="combobox"]',
    ) as HTMLElement;
    let blurCount = 0;
    component.blur.subscribe(() => blurCount++);

    trigger.focus();
    component.openPanel();
    fixture.detectChanges();
    const search = document.querySelector(
      '.orc-select-search-input',
    ) as HTMLInputElement;
    search.focus();
    fixture.detectChanges();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.control.touched).toBeTrue();
    expect(blurCount).toBe(1);
    expect(component.isOpen()).toBeFalse();
    outside.remove();
    fixture.destroy();
  });

  it('names clear and selected-chip removal actions, with caller overrides', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('options', [{ label: 'Alpha', value: 'a' }]);
    component.writeValue(['a']);
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector(
      '.orc-select-clear-btn',
    ) as HTMLButtonElement;
    const remove = fixture.nativeElement.querySelector(
      '.orc-chip-remove',
    ) as HTMLButtonElement;
    expect(clear.getAttribute('aria-label')).toBe('Clear selection');
    expect(remove.getAttribute('aria-label')).toBe('Remove Alpha');

    fixture.componentRef.setInput('clearAriaLabel', 'Clear chosen values');
    fixture.componentRef.setInput(
      'removeOptionAriaLabel',
      'Remove chosen value',
    );
    fixture.detectChanges();
    expect(clear.getAttribute('aria-label')).toBe('Clear chosen values');
    expect(remove.getAttribute('aria-label')).toBe('Remove chosen value');
  });

  it('renders an announced default loading state and honors the loading icon/message inputs', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    component.openPanel();
    fixture.detectChanges();

    const listbox = document.getElementById(component.listboxId())!;
    const loadingView = listbox.querySelector(
      '.orc-select-empty-state',
    ) as HTMLElement;
    const liveStatus = fixture.nativeElement.querySelector(
      '.orc-select-sr-only',
    ) as HTMLElement;
    expect(liveStatus.getAttribute('role')).toBe('status');
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');
    expect(liveStatus.textContent).toContain('Loading options');
    expect(loadingView.getAttribute('aria-hidden')).toBe('true');
    expect(loadingView.textContent).toContain('Loading options');
    expect(listbox.querySelector('[role="option"]')).toBeNull();

    fixture.componentRef.setInput('loadingIcon', 'pi pi-spinner');
    fixture.componentRef.setInput('loadingMessage', 'Fetching cities');
    fixture.detectChanges();
    expect(loadingView.querySelector('i')?.className).toBe('pi pi-spinner');
    expect(
      loadingView.querySelector('i')?.getAttribute('aria-hidden'),
    ).toBeNull();
    expect(liveStatus.textContent).toContain('Fetching cities');
    expect(loadingView.textContent).toContain('Fetching cities');
    fixture.destroy();
  });

  it('announces default and custom empty states for data and projected options', () => {
    const dataFixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const dataSelect = dataFixture.componentInstance;
    dataFixture.componentRef.setInput('options', []);
    dataFixture.detectChanges();
    dataSelect.openPanel();
    dataFixture.detectChanges();

    const dataStatus = dataFixture.nativeElement.querySelector(
      '.orc-select-sr-only',
    ) as HTMLElement;
    const dataListbox = document.getElementById(dataSelect.listboxId())!;
    expect(dataStatus.textContent).toContain('No options available');
    expect(
      dataListbox.querySelector('.orc-select-empty-state')?.textContent,
    ).toContain('No options available');

    dataFixture.componentRef.setInput('options', [
      { label: 'Alpha', value: 'a' },
    ]);
    dataSelect.searchTerm.set('missing');
    dataFixture.detectChanges();
    expect(dataStatus.textContent).toContain('No results found');
    dataFixture.componentRef.setInput('emptyFilterMessage', 'No city matches');
    dataFixture.detectChanges();
    expect(dataStatus.textContent).toContain('No city matches');
    dataFixture.destroy();

    const projectedFixture = TestBed.createComponent(
      TurkishProjectedSelectHost,
    );
    projectedFixture.detectChanges();
    const projectedSelect = projectedFixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    projectedSelect.openPanel();
    projectedSelect.searchTerm.set('missing');
    projectedFixture.detectChanges();
    const projectedStatus = projectedFixture.nativeElement.querySelector(
      '.orc-select-sr-only',
    ) as HTMLElement;
    const projectedListbox = document.getElementById(
      projectedSelect.listboxId(),
    )!;
    expect(projectedStatus.textContent).toContain('No results found');
    expect(
      projectedListbox.querySelector('.orc-select-empty-state')?.textContent,
    ).toContain('No results found');
    projectedFixture.destroy();
  });

  it('matches object CVA values by dataKey when optionValue returns primitives', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { label: 'Alpha', value: 'a', id: 1 } as any,
    ]);
    fixture.componentRef.setInput('optionValue', 'id');
    fixture.componentRef.setInput('dataKey', 'id');
    fixture.detectChanges();

    component.writeValue({ id: 1 });
    fixture.detectChanges();
    expect(
      component.isDataOptionSelected(component.dataOptions()[0]),
    ).toBeTrue();
    expect(component.selectedItems()[0].label).toBe('Alpha');
  });

  it('closes when disabled state changes while the panel is open', () => {
    const fixture: ComponentFixture<SelectComponent> =
      TestBed.createComponent(SelectComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.openPanel();
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
  });

  it('keeps an orphan option out of listbox semantics and does not swallow its click', () => {
    const fixture = TestBed.createComponent(StandaloneOptionHost);
    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector(
      'orc-option',
    ) as HTMLElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    option.dispatchEvent(click);
    fixture.detectChanges();

    expect(option.getAttribute('role')).toBeNull();
    expect(option.getAttribute('aria-selected')).toBeNull();
    expect(option.getAttribute('aria-disabled')).toBeNull();
    expect(click.defaultPrevented).toBeFalse();
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('names value-only and icon-only options without overriding projected text', () => {
    const fixture = TestBed.createComponent(OptionAccessibilityHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as SelectComponent;
    component.openPanel();
    fixture.detectChanges();

    const options = component.projectedOptions();
    const valueOnly = document.getElementById(options[0].defaultId)!;
    const projected = document.getElementById(options[1].defaultId)!;
    const iconOnly = document.getElementById(options[2].defaultId)!;
    const objectValue = document.getElementById(options[3].defaultId)!;

    expect(valueOnly.getAttribute('role')).toBe('option');
    expect(valueOnly.getAttribute('aria-label')).toBe('value-only');
    expect(projected.getAttribute('aria-label')).toBeNull();
    expect(iconOnly.getAttribute('aria-label')).toBe('Option');
    expect(objectValue.getAttribute('aria-label')).toBe('Option');
  });

  it('does not select a disabled projected option through the parent API', () => {
    const fixture = TestBed.createComponent(ProjectedSelectHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as SelectComponent;

    component.onOptionSelected(component.projectedOptions()[1]);
    fixture.detectChanges();

    expect(component.value()).toBeUndefined();
  });

  it('classifies outside-click targets with the select host document realm', () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument)
      throw new Error('same-origin iframe document unavailable');

    const host = frameDocument.createElement('div');
    frameDocument.body.appendChild(host);
    const inside = frameDocument.createElement('span');
    host.appendChild(inside);
    (component as unknown as { hostEl: ElementRef<HTMLElement> }).hostEl =
      new ElementRef(host);
    component.isOpen.set(true);

    component.onDocumentClick(inside);
    expect(component.isOpen()).toBeTrue();

    component.onDocumentClick(frameDocument.body);
    expect(component.isOpen()).toBeFalse();

    fixture.destroy();
    frame.remove();
  });
});
