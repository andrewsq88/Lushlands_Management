import * as Sentry from '@sentry/react';

// Sentry is temporarily disabled
// To enable Sentry, set VITE_SENTRY_DSN in your .env file
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
  // Sentry disabled - no configuration needed
  if (SENTRY_DSN && import.meta.env.PROD) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 1.0,
      tracePropagationTargets: ['localhost', /^https:\/\/.*\.lushlandsmanagement\.com/],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        if (event.exception) {
          console.error('Error sent to Sentry:', event.exception);
        }
        return event;
      },
    });
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level}] ${message}`);
  }
};

export const setUserContext = (user: { id: string; email: string; }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};
