import type { ReactNode } from 'react';
import { AdsterraRectangle } from '../AdsterraBanner';
import { AdsterraNative } from '../AdsterraNative';
import { ADS_ENABLED } from '../../lib/adsConfig';
import { GUIDES, type Guide } from '../../seo/guides';

const textLink = 'text-blue-600 hover:text-blue-700';
const buttonClass =
  'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

function findGuide(path: string): Guide {
  const guide = GUIDES.find((entry) => entry.path === path);
  if (!guide) {
    throw new Error(`No guide for ${path}`);
  }
  return guide;
}

function GuideFrame({ guide, children }: { guide: Guide; children: ReactNode }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600">
          <li>
            <a href="/" className={textLink}>Home</a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-700">{guide.h1}</li>
        </ol>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-gray-900 font-playfair">{guide.h1}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">
        <strong className="text-gray-900">Short answer:</strong> {guide.shortAnswer}
      </p>
      {children}
    </article>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-gray-600">{children}</div>
    </section>
  );
}

function Point({ lead, text }: { lead: string; text: string }) {
  return (
    <li>
      <strong className="text-gray-900">{lead}</strong> {text}
    </li>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table
        className="border border-gray-200 text-left text-sm"
        style={{ minWidth: Math.max(36, headers.length * 9) + 'rem' }}
      >
        <thead className="bg-gray-50 text-gray-900">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="border-b border-gray-200 px-3 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-200 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Steps({ guide }: { guide: Guide }) {
  return (
    <Section heading={guide.stepsHeading}>
      <ol className="list-decimal list-inside space-y-3">
        {guide.steps.map((step) => (
          <li key={step.name}>
            <strong className="text-gray-900">{step.name}</strong> {step.detail}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Faqs({ guide }: { guide: Guide }) {
  return (
    <Section heading="Frequently asked questions">
      {guide.faqs.map((faq) => (
        <div key={faq.question}>
          <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
          <p className="mt-2">{faq.answer}</p>
        </div>
      ))}
    </Section>
  );
}

/** Ad row with its own top margin, so it collapses completely when ads are switched off. */
function GuideAds({ slot }: { slot: 1 | 2 }) {
  if (!ADS_ENABLED) return null;
  return (
    <div className="mt-8 flex justify-center overflow-x-auto">
      {slot === 1 ? <AdsterraRectangle /> : <AdsterraNative />}
    </div>
  );
}

function IntroAndButton({ intro, button }: { intro: string; button: string }) {
  return (
    <>
      <p className="mt-3 max-w-3xl text-gray-600">{intro}</p>
      <p className="mt-6">
        <a href="/auth" className={buttonClass}>{button}</a>
      </p>
      <GuideAds slot={1} />
    </>
  );
}

export function GuideArticle({ path }: { path: string }) {
  const guide = findGuide(path);
  if (guide.path === '/guides/track-rent-payments') return <TrackRent guide={guide} />;
  if (guide.path === '/guides/maintenance-log-template') return <MaintenanceLog guide={guide} />;
  if (guide.path === '/guides/tenant-records') return <TenantRecords guide={guide} />;
  return <LettingAgents guide={guide} />;
}

function TrackRent({ guide }: { guide: Guide }) {
  return (
    <GuideFrame guide={guide}>
      <IntroAndButton
        button={guide.button}
        intro="Rent is the lifeblood of any rental property, so knowing exactly what has been paid, what is due and what is late matters. Whether you let one flat or a growing portfolio, a clear rent record saves time at the end of the month, helps you spot problems early and makes year-end paperwork far less painful. This guide explains how to set up a simple rent tracking system that works."
      />
      <div className="mt-8 space-y-8">
        <Section heading="Why tracking rent properly matters">
          <ul className="list-disc list-inside space-y-2">
            <Point lead="You spot missed payments quickly." text="The sooner you notice, the sooner you can have a friendly conversation with the tenant." />
            <Point lead="You have a clear history." text="If there is ever a dispute, a dated record of what was due and what was paid is invaluable." />
            <Point lead="Your accounts are easier." text="A tidy record of rental income makes tax time simpler for you or your accountant." />
            <Point lead="You understand your portfolio." text="You can see which properties are occupied, which are vacant and how each one is performing." />
          </ul>
        </Section>
        <Section heading="What to record for every payment">
          <p>At a minimum, record the following for each rent payment:</p>
          <DataTable
            headers={['Field', 'Example']}
            rows={[
              ['Property', 'Flat 2, 14 Example Road'],
              ['Tenant', 'J. Smith'],
              ['Period covered', '1 to 30 November'],
              ['Amount due', 'As set out in the tenancy agreement'],
              ['Due date', '1 November'],
              ['Date received', '1 November'],
              ['Amount received', 'Full or part payment'],
              ['Payment method', 'Bank transfer, standing order or card'],
              ['Status', 'Paid, part paid, late or outstanding'],
              ['Notes', 'Any agreement or conversation about the payment'],
            ]}
          />
        </Section>
        <Steps guide={guide} />
        <Section heading="Handling late or missed rent">
          <p>
            A missed payment is often a simple mistake, such as a changed bank account or a standing order that failed. Start with a polite message and keep a note of every contact. If arrears continue, the rules on what you can and cannot do depend on where the property is and the type of tenancy. In the UK, the rules differ between England, Scotland, Wales and Northern Ireland, so check the official guidance on GOV.UK or the relevant devolved government website, or speak to a qualified adviser, before taking formal steps. This page is general information, not legal advice.
          </p>
        </Section>
        <Section heading="Spreadsheet or software?">
          <p>
            A spreadsheet is a fine place to start with one or two properties. As your portfolio grows, it becomes easy to make mistakes, overwrite cells or lose track of which version is current. Property management software keeps rent records next to the property and tenant details, so everything about a tenancy is in one place.
          </p>
        </Section>
        <Section heading="Tracking rent with LushLands">
          <p>
            LushLands Management is property management software for landlords, letting agents and property managers. You can save each property with its address, rent and details, and mark it as occupied, vacant or in maintenance. You can attach tenants with their contact details and lease dates, and record rent and other charges against the property. If you want to take a card payment, LushLands sends it through Stripe Checkout, and your property records do not store the full card number. LushLands does not hold rent for you or tell you what to charge.
          </p>
          <p>The property, tenant, maintenance and payment records are all available on the free plan.</p>
        </Section>
        <Section heading="Rent tracking checklist">
          <Checklist
            items={[
              'Every property and tenancy listed',
              'Rent amounts and due dates recorded',
              'One place chosen for all payment records',
              'A fixed day each month to check payments',
              'Status updated as soon as a payment arrives',
              'Notes kept of every conversation about late rent',
              'Monthly review of each property\'s payment history',
            ]}
          />
        </Section>
        <Faqs guide={guide} />
      </div>
      <GuideAds slot={2} />
    </GuideFrame>
  );
}

function MaintenanceLog({ guide }: { guide: Guide }) {
  return (
    <GuideFrame guide={guide}>
      <IntroAndButton
        button={guide.button}
        intro="Repairs are part of every landlord's life. A dripping tap, a broken boiler or a damp patch all need logging, fixing and following up. A rental property maintenance log gives you a single record of every issue, what was done about it and when. It helps you respond quickly, plan ahead and show a clear history if a question ever comes up. This guide explains what to record and includes a template you can copy."
      />
      <div className="mt-8 space-y-8">
        <Section heading="Why keep a maintenance log?">
          <ul className="list-disc list-inside space-y-2">
            <Point lead="Nothing falls through the cracks." text="Every reported issue has a status until it is closed." />
            <Point lead="You can prioritise." text="Urgent problems, such as no heating or a water leak, are easy to spot." />
            <Point lead="You have a dated history." text="Useful if there is a disagreement about when something was reported or fixed." />
            <Point lead="You can plan ahead." text="Repeated issues at the same property show you where bigger work might be needed." />
            <Point lead="You keep contractors organised." text="You know who did each job and when." />
          </ul>
        </Section>
        <Section heading="What to record for each maintenance request">
          <DataTable
            headers={['Field', 'What to write']}
            rows={[
              ['Reference', 'A simple number, such as M-001'],
              ['Property', 'Address or unit'],
              ['Date reported', 'When the tenant or inspection raised it'],
              ['Reported by', 'Tenant, agent or landlord'],
              ['Description', 'What the problem is and where'],
              ['Priority', 'High, medium or low'],
              ['Action taken', 'What was done, by whom'],
              ['Contractor', 'Name and contact details'],
              ['Date completed', 'When the job was finished'],
              ['Cost', 'From the invoice, if you track costs'],
              ['Notes and photos', 'Before and after photos, invoices, follow-up'],
            ]}
          />
        </Section>
        <Section heading="Rental property maintenance log template">
          <p>Copy this table into a spreadsheet or document.</p>
          <DataTable
            headers={['Ref', 'Property', 'Date reported', 'Description', 'Priority', 'Action taken', 'Date completed', 'Status']}
            rows={[
              ['M-001', '', '', '', '', '', '', 'Open'],
              ['M-002', '', '', '', '', '', '', 'Open'],
              ['M-003', '', '', '', '', '', '', 'Open'],
            ]}
          />
        </Section>
        <Section heading="How to set priorities">
          <p>A simple three-level system works for most landlords:</p>
          <ul className="list-disc list-inside space-y-2">
            <Point lead="High:" text="issues affecting safety, security, heating, hot water or water leaks. Act as quickly as you can." />
            <Point lead="Medium:" text="problems that affect daily life but are not an emergency, such as a broken appliance." />
            <Point lead="Low:" text="cosmetic or minor issues, such as a loose cupboard handle." />
          </ul>
        </Section>
        <Steps guide={guide} />
        <Section heading="Planned and safety-related checks">
          <p>
            Alongside repairs, log routine and safety-related checks. In the UK these can include gas safety checks, electrical safety inspections and smoke and carbon monoxide alarm checks, but the exact duties and timings depend on where the property is and the type of letting. Check the current guidance on GOV.UK or the relevant devolved government website, and use qualified professionals where the rules require them. This page is general information, not legal advice.
          </p>
        </Section>
        <Section heading="Keeping your maintenance log in LushLands">
          <p>
            LushLands Management lets you open a maintenance request for a property, describe the job and follow it through to completion. A priority of high, medium or low is suggested from the words in the description, and you can change it. Treat that suggestion as a sorting aid, not a safety inspection. Each property can also be marked as in maintenance, so you can see at a glance which homes have work under way.
          </p>
          <p>Maintenance sits alongside your property, tenant and payment records, all of which are on the free plan.</p>
        </Section>
        <Section heading="Maintenance log checklist">
          <Checklist
            items={[
              'One clear way for tenants to report problems',
              'Every request logged with the date',
              'Priority set for each request',
              'Contractor and action recorded',
              'Completion date and photos added',
              'Routine and safety-related checks logged',
              'Open requests reviewed every week',
            ]}
          />
        </Section>
        <Faqs guide={guide} />
      </div>
      <GuideAds slot={2} />
    </GuideFrame>
  );
}

function TenantRecords({ guide }: { guide: Guide }) {
  return (
    <GuideFrame guide={guide}>
      <IntroAndButton
        button={guide.button}
        intro="Good tenant records make a landlord's life easier. When you can find a tenant's contact details, tenancy dates, payment history and past correspondence in seconds, everyday tasks such as chasing a repair or renewing a tenancy become straightforward. This guide explains what to keep, how to organise it and how to handle personal information responsibly."
      />
      <div className="mt-8 space-y-8">
        <Section heading="Why tenant records matter">
          <ul className="list-disc list-inside space-y-2">
            <Point lead="Smoother day-to-day management." text="Contact details, tenancy dates and notes are all in one place." />
            <Point lead="Clear evidence." text="Dated records help if there is ever a disagreement about what was agreed or when." />
            <Point lead="Easier handovers." text="If you use a letting agent or bring in help, they can pick up where you left off." />
            <Point lead="Better planning." text="You can see when tenancies end and plan renewals or re-lets in good time." />
          </ul>
        </Section>
        <Section heading="What to keep in a tenant record">
          <DataTable
            headers={['Category', 'What to include']}
            rows={[
              ['Contact details', 'Full name, email, phone number'],
              ['Tenancy details', 'Property, start date, end date, rent amount, payment frequency'],
              ['Documents', 'Signed tenancy agreement and any documents you are required to provide or keep'],
              ['Checks', 'Records of any checks you carried out before the tenancy started'],
              ['Deposit', 'Amount and where and how it is held'],
              ['Payments', 'Rent due and received, any arrears and agreements'],
              ['Maintenance', 'Repairs reported by the tenant and how they were resolved'],
              ['Correspondence', 'Important emails, letters and notes of phone calls'],
              ['Inventory', 'Check-in and check-out reports and photos'],
            ]}
          />
        </Section>
        <Steps guide={guide} />
        <Section heading="Handling personal information responsibly">
          <p>
            Tenant records contain personal information, so treat them with care. In the UK, data protection law applies to how you collect, store and use personal data. In general terms, that means:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Only collect information you have a proper reason to hold.</li>
            <li>Keep it secure, with strong passwords and limited access.</li>
            <li>Keep it accurate and up to date.</li>
            <li>Do not keep it for longer than you need to.</li>
          </ul>
          <p>
            The Information Commissioner's Office (ICO) publishes guidance for small organisations and landlords. Check the ICO website and GOV.UK for the current rules, or speak to a qualified adviser. This page is general information, not legal advice.
          </p>
        </Section>
        <Section heading="Documents and checks before a tenancy">
          <p>
            Depending on where your property is and the type of tenancy, you may need to carry out certain checks and give tenants certain documents, and the rules on deposits vary too. In England, for example, there are rules on Right to Rent checks and on protecting deposits for many tenancies. The rules differ across England, Scotland, Wales and Northern Ireland, so check GOV.UK or the relevant devolved government website for the up-to-date position.
          </p>
        </Section>
        <Section heading="A simple tenant record template">
          <DataTable
            headers={['Field', 'Entry']}
            rows={[
              ['Tenant name', ''],
              ['Email and phone', ''],
              ['Property', ''],
              ['Tenancy start and end dates', ''],
              ['Rent amount and frequency', ''],
              ['Deposit details', ''],
              ['Key documents held', ''],
              ['Notes', ''],
            ]}
          />
        </Section>
        <Section heading="Keeping tenant records in LushLands">
          <p>
            LushLands Management lets you attach people to a property, including their name, email, phone and lease dates, and income if you choose to record it. Each tenant sits alongside the property's details, maintenance requests and rent records, so the history of each tenancy is in one place. Tenants do not sign in to see your portfolio, and your dashboard is private to your account. LushLands does not register you as a landlord or obtain local licences for you, and you remain responsible for the rules that apply to the information you store.
          </p>
          <p>Tenant, property, maintenance and payment records are on the free plan.</p>
        </Section>
        <Section heading="Tenant records checklist">
          <Checklist
            items={[
              'One record per tenancy, linked to the property',
              'Contact and tenancy details complete',
              'Key documents stored securely',
              'Conversations logged with dates',
              'Reminders set for key dates',
              'Only necessary personal data kept',
            ]}
          />
        </Section>
        <Faqs guide={guide} />
      </div>
      <GuideAds slot={2} />
    </GuideFrame>
  );
}

function LettingAgents({ guide }: { guide: Guide }) {
  return (
    <GuideFrame guide={guide}>
      <IntroAndButton
        button={guide.button}
        intro="Letting agents and property managers juggle many properties, landlords and tenants at once. Without a clear system, details get lost between spreadsheets, inboxes and phone notes. Good property management software brings it together so you can see the state of every property, respond to repairs quickly and keep accurate records of rent. This guide covers what letting agents need from a system and how to set one up."
      />
      <div className="mt-8 space-y-8">
        <Section heading="The challenges letting agents face">
          <ul className="list-disc list-inside space-y-2">
            <Point lead="Volume." text="Many properties, each with its own owner, tenants, rent schedule and repairs." />
            <Point lead="Communication." text="Landlords want updates, tenants want repairs done and contractors need instructions." />
            <Point lead="Records." text="Every payment, repair and conversation may need to be found again later." />
            <Point lead="Compliance." text="Rules on tenancies, deposits, safety and data protection apply, and they vary by location." />
            <Point lead="Visibility." text="Knowing at a glance which properties are let, which are empty and which have work under way." />
          </ul>
        </Section>
        <Section heading="What to look for in property management software">
          <DataTable
            headers={['Need', 'What to look for']}
            rows={[
              ['Portfolio overview', 'Each property with its address, type, size, rent and current status'],
              ['People', 'Owners and tenants attached to each property, with contact details and lease dates'],
              ['Maintenance', 'A way to log requests, set priorities and follow jobs to completion'],
              ['Rent and charges', 'A record of what is due and what has been paid'],
              ['Security', 'Private, sign-in protected access to your records'],
              ['Ease of use', 'Simple screens that do not need lengthy training'],
            ]}
          />
        </Section>
        <Steps guide={guide} />
        <Section heading="A weekly review for property managers">
          <DataTable
            headers={['Check', 'Question to ask']}
            rows={[
              ['Vacant properties', 'Which homes are empty and what is the plan for each?'],
              ['Maintenance', 'Which high-priority jobs are still open?'],
              ['Rent', 'Which payments are late or part paid?'],
              ['Tenancies', 'Which tenancies end in the next few months?'],
              ['Owners', 'Which landlords are due an update?'],
            ]}
          />
        </Section>
        <Section heading="Staying on top of the rules">
          <p>
            Letting agents in the UK work within a range of rules covering tenancies, deposits, property safety, client money and data protection, and some agents need to belong to schemes such as a property redress scheme. The detail varies between England, Scotland, Wales and Northern Ireland and changes over time. Check GOV.UK, the relevant devolved government website and your professional body for the current position, and take qualified advice where you need it. Software can help you keep records, but it does not make legal decisions for you. This page is general information, not legal advice.
          </p>
        </Section>
        <Section heading="Using LushLands as a letting agent">
          <p>
            LushLands Management is property management software for landlords, owners, letting agents and property managers. It is not tied to a single country, so you can use it for properties in more than one place. You can:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Save each property with its address, type, bedrooms, bathrooms, size, rent and description, and mark it as occupied, vacant or in maintenance.</li>
            <li>Attach owners and tenants to a property, with names, contact details and lease dates.</li>
            <li>Open maintenance requests, describe each job and follow it through to completion, with a suggested priority you can change.</li>
            <li>Record rent and other charges, and take card payments through Stripe Checkout.</li>
          </ul>
          <p>
            Your dashboard is private to your account. The property, tenant, maintenance and payment records are on the free plan. LushLands does not register you as an agent, obtain licences for you or give legal advice.
          </p>
        </Section>
        <Section heading="Letting agent setup checklist">
          <Checklist
            items={[
              'Standard fields agreed for every property',
              'Owners and tenants linked to each property',
              'Open maintenance jobs added with priorities',
              'Rent records started from a clear date',
              'Weekly review in the diary',
              'Internal guide written for the team',
              'Current rules checked on GOV.UK',
            ]}
          />
        </Section>
        <Faqs guide={guide} />
      </div>
      <GuideAds slot={2} />
    </GuideFrame>
  );
}
