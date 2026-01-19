import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { StripeProvider } from './components/StripeProvider';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { Properties } from './components/Properties';
import { Tenants } from './components/Tenants';
import { PricingPage } from './pages/PricingPage';
import { SuccessPage } from './pages/SuccessPage';
import { Maintenance } from './components/Maintenance';
import { Payments } from './components/Payments';
import { Financing } from './components/Financing';
import { DownPayment } from './components/DownPayment';
import { SubscriptionManager } from './components/SubscriptionManager';
import { NotFound } from './components/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';
import { validateDomain, checkSSLCertificate, validateEnvironmentVariables, logDNSInfo } from './utils/domainValidation';
import { performanceMonitor } from './utils/performanceMonitor';

function App() {
  const { user, loading } = useAuth();
  const [initError, setInitError] = React.useState<Error | null>(null);

  useEffect(() => {
    try {
      console.log('🚀 LushLands Management - Initializing Application');

      // Start performance monitoring
      performanceMonitor.startPageLoadTimer();

      // Log DNS and domain information
      logDNSInfo();

      // Validate environment variables (returns false on failure)
      const envValid = validateEnvironmentVariables();
      if (!envValid) {
        console.warn('Environment validation failed - app may have limited functionality');
      }

      // Validate domain and SSL
      const isDomainValid = validateDomain();
      if (!isDomainValid) {
        console.error('Domain validation failed');
        return;
      }

      // Check SSL certificate
      checkSSLCertificate().then(isSSLValid => {
        if (isSSLValid) {
          console.log('✅ SSL certificate validation passed');
        } else {
          console.warn('⚠️ SSL certificate validation failed');
        }
      }).catch(err => {
        console.warn('SSL check error:', err);
      });

      // Track app initialization
      performanceMonitor.trackUserAction('app-initialization');

      // Log performance report after 5 seconds
      setTimeout(() => {
        performanceMonitor.logPerformanceReport();
      }, 5000);
    } catch (error) {
      console.error('App initialization error:', error);
      setInitError(error as Error);
    }
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Configuration Error</h1>
          </div>
          <p className="text-gray-600 mb-4">
            {initError.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LushLands Management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <StripeProvider>
      <Router>
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/properties"
                element={
                  <ErrorBoundary componentName="Properties">
                    <Properties />
                  </ErrorBoundary>
                }
              />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/financing" element={<Financing />} />
              <Route path="/down-payment" element={<DownPayment />} />
              <Route path="/subscription" element={<SubscriptionManager />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </Router>
    </StripeProvider>
  );
}

export default App;