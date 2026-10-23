import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/http/api-error';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ErrorAlertComponent } from '../../../shared/ui/error-alert/error-alert.component';

@Component({
  selector: 'app-signup-page',
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, ErrorAlertComponent],
  templateUrl: './signup-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['', Validators.maxLength(100)],
    lastName: ['', Validators.maxLength(100)],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
  });
  readonly submitting = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    const values = this.form.getRawValue();
    try {
      await this.auth.signup({
        ...values,
        firstName: values.firstName.trim() || undefined,
        lastName: values.lastName.trim() || undefined,
      });
      await this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'Unable to create account.'));
    } finally {
      this.submitting.set(false);
    }
  }
}
