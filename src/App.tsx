import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAppStartup } from './hooks/useAppStartup';
import { setAnalyticsSignedIn } from './lib/analytics';
import { ConsentedAnalytics } from './components/ConsentedAnalytics';
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
import { PUBLIC_PAGES } from './seo/pageMeta';

function DashboardLayout({ children }: { children?: ReactNode }) {
  return (
    <StripeProvider>
      <Layout>
        {children ?? <Outlet />}
      </Layout>
    </StripeProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading LushLands Management...</p>
      </div>
    </div>
  );
}

/**
 * Signed-in visitors on an auth URL go to the dashboard, or to the
 * subscription screen when they arrived from a Premium button (?plan=premium).
 */
function SignedInAuthRedirect() {
  const { search } = useLocation();
  const premium = new URLSearchParams(search).get('plan') === 'premium';
  return <Navigate to={premium ? '/subscription' : '/'} replace />;
}

function App({ assumeSignedIn = false }: { assumeSignedIn?: boolean }) {
  const { user, loading } = useAuth();
  setAnalyticsSignedIn(loading || Boolean(user));
  useAppStartup();

  const homeIsDashboard = loading ? assumeSignedIn : Boolean(user);

  return (
    <Router>
      <ConsentedAnalytics />
      <Routes>
        {PUBLIC_PAGES.filter((page) => page.path !== '/').map((page) => (
          <Route key={page.path} path={page.path} element={<PublicLanding path={page.path} />} />
        ))}
        <Route
          path="/"
          element={
            homeIsDashboard
              ? (loading || !user ? <LoadingScreen /> : (
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                ))
              : <PublicLanding path="/" />
          }
        />
        {loading ? (
          <Route path="*" element={<LoadingScreen />} />
        ) : user ? (
          <>
            <Route path="/auth" element={<SignedInAuthRedirect />} />
            <Route path="/login" element={<SignedInAuthRedirect />} />
            <Route path="/signup" element={<SignedInAuthRedirect />} />
            <Route element={<DashboardLayout />}>
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
