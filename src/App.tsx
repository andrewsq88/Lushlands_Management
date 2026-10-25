import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { StripeProvider } from './components/StripeProvider';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { Properties } from './components/Properties';
import { Tenants } from './components/Tenants';
import { Maintenance } from './components/Maintenance';
import { Payments } from './components/Payments';
import { Financing } from './components/Financing';
import { DownPayment } from './components/DownPayment';
import { SubscriptionManager } from './components/SubscriptionManager';
import { PublicLanding } from './components/PublicLanding';
import { PageMeta } from './components/PageMeta';
import { HOME_PAGE_HEAD, WELCOME_PAGE_HEAD } from './seo/pageMeta';
import { validateDomain, checkSSLCertificate, validateEnvironmentVariables, logDNSInfo } from './utils/domainValidation';
import { performanceMonitor } from './utils/performanceMonitor';

function DashboardLayout() {
  return (
    <StripeProvider>
      <Layout>
        <Outlet />
      </Layout>
    </StripeProvider>
  );
}

function App() {
  const { user, loading } = useAuth();

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

  return (
    <Router>
      <Routes>
        <Route
          path="/welcome"
          element={
            <>
              <PageMeta {...WELCOME_PAGE_HEAD} />
              <PublicLanding />
            </>
          }
        />
        {user ? (
          <>
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/financing" element={<Financing />} />
              <Route path="/down-payment" element={<DownPayment />} />
              <Route path="/subscription" element={<SubscriptionManager />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <>
                  <PageMeta {...HOME_PAGE_HEAD} />
                  <PublicLanding />
                </>
              }
            />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/signup" element={<AuthForm />} />
            <Route path="*" element={<AuthForm />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;