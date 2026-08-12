// src/app/pages/components/select/select-page.component.ts

import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SelectComponent, OptionComponent, SelectOption } from '../../../shared/select';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SelectComponent,
    OptionComponent,
    FooterComponent,
  ],
  templateUrl: './select-page.component.html',
  styleUrl: './select-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPageComponent {
  // ── Playground State Signals ─────────────────────────────────
  readonly singleValue = signal<string>('p1');
  readonly multiValue = signal<string[]>(['usr1', 'usr3']);
  readonly searchableValue = signal<string>('');

  // ── Options Data Mode ────────────────────────────────────────
  readonly dataOptions: SelectOption[] = [
    { label: 'Projeto Principal', value: 'p1', icon: 'ph ph-star', description: 'Repositório core' },
    { label: 'Design System', value: 'p2', icon: 'ph ph-palette', description: 'Tokens e componentes' },
    { label: 'Componentes UI', value: 'p3', icon: 'ph ph-folder', description: 'Biblioteca Angular' },
    { label: 'Documentação', value: 'p4', icon: 'ph ph-book-open', description: 'Guias e APIs' },
    { label: 'Protótipos', value: 'p5', icon: 'ph ph-squares-four', description: 'Figma e telas' },
  ];

  readonly teamOptions: SelectOption[] = [
    { label: 'Ana Silva', value: 'usr1', avatarUrl: 'https://i.pravatar.cc/100?img=1', description: 'Lead Designer' },
    { label: 'Bruno Souza', value: 'usr2', avatarUrl: 'https://i.pravatar.cc/100?img=2', description: 'Frontend Dev' },
    { label: 'Carla Lima', value: 'usr3', avatarUrl: 'https://i.pravatar.cc/100?img=3', description: 'Product Manager' },
    { label: 'Diego Alves', value: 'usr4', avatarUrl: 'https://i.pravatar.cc/100?img=4', description: 'Backend Engineer' },
  ];

  // ── Reactive Form (ControlValueAccessor test) ─────────────
  readonly demoForm = new FormGroup({
    category: new FormControl('', [Validators.required]),
    tags: new FormControl<string[]>(['p2'], [Validators.required]),
  });

  onSubmitForm(): void {
    if (this.demoForm.valid) {
      alert(`Formulário enviado com sucesso:\n${JSON.stringify(this.demoForm.value, null, 2)}`);
    } else {
      this.demoForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.demoForm.reset({
      category: '',
      tags: [],
    });
  }
}
