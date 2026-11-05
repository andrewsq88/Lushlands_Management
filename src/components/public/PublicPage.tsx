import { Building2, CreditCard, Wrench } from 'lucide-react';
import { AdsterraRectangle } from '../AdsterraBanner';
import { AdsterraNative } from '../AdsterraNative';
import { LOGO_PATH } from '../../seo/site';
import { DisclaimerPage, FaqPage, PrivacyPage, TermsPage } from './legalPages';

/**
 * Public marketing and policy pages.
 * Ads stay on / and /welcome only. Auth, payment, checkout, and dashboard
 * routes do not render this component.
 */
export function PublicPage({ path, signedIn }: { path: string; signedIn: boolean }) {
  const showAds = path === '/' || path === '/welcome';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <img
              src={LOGO_PATH}
              alt="LushLands Management Logo"
              className="h-10 w-10 object-contain flex-shrink-0"
            />
            <span className="ml-3 text-xl font-bold text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text whitespace-nowrap">
              LushLands
            </span>
          </div>
          <a
            data-signup-cta="first"
            href={signedIn ? '/' : '/auth'}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {signedIn ? 'Dashboard' : 'Sign in'}
          </a>
        </div>
      </header>

      {showAds && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end">
          <AdsterraRectangle />
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <PageBody path={path} />
      </main>

      {showAds && <AdsterraNative />}
      <PublicFooter />
    </div>
  );
}

const textLink = 'text-blue-600 hover:text-blue-700';

function PageBody({ path }: { path: string }) {
  if (path === '/') return <HomeBody />;
  if (path === '/welcome') return <WelcomeBody />;
  if (path === '/terms') return <TermsPage />;
  if (path === '/privacy') return <PrivacyPage />;
  if (path === '/disclaimer') return <DisclaimerPage />;
  if (path === '/faq') return <FaqPage />;
  return <HomeBody />;
}

function HomeBody() {
  return (
    <>
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 font-playfair">
          Property management for landlords and tenants
        </h1>
        <p className="mt-3 text-gray-600 max-w-3xl">
          LushLands Management is property management software for landlords and property managers in any country.
          Use it to keep properties, the people who own or occupy them, maintenance, and payments in one account.
          The screens are in English. Sign in when you want to open your own records. This page is the public overview.
        </p>
        <p className="mt-3 text-gray-600 max-w-3xl">
          It is a record-keeping tool for the landlord or manager. A tenant does not need an account to be listed.
          You add their details yourself, and only if you are allowed to store them. LushLands does not act as your
          lawyer, accountant, broker, or local property manager. The{' '}
          <a className={textLink} href="/welcome">welcome page</a> walks through the features, and the{' '}
          <a className={textLink} href="/faq">FAQ</a> answers common questions.
        </p>
      </section>

      <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Who it is for</h2>
        <p className="mt-3 text-gray-600 max-w-3xl">
          Landlords and owners who look after their own rentals, letting agents, and property managers.
          That includes people whose homes are in a different country from where they live, and people with
          properties in more than one country. The product is not built around one country's forms, deposits,
          or notice periods. You follow the housing, tax, and privacy rules that apply where you operate.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Building2 className="h-6 w-6 text-blue-600 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Properties and tenants</h2>
          <p className="mt-2 text-sm text-gray-600">
            Record an address, the property type, rent, and whether it is occupied, vacant, or in maintenance.
            Attach the owner or tenant, with the contact details and lease dates you choose to store.
          </p>
        </article>
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Wrench className="h-6 w-6 text-blue-600 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
          <p className="mt-2 text-sm text-gray-600">
            Log a repair, keep a priority on it, and follow the job until it is done. A priority is suggested
            from the description. You can change it. The suggestion is not a promise about safety or timing.
          </p>
        </article>
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <CreditCard className="h-6 w-6 text-blue-600 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
          <p className="mt-2 text-sm text-gray-600">
            Record rent and other charges, then collect a card payment through Stripe. LushLands does not
            store the full card number and does not hold a bank account for you.
          </p>
        </article>
      </section>

      <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">How an account works</h2>
        <ol className="mt-4 space-y-3 text-gray-600 list-decimal list-inside">
          <li>Create an account or sign in with the email you already use for LushLands.</li>
          <li>Add properties, then attach tenants, maintenance, and payment records to them.</li>
          <li>
            Stay on the free plan, or upgrade to Premium for 15 US dollars a month if you need more than the
            free monthly allowance of audio and video.
          </li>
        </ol>
        <p className="mt-4 text-gray-600 max-w-3xl">
          On the free plan you can keep the property, tenant, maintenance, and payment records, and generate
          up to 5 audio clips and 1 video message a month from text you supply. Premium removes those monthly
          caps. You can cancel Premium from the subscription screen. Any tax on the charge depends on you and
          on Stripe. Read the <a className={textLink} href="/disclaimer">disclaimer</a> before you rely on a
          generated clip or on a record in the dashboard.
        </p>
      </section>
    </>
  );
}

function WelcomeBody() {
  return (
    <>
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 font-playfair">
          Property management software for landlords in any country
        </h1>
        <p className="mt-3 text-gray-600 max-w-3xl">
          LushLands Management is for landlords, owners, letting agents, and property managers who want one
          place to record a portfolio. It is not tied to a single country. You can use it for rentals where
          you live, for rentals in another country, or for both. The screens are in English.
        </p>
        <p className="mt-3 text-gray-600 max-w-3xl">
          The home page is a short public overview. This page explains who the software is for and what the
          account actually does. Questions about plans, payments, and audio are collected in the{' '}
          <a className={textLink} href="/faq">FAQ</a>.
        </p>
      </section>

      <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Who it is for</h2>
        <ul className="mt-4 space-y-3 text-gray-600 list-disc list-inside max-w-3xl">
          <li>A landlord or owner keeping their own tenant, repair, and rent records.</li>
          <li>A letting agent or property manager looking after more than one property.</li>
          <li>Someone managing homes in a country other than the one they live in.</li>
        </ul>
        <p className="mt-4 text-gray-600 max-w-3xl">
          Tenants do not sign in to view the portfolio. You enter an occupant or owner when you have a proper
          reason to hold their name and contact details. LushLands does not register you as a landlord and
          does not obtain local licences for you.
        </p>
      </section>

      <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">For landlords in any country</h2>
        <p className="mt-3 text-gray-600 max-w-3xl">
          Housing, deposits, notice periods, fair-housing rules, tax, and privacy law differ by country,
          state, and city. LushLands does not ship those rules inside the product and it does not update
          itself when they change. You decide what to charge, what to store, and which local duties apply.
        </p>
        <p className="mt-3 text-gray-600 max-w-3xl">
          Premium is priced in US dollars. Stripe decides which cards and countries it can charge. The
          software will not tell you whether a rent increase, deposit, or notice is lawful where the
          property is. Ask a qualified person there. The <a className={textLink} href="/disclaimer">disclaimer</a> states
          that limit in full.
        </p>
      </section>

      <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Core features</h2>
        <div className="mt-4 space-y-6 text-gray-600 max-w-3xl">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
            <p className="mt-2">
              Save the address, property type, bedrooms, bathrooms, size, rent, and a description.
              Mark each one occupied, vacant, or in maintenance so the portfolio is readable at a glance.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tenants and owners</h3>
            <p className="mt-2">
              Attach people to a property, including a name, email, phone, lease dates, and income if you
              choose to record it. You can request a screening suggestion from details you entered. That
              result is not a background check and it is not a decision about a person.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Maintenance</h3>
            <p className="mt-2">
              Open a request, describe the job, and follow it through to completion. A priority of high,
              medium, or low is suggested from the words in the description, and you can change it. Treat
              the suggestion as a sorting aid, not as a safety inspection.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
            <p className="mt-2">
              Record rent and other charges, then take a card payment through Stripe Checkout. Your property
              records are not a store for the full card number. LushLands does not hold the rent for you and
              does not tell you what to charge.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Audio and video from your own text</h3>
            <p className="mt-2">
              Paste a property description or a note and generate a spoken clip, or write a video message.
              Free accounts can generate up to 5 audio clips and 1 video message each month. The clip can
              mispronounce a name, a street, or a number. Listen or watch before you send it to a tenant or
              put it on a listing.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Free plan and Premium</h2>
        <p className="mt-3 text-gray-600 max-w-3xl">
          The property, tenant, maintenance, and payment records are on the free plan, along with the monthly
          audio and video allowance above. Premium costs 15 US dollars a month, billed by Stripe, and removes
          those monthly caps. You can cancel it at any time from the subscription screen. Taxes, if any,
          depend on your situation and on Stripe.
        </p>
        <p className="mt-3 text-gray-600 max-w-3xl">
          Create an account from <a className={textLink} href="/auth">Sign in</a> when you are ready. The
          dashboard itself is private to your account and is not a public page.
        </p>
      </section>
    </>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
      <p>LushLands Management</p>
      <nav aria-label="Policies" className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <a href="/faq" className="hover:text-blue-600">FAQ</a>
        <a href="/terms" className="hover:text-blue-600">Terms</a>
        <a href="/privacy" className="hover:text-blue-600">Privacy</a>
        <a href="/disclaimer" className="hover:text-blue-600">Disclaimer</a>
      </nav>
    </footer>
  );
}
