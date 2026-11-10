import type { PublicPath } from './publicPaths';
import { OG_IMAGE, SITE_ORIGIN } from './site';

/** Day the guide pages were published. */
export const GUIDE_PUBLISHED = '2026-11-10';

export interface GuideStep {
  /** Bold lead, including its closing punctuation. */
  name: string;
  detail: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface Guide {
  path: PublicPath;
  title: string;
  description: string;
  h1: string;
  shortAnswer: string;
  button: string;
  stepsHeading: string;
  steps: readonly GuideStep[];
  faqs: readonly GuideFaq[];
}

export function stepSentence(step: GuideStep): string {
  return `${step.name} ${step.detail}`;
}

export const GUIDES = [
  {
    path: '/guides/track-rent-payments',
    title: 'How to Track Rent Payments as a Landlord',
    description:
      'How landlords can track rent payments: what to record, a seven-step system, handling late rent and a monthly checklist.',
    h1: 'How to track rent payments as a landlord',
    shortAnswer:
      'To track rent payments as a landlord, list every tenancy with its rent and due dates, record each payment in one place, check your bank on a fixed day, mark each payment as paid, part paid or outstanding straight away, follow up missed rent politely and review every property\'s payment history monthly.',
    button: 'Start tracking rent',
    stepsHeading: 'How to set up a rent tracking system',
    steps: [
      {
        name: 'List every property and tenancy.',
        detail:
          'Include the address, the tenants, the rent amount, the payment frequency and the start and end dates of each tenancy.',
      },
      {
        name: 'Create a schedule of due dates.',
        detail: 'For each tenancy, list every rent due date for the coming months.',
      },
      {
        name: 'Choose one place to record payments.',
        detail:
          'A spreadsheet or property management software works far better than notes scattered across emails and bank apps.',
      },
      {
        name: 'Check your bank account on a fixed day.',
        detail: 'Match each incoming payment to the right tenant and period.',
      },
      {
        name: 'Mark the status straight away.',
        detail: 'Paid, part paid or outstanding. Do not leave it until the end of the month.',
      },
      {
        name: 'Follow up promptly.',
        detail: 'If a payment is missing, contact the tenant politely and record what was said.',
      },
      {
        name: 'Review monthly.',
        detail: 'Look at each property\'s payment history and note any patterns.',
      },
    ],
    faqs: [
      {
        question: 'What should a landlord record for each rent payment?',
        answer:
          'Record the property, tenant, period covered, amount due, due date, date received, amount received, payment method and status, such as paid, part paid, late or outstanding. Add notes of any conversation or agreement about the payment.',
      },
      {
        question: 'What is the best way to track rent payments?',
        answer:
          'Keep every payment in one place rather than across emails and banking apps. A spreadsheet can work for one or two properties, while property management software keeps rent records alongside property and tenant details as a portfolio grows.',
      },
      {
        question: 'What should I do if a tenant misses a rent payment?',
        answer:
          'Start with a polite message, as missed payments are often a simple mistake such as a failed standing order, and record every contact. Rules on arrears differ across the UK nations, so check GOV.UK or take qualified advice before any formal step.',
      },
      {
        question: 'How often should landlords check rent payments?',
        answer:
          'Pick a fixed day each month, shortly after rent is due, to match incoming payments to tenants and periods. Update each payment\'s status straight away, then review every property\'s payment history once a month to spot patterns early.',
      },
      {
        question: 'Can LushLands track rent payments?',
        answer:
          'Yes. LushLands Management lets you record rent and other charges against a property and take card payments through Stripe Checkout. The property, tenant, maintenance and payment records are on the free plan. LushLands does not hold rent for you or tell you what to charge.',
      },
    ],
  },
  {
    path: '/guides/maintenance-log-template',
    title: 'Rental Property Maintenance Log Template',
    description:
      'A rental property maintenance log template for landlords: what to record, how to set priorities and a simple repairs process.',
    h1: 'Rental property maintenance log: template and guide',
    shortAnswer:
      'A rental property maintenance log is a single dated record of every repair: what was reported, when, by whom, its priority, what action was taken, who did the work and when it was completed. Log each request straight away, set a priority, update it as work progresses and close it once the tenant confirms the fix.',
    button: 'Start my maintenance log',
    stepsHeading: 'A simple maintenance process',
    steps: [
      {
        name: 'Make reporting easy.',
        detail: 'Give tenants one clear way to report problems, such as email or a phone number.',
      },
      {
        name: 'Log the request straight away.',
        detail: 'Add it to your maintenance log with the date.',
      },
      {
        name: 'Acknowledge it.',
        detail: 'Let the tenant know you have received the report and what happens next.',
      },
      {
        name: 'Assign the job.',
        detail: 'Arrange a contractor or do the work yourself if you are qualified to.',
      },
      {
        name: 'Record what was done.',
        detail: 'Update the log with the action taken and the completion date.',
      },
      {
        name: 'Close it off.',
        detail: 'Confirm with the tenant that the problem is fixed, then mark it complete.',
      },
    ],
    faqs: [
      {
        question: 'What should a landlord maintenance log include?',
        answer:
          'Include a reference number, the property, date reported, who reported it, a description, priority, action taken, contractor details, completion date and any notes, photos or invoices. If you track costs, add the amount from the invoice.',
      },
      {
        question: 'How should I prioritise repairs?',
        answer:
          'A three-level system works for most landlords. High covers safety, security, heating, hot water and water leaks. Medium covers problems that affect daily life, such as a broken appliance. Low covers minor or cosmetic issues, such as a loose cupboard handle.',
      },
      {
        question: 'Why should landlords keep a maintenance log?',
        answer:
          'A log makes sure no request is forgotten, shows urgent problems at a glance, gives you a dated history if questions arise, reveals repeat issues at a property and keeps track of which contractor did each job and when.',
      },
      {
        question: 'Should safety checks go in the maintenance log?',
        answer:
          'Yes, log routine and safety-related checks alongside repairs. In the UK these can include gas safety, electrical safety and alarm checks, but duties depend on location and letting type, so check GOV.UK or the relevant devolved government and use qualified professionals.',
      },
      {
        question: 'Can I keep a maintenance log in LushLands?',
        answer:
          'Yes. LushLands Management lets you open a maintenance request for a property, describe the job and follow it to completion. A priority is suggested from the description and you can change it. Maintenance records are on the free plan.',
      },
    ],
  },
  {
    path: '/guides/tenant-records',
    title: 'How to Keep Tenant Records as a Landlord',
    description:
      'What landlords should keep in tenant records, how to organise them, handling personal data responsibly and a simple template.',
    h1: 'How to keep tenant records',
    shortAnswer:
      'Good tenant records hold each tenant\'s contact details, tenancy dates, rent, deposit details, key documents, payments, repairs and important correspondence, linked to the property. Keep one record per tenancy in a single secure place, log conversations with dates, set reminders for key dates and only keep personal data you have a proper reason to hold.',
    button: 'Organise my tenant records',
    stepsHeading: 'How to organise tenant records',
    steps: [
      {
        name: 'Create one record per tenancy.',
        detail: 'Link it to the property so you can see the full history of each home.',
      },
      {
        name: 'Use consistent names for files.',
        detail: 'For example, "Property – Tenant – Document – Date".',
      },
      {
        name: 'Keep documents in one secure place.',
        detail: 'A single system is easier to protect than scattered folders and email attachments.',
      },
      {
        name: 'Log conversations as they happen.',
        detail: 'A short dated note after each important call saves a lot of guesswork later.',
      },
      {
        name: 'Set reminders for key dates.',
        detail: 'Tenancy end dates, rent reviews and routine checks.',
      },
      {
        name: 'Review records at the end of each tenancy.',
        detail: 'Make sure everything is complete before you archive it.',
      },
    ],
    faqs: [
      {
        question: 'What records should a landlord keep for each tenant?',
        answer:
          'Keep contact details, tenancy start and end dates, rent and payment frequency, the signed tenancy agreement and required documents, records of pre-tenancy checks, deposit details, payment history, repairs, inventories and important correspondence.',
      },
      {
        question: 'How should I organise tenant records?',
        answer:
          'Create one record per tenancy linked to the property, name files consistently, store documents in one secure place, log important conversations as they happen, set reminders for key dates and check the record is complete at the end of each tenancy.',
      },
      {
        question: 'Does data protection law apply to tenant records?',
        answer:
          'In the UK, data protection law applies to how you collect, store and use tenants\' personal data. In general, collect only what you need, keep it secure and accurate, and do not keep it longer than necessary. Check the ICO and GOV.UK for current guidance.',
      },
      {
        question: 'How long should I keep tenant records?',
        answer:
          'It depends on the type of record and the rules that apply to you, such as tax and data protection requirements. Keep records only as long as you need them and check GOV.UK, the ICO or a qualified adviser for the position that applies to you.',
      },
      {
        question: 'Can I store tenant records in LushLands?',
        answer:
          'Yes. LushLands Management lets you attach tenants and owners to a property with their name, email, phone and lease dates. Tenant records sit alongside property, maintenance and rent records on the free plan, and your dashboard is private to your account.',
      },
    ],
  },
  {
    path: '/guides/property-management-for-letting-agents',
    title: 'Property Management Software for Letting Agents',
    description:
      'What letting agents need from property management software, how to set up a system and a weekly review for property managers.',
    h1: 'Property management for letting agents',
    shortAnswer:
      'Letting agents need one system that shows every property\'s status, links owners and tenants to each home, logs maintenance with priorities and records rent and charges. Set standard fields for every property, bring in open repairs, start rent records from a clear date and hold a weekly review of vacancies, repairs and late payments.',
    button: 'Try LushLands',
    stepsHeading: 'Setting up a system for your agency',
    steps: [
      {
        name: 'Agree a standard way to record properties.',
        detail:
          'Use the same fields for every property: address, type, bedrooms, bathrooms, size, rent and description.',
      },
      {
        name: 'Link owners and tenants to each property.',
        detail: 'Record who owns it and who lives there, with contact details and tenancy dates.',
      },
      {
        name: 'Bring in open maintenance jobs.',
        detail: 'Add every outstanding repair with its priority so nothing is forgotten in the move.',
      },
      {
        name: 'Record rent going forward.',
        detail: 'Start from a clear date and record every charge and payment from then on.',
      },
      {
        name: 'Set a weekly review.',
        detail: 'Check vacant properties, open repairs and outstanding rent at the same time each week.',
      },
      {
        name: 'Write a short internal guide.',
        detail: 'A one-page note on how your team uses the system keeps records consistent.',
      },
    ],
    faqs: [
      {
        question: 'What should letting agents look for in property management software?',
        answer:
          'Look for a clear portfolio overview with each property\'s status, owners and tenants linked to properties, a maintenance log with priorities, rent and charge records, private sign-in protected access and simple screens that do not need lengthy training.',
      },
      {
        question: 'How do I set up property management software for an agency?',
        answer:
          'Agree standard fields for every property, link owners and tenants with contact details and lease dates, add every open maintenance job with its priority, start rent records from a clear date, book a weekly review and write a one-page guide for your team.',
      },
      {
        question: 'What should a weekly property management review cover?',
        answer:
          'Check which properties are vacant and the plan for each, which high-priority repairs are still open, which rent payments are late or part paid, which tenancies end in the coming months and which landlords are due an update.',
      },
      {
        question: 'Does property management software handle legal compliance?',
        answer:
          'No. Software helps you keep records, but it does not make legal decisions. UK rules on tenancies, deposits, safety, client money and data protection vary by nation and change over time, so check GOV.UK, your professional body and qualified advisers.',
      },
      {
        question: 'Can letting agents use LushLands?',
        answer:
          'Yes. LushLands Management is built for landlords, owners, letting agents and property managers, and is not tied to one country. You can record properties, owners, tenants, maintenance and rent. A free plan is available.',
      },
    ],
  },
] as const satisfies readonly Guide[];

function assertNoHeldClaims(value: string, label: string): void {
  if (/premium|affiliate|5 properties|property limit/i.test(value)) {
    throw new Error(`${label} includes a held or affiliate claim`);
  }
}

export function guideJsonLdFor(guide: Guide): string {
  const canonical = `${SITE_ORIGIN}${guide.path}`;
  for (const faq of guide.faqs) {
    assertNoHeldClaims(faq.question, guide.path);
    assertNoHeldClaims(faq.answer, guide.path);
  }
  assertNoHeldClaims(guide.shortAnswer, guide.path);
  assertNoHeldClaims(guide.description, guide.path);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: guide.h1,
            item: canonical,
          },
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${canonical}#howto`,
        name: guide.h1,
        step: guide.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: stepSentence(step),
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        url: canonical,
        mainEntity: guide.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: guide.h1,
        description: guide.shortAnswer,
        datePublished: GUIDE_PUBLISHED,
        url: canonical,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        image: OG_IMAGE,
        author: {
          '@type': 'Organization',
          name: 'LushLands Management',
          url: `${SITE_ORIGIN}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'LushLands Management',
          url: `${SITE_ORIGIN}/`,
          logo: {
            '@type': 'ImageObject',
            url: OG_IMAGE,
          },
        },
      },
    ],
  };

  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
