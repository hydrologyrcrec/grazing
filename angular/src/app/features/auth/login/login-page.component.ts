import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/http/api-error';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ErrorAlertComponent } from '../../../shared/ui/error-alert/error-alert.component';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, ErrorAlertComponent],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });
  readonly submitting = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.form.getRawValue());
      const next = this.route.snapshot.queryParamMap.get('next');
      const target = next && /^\/(home|form)(?:[/?#]|$)/.test(next) ? next : '/home';
      await this.router.navigateByUrl(target, { replaceUrl: true });
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'Unable to sign in.'));
    } finally {
      this.submitting.set(false);
    }
  }
}
