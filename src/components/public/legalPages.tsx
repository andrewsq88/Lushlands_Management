import type { ReactNode } from 'react';
import { FAQ_ITEMS } from '../../seo/faq';

const textLink = 'text-blue-600 hover:text-blue-700';

function Policy({ title, updated = '4 November 2026', children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900 font-playfair">{title}</h1>
      <p className="mt-3 text-sm text-gray-500">Last updated {updated}</p>
      <div className="mt-6 space-y-6 text-gray-600">{children}</div>
    </article>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export function TermsPage() {
  return (
    <Policy title="Terms and Conditions" updated="10 November 2026">
      <Section heading="Agreement">
        <p>
          These terms cover your use of LushLands Management at lushlandsmanagement.com.
          The product is software for landlords, owners, letting agents, and property managers.
          It is not limited to one country. By creating an account or using the site, you agree to
          these terms and to the <a className={textLink} href="/disclaimer">disclaimer</a>.
        </p>
      </Section>
      <Section heading="What the service is">
        <p>
          LushLands gives you a place to record properties, owners or tenants, maintenance, and
          payments, and optional tools that turn text you supply into audio or video. It is not a
          property manager, letting agent, broker, bank, lawyer, or tax adviser, and it does not
          act for you with tenants or authorities.
        </p>
      </Section>
      <Section heading="Accounts">
        <p>
          You need an account for the dashboard. Keep your sign-in details to yourself and tell us
          if you believe someone else is using your account. You are responsible for what is done
          with your account until you sign out or the session ends.
        </p>
      </Section>
      <Section heading="Your records">
        <p>
          You keep ownership of the property, tenant, maintenance, and payment information you
          enter. You confirm that you are allowed to store it, including information about other
          people. Do not upload information you do not have a right to hold. See the{' '}
          <a className={textLink} href="/privacy">privacy policy</a> for how the product handles it.
        </p>
      </Section>
      <Section heading="Acceptable use">
        <p>
          Do not misuse the service. That includes trying to break into accounts that are not yours,
          disrupting the site, or using generated audio or video to mislead someone about who is
          speaking or about facts you have not checked.
        </p>
      </Section>
      <Section heading="Plans and payment">
        <p>
          The core records are available on a free plan, which includes up to 5 properties. Premium is 15 US dollars a month, billed
          by Stripe. It has no property limit and removes the free-plan monthly caps on audio and video. You can cancel
          Premium from the subscription screen. Taxes, if any, depend on your situation and on
          Stripe. Card payments are processed by Stripe. LushLands does not hold your bank account.
        </p>
      </Section>
      <Section heading="Audio, video, and other automated output">
        <p>
          Audio and video are produced from text or other material you submit. They can be wrong.
          You have to review them before you rely on them or send them to anyone. They are not
          advice. Read the <a className={textLink} href="/disclaimer">disclaimer</a>.
        </p>
      </Section>
      <Section heading="The software itself">
        <p>
          The LushLands name, the site, and the software are ours. These terms do not give you
          ownership of them. They do give you a personal right to use the product while your
          account is open and these terms are in effect.
        </p>
      </Section>
      <Section heading="Availability and liability">
        <p>
          The service is provided as available. We do not promise that it will be uninterrupted,
          that records will never be lost, or that a payment, audio file, or video will succeed.
          We are not liable for decisions you make about tenants, rent, maintenance, or filings.
          Nothing in these terms excludes liability that the law where you live does not allow to
          be excluded.
        </p>
      </Section>
      <Section heading="Local law">
        <p>
          You are responsible for the housing, tenancy, deposit, fair-housing, tax, consumer, and
          privacy rules that apply to you. These terms are not tied to one country. Rights that a
          local law gives you, and that cannot be waived, still apply.
        </p>
      </Section>
      <Section heading="Changes">
        <p>
          We may update these terms by posting a new version on this page. If you keep using the
          product after the update, the new terms apply. The date at the top of the page is the
          latest change.
        </p>
      </Section>
    </Policy>
  );
}

export function PrivacyPage() {
  return (
    <Policy title="Privacy Policy">
      <Section heading="Who this covers">
        <p>
          This policy describes how LushLands Management handles information when you use the
          public site or an account. The product is used worldwide. It does not change your duty
          to follow privacy law where you operate, especially when you store someone else's
          details.
        </p>
      </Section>
      <Section heading="Information you give us">
        <p>
          If you create an account, we store the email address and name you submit, plus the
          sign-in session in your browser. Inside the dashboard you can save property addresses,
          owner or tenant names and contact details, maintenance notes, and payment records you
          choose to enter. We store those records so you can open them the next time you sign in.
        </p>
      </Section>
      <Section heading="Payments">
        <p>
          Card payments are confirmed by Stripe from your browser. The payment request our server
          receives is the amount, the currency, and a short description. Your property records are
          not used as a store for the full card number. Stripe's own terms and privacy policy
          apply to the card data they process. Premium is priced in US dollars.
        </p>
      </Section>
      <Section heading="Audio and video">
        <p>
          When you generate a property description or other voice clip, the text is sent to our
          server and then to a speech provider (ElevenLabs) to produce an audio file. Video
          messages you request are sent to a video provider (Tavus). The resulting file can be
          saved with your account so you can play it later. Do not submit information in that text
          if you are not allowed to share it with those providers. Generated output can be wrong;
          see the <a className={textLink} href="/disclaimer">disclaimer</a>.
        </p>
      </Section>
      <Section heading="Public pages, advertising, and analytics">
        <p>
          The home page and the welcome page may show third-party ads. Those ad scripts can set
          their own cookies. The terms, privacy policy, disclaimer, FAQ, sign-in, payment, and
          dashboard screens do not mount those ad slots.
        </p>
        <p>
          Vercel Web Analytics measures visits to the public home and welcome pages, and only
          while nobody is signed in. Page views from sign-in, payment, checkout, and every
          signed-in screen are discarded before they are sent. Query strings are not kept on the
          events that are sent. The policy pages are not included in that analytics allow-list.
        </p>
      </Section>
      <Section heading="Service providers">
        <p>
          We use other companies to run the product: hosting and the public-page measurement above,
          the database and file storage that hold your account and records, Stripe for card
          payments, and the speech and video providers when you use those features. They process
          the information needed to perform that role. We do not sell your account records.
        </p>
      </Section>
      <Section heading="How long it is kept">
        <p>
          Account and portfolio records stay until you delete them in the dashboard or stop using
          the account. You can remove properties and related records you created. You can cancel
          Premium from the subscription screen. This site does not publish a separate postal
          address or support inbox.
        </p>
      </Section>
      <Section heading="Children">
        <p>
          The product is for managing properties, not for children. Do not create an account if
          you are under the age required to enter a contract where you live.
        </p>
      </Section>
      <Section heading="Changes">
        <p>
          If this policy changes, the new version will be posted on this page with a new date.
          The <a className={textLink} href="/terms">terms</a> explain the rules for using the product.
        </p>
      </Section>
    </Policy>
  );
}

export function DisclaimerPage() {
  return (
    <Policy title="Disclaimer">
      <ul className="list-disc list-inside space-y-2 text-gray-800">
        <li>This is not legal, financial, or tax advice.</li>
        <li>You are responsible for following the laws where you and your properties are.</li>
        <li>AI output, including audio, may contain errors.</li>
      </ul>
      <Section heading="Not advice">
        <p>
          LushLands Management is software for your own records. Nothing on the public pages, in
          the dashboard, in a partner listing, or in a file the product generates is legal advice,
          tax advice, financial advice, or real-estate advice. We do not tell you what rent to
          charge, whether a fee or deposit is lawful, how to end a tenancy, who to house, or what
          to file with a tax authority.
        </p>
        <p>
          Ask a qualified professional in the place that actually governs your properties and your
          occupants. A screen that mentions payments, financing, or a down payment is not a
          recommendation to borrow, lend, or invest.
        </p>
      </Section>
      <Section heading="Your local obligations">
        <p>
          Housing, tenancy, licensing, fair-housing, deposit, consumer, tax, and privacy rules
          differ by country, state, and city. The product is not built around one set of those
          rules and it does not update itself when they change. You are responsible for knowing
          which rules apply and for complying with them. You are also responsible for having a
          proper reason to store other people's names, contact details, and payment information.
        </p>
      </Section>
      <Section heading="AI and audio can be wrong">
        <p>
          Property-description audio, other voice clips, and AI video are generated from what you
          submit. They can mispronounce names and addresses, drop or change a number, use the wrong
          language or accent, or leave something important out. They can also sound confident when
          the underlying text was incomplete. Check the result yourself before you play it for a
          tenant, put it on a listing, or treat it as a notice.
        </p>
        <p>
          The same caution applies to any other automated text in the product. A priority suggestion
          or a screening result is not a decision about a person and it is not a guarantee.
        </p>
      </Section>
      <Section heading="No promise about outcomes">
        <p>
          We do not promise occupancy, rent collection, repair quality, or a particular result from
          a payment or a generated file. See the <a className={textLink} href="/terms">terms</a> and
          the <a className={textLink} href="/privacy">privacy policy</a> for how the service is offered
          and how information is handled.
        </p>
      </Section>
    </Policy>
  );
}

export function FaqPage() {
  return (
    <Policy title="Frequently asked questions" updated="10 November 2026">
      <p>
        These answers are about LushLands Management for landlords and property managers anywhere.
        They are not legal, tax, or financial advice. Read the{' '}
        <a className={textLink} href="/disclaimer">disclaimer</a> before you rely on the product
        or on audio it generates.
      </p>
      {FAQ_ITEMS.map((item) => (
        <section key={item.question}>
          <h2 className="text-lg font-semibold text-gray-900">{item.question}</h2>
          <p className="mt-2">{item.answer}</p>
        </section>
      ))}
    </Policy>
  );
}
