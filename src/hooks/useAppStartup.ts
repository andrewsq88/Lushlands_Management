import { useEffect } from 'react';
import { validateDomain, checkSSLCertificate, validateEnvironmentVariables, logDNSInfo } from '../utils/domainValidation';
import { performanceMonitor } from '../utils/performanceMonitor';

/** Domain, SSL, and performance checks that used to run on every app load. */
export function useAppStartup() {
  useEffect(() => {
    // Initialize domain and SSL validation
    console.log('🚀 LushLands Management - Initializing Application');

    // Start performance monitoring
    performanceMonitor.startPageLoadTimer();

    // Log DNS and domain information
    logDNSInfo();

    // Validate domain and SSL
    const isDomainValid = validateDomain();
    if (!isDomainValid) {
      console.error('Domain validation failed');
      return;
    }

    // Validate environment variables
    const areEnvVarsValid = validateEnvironmentVariables();
    if (!areEnvVarsValid) {
      console.error('Environment validation failed');
      return;
    }

    // Check SSL certificate
    checkSSLCertificate().then(isSSLValid => {
      if (isSSLValid) {
        console.log('✅ SSL certificate validation passed');
      } else {
        console.warn('⚠️ SSL certificate validation failed');
      }
    });

    // Track app initialization
    performanceMonitor.trackUserAction('app-initialization');

    const timer = setTimeout(() => {
      performanceMonitor.logPerformanceReport();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
}
