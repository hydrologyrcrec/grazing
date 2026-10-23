import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(() => {
  // A plain visible fallback is available even when runtime configuration cannot load.
  const message = document.createElement('p');
  message.textContent =
    'Pasture 360 could not start. Reload the page or contact the application administrator.';
  message.setAttribute('role', 'alert');
  document.body.replaceChildren(message);
});
