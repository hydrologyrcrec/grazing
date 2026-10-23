import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/http/api-error';
import { Pasture } from '../../pastures/data-access/pasture.models';
import { PastureStoreService } from '../../pastures/data-access/pasture-store.service';
import { PastureDraftService } from '../../pastures/data-access/pasture-draft.service';

@Component({
  selector: 'app-pasture-sidebar',
  templateUrl: './pasture-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastureSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly store = inject(PastureStoreService);
  private readonly draft = inject(PastureDraftService);
  private readonly router = inject(Router);
  readonly pastures = input.required<readonly Pasture[]>();
  readonly selectedId = input<string | null>(null);
  readonly selected = output<string>();
  readonly open = signal(true);
  readonly signingOut = signal(false);
  readonly error = signal('');

  async logout(): Promise<void> {
    if (this.signingOut()) return;
    this.signingOut.set(true);
    this.error.set('');
    try {
      await this.auth.logout();
      this.store.clear();
      this.draft.clear();
      await this.router.navigate(['/login']);
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'Sign out failed. Try again.'));
    } finally {
      this.signingOut.set(false);
    }
  }
}
