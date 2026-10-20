import { useEffect } from 'react';
import { Building2, CreditCard, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AdSenseBanner } from './AdSenseBanner';
import { AdsterraLeaderboard, AdsterraRectangle } from './AdsterraBanner';
import { AdsterraNative } from './AdsterraNative';

/**
 * Public marketing page. Adsterra units render only here.
 * Setting data-adsterra-public lets the Social Bar snippet in index.html run.
 */
export function PublicLanding() {
  const { user } = useAuth();

  useEffect(() => {
    document.body.setAttribute('data-adsterra-public', 'true');
    return () => {
      document.body.removeAttribute('data-adsterra-public');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <img
              src="/Possible Property Hub Logo.png"
              alt="LushLands Management Logo"
              className="h-10 w-10 object-contain flex-shrink-0"
            />
            <span className="ml-3 text-xl font-bold text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text whitespace-nowrap">
              LushLands
            </span>
          </div>
          <a
            href={user ? '/' : '/auth'}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {user ? 'Dashboard' : 'Sign in'}
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 font-playfair">
            Property management for landlords and tenants
          </h1>
          <p className="mt-3 text-gray-600 max-w-3xl">
            LushLands Management keeps properties, owners, maintenance, and payments in one place.
            Sign in to open your dashboard. This page is the public overview of the platform.
          </p>
        </section>

        <div className="my-8">
          <AdSenseBanner
            slot="1122334455"
            format="horizontal"
            style={{ minHeight: 90, minWidth: 320 }}
          />
          <div className="mt-4 flex justify-center">
            <AdsterraLeaderboard />
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Building2 className="h-6 w-6 text-blue-600 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Properties and tenants</h2>
            <p className="mt-2 text-sm text-gray-600">
              Track addresses, occupancy, and owner or tenant records from a single portfolio view.
            </p>
          </article>
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Wrench className="h-6 w-6 text-blue-600 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
            <p className="mt-2 text-sm text-gray-600">
              Log repair requests, set priority, and follow each job through to completion.
            </p>
          </article>
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <CreditCard className="h-6 w-6 text-blue-600 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
            <p className="mt-2 text-sm text-gray-600">
              Record rent and other charges, then collect them through the existing Stripe checkout.
            </p>
          </article>
        </section>

        <div className="my-8 flex flex-col items-center gap-6">
          <AdSenseBanner
            slot="5566778899"
            format="rectangle"
            className="max-w-2xl"
            style={{ minHeight: 250, width: 300 }}
          />
          <AdsterraRectangle />
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">How an account works</h2>
          <ol className="mt-4 space-y-3 text-gray-600 list-decimal list-inside">
            <li>Create an account or sign in with the email you already use for LushLands.</li>
            <li>Add properties, then attach tenants, maintenance, and payment records to them.</li>
            <li>Upgrade inside the dashboard if you need the premium screening and media tools.</li>
          </ol>
        </section>

        <AdsterraNative />
      </main>
    </div>
  );
}
