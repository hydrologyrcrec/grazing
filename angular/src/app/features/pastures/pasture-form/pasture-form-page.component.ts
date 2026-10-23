import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/http/api-error';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ErrorAlertComponent } from '../../../shared/ui/error-alert/error-alert.component';
import { PastureDraftService } from '../data-access/pasture-draft.service';
import { PastureApiService } from '../data-access/pasture-api.service';
import { LandUse } from '../data-access/pasture.models';
import { COLOR_OPTIONS, GRASS_TYPE_OPTIONS, LAND_USE_OPTIONS } from './pasture-form.constants';

@Component({
  selector: 'app-pasture-form-page',
  imports: [ReactiveFormsModule, FormFieldComponent, ErrorAlertComponent],
  templateUrl: './pasture-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastureFormPageComponent {
  private readonly draft = inject(PastureDraftService);
  private readonly api = inject(PastureApiService);
  private readonly router = inject(Router);
  readonly boundary = this.draft.boundary;
  readonly grasses = GRASS_TYPE_OPTIONS;
  readonly colors = COLOR_OPTIONS;
  readonly landUses = LAND_USE_OPTIONS;
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    grazeableAreaAcres: [
      Number((this.boundary()?.areaAcres ?? 0).toFixed(2)),
      [Validators.required, Validators.min(0.0001)],
    ],
    landUse: ['GRAZING' as LandUse, Validators.required],
    grassType: ['Natural grasses', Validators.required],
    color: ['#28a8cf', Validators.required],
    description: ['', Validators.maxLength(10000)],
  });

  constructor() {
    if (!this.boundary()) void this.router.navigate(['/home'], { replaceUrl: true });
  }

  async submit(): Promise<void> {
    const boundary = this.boundary();
    if (!boundary || this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Please correct the submitted values.');
      return;
    }
    const values = this.form.getRawValue();
    if (
      !values.name.trim() ||
      !Number.isFinite(values.grazeableAreaAcres) ||
      values.grazeableAreaAcres > boundary.areaAcres + 0.01
    ) {
      this.error.set('Use a pasture name and a grazeable area no larger than the total area.');
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    try {
      await firstValueFrom(
        this.api.create({
          ...values,
          name: values.name.trim(),
          description: values.description.trim() || null,
          coordinates: boundary.coordinates,
        }),
      );
      this.draft.clear();
      await this.router.navigate(['/home']);
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'Unable to save the pasture.'));
    } finally {
      this.submitting.set(false);
    }
  }
  cancel(): void {
    if (!this.submitting()) {
      this.draft.clear();
      void this.router.navigate(['/home']);
    }
  }
}
