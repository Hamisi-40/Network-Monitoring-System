import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

<<<<<<< HEAD
=======
// Enables HTTP requests to our Express backend
import { provideHttpClient } from '@angular/common/http';

>>>>>>> omary
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
