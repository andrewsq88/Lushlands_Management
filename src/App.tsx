import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { validateDomain, checkSSLCertificate, validateEnvironmentVariables, logDNSInfo } from './utils/domainValidation';
import { performanceMonitor } from './utils/performanceMonitor';

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
    
    // Log performance report after 5 seconds
    setTimeout(() => {
      performanceMonitor.logPerformanceReport();
    }, 5000);
    
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

  if (!user) {
    return <AuthForm />;
  }

  return (
    <StripeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/down-payment" element={<DownPayment />} />
            <Route path="/subscription" element={<SubscriptionManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </StripeProvider>
  );
}

export default App;