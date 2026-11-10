export interface FaqItem {
  question: string;
  answer: string;
}

/** Visible FAQ copy. JSON-LD is built from these same strings. */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What is LushLands Management?',
    answer:
      'LushLands Management is web software for keeping a property portfolio in one place. You can record properties, the people who own or occupy them, maintenance, and payments. It is a record-keeping tool. It does not act as your lawyer, accountant, broker, or local property manager.',
  },
  {
    question: 'Who is it for?',
    answer:
      'It is for landlords, owners, letting agents, and property managers. The product is not built for one country, and the screens are in English. Rules for housing, deposits, notices, tax, and privacy are different everywhere. You have to follow the rules that apply to you and to the people whose details you store.',
  },
  {
    question: 'What is in the dashboard?',
    answer:
      'After you sign in, you can add properties, owners or tenants, maintenance requests, and payments. You set a priority on maintenance and follow each request until it is done. Those screens are private to your account. They are not public pages, and search engines are asked not to index them.',
  },
  {
    question: 'How do rent and other charges get collected?',
    answer:
      'You record the charge in the dashboard. Card payments are sent to Stripe from your browser. LushLands does not keep a copy of the full card number in your property records. Prices for Premium are in US dollars. Stripe decides which cards and countries it can charge. The product does not hold a bank account for you and it does not tell you what to charge.',
  },
  {
    question: 'What do the free plan and Premium include?',
    answer:
      'You can create an account and use tenant, maintenance, and payment records on the free plan. Free accounts can add up to 5 properties, and can generate up to 5 audio clips and 1 AI video message each month. Premium costs 15 US dollars ($15) per month, has no property limit, and removes those monthly audio and video caps. You can cancel Premium at any time. Any tax on the charge depends on you and on Stripe, not on a tax rule built into this product.',
  },
  {
    question: 'How does property-description audio work?',
    answer:
      'On the properties screen, paste a description or choose a saved property or maintenance note. The text is sent to our server, which asks a speech service for an audio file. You can play it or download it. Free accounts have a monthly cap. The clip can mispronounce names, street addresses, and numbers, and it may handle some languages better than others. Listen to it before you send it to anyone. Audio you generate is covered by the disclaimer.',
  },
  {
    question: 'Can I trust the AI audio and video?',
    answer:
      'Treat them as drafts. They can be wrong, skip something you typed, or sound more certain than the text was. Do not use them as formal notices, safety instructions, or legal documents until you have checked the words yourself. Video messages are generated the same way: you supply the content, and the result can contain errors.',
  },
  {
    question: 'Does LushLands give legal, tax, or financial advice?',
    answer:
      'No. Articles, screens, partner listings, and generated audio or video are not legal, tax, financial, or real-estate advice. The product will not tell you whether a rent increase is lawful, how to end a tenancy, or what to file with a tax authority. Ask a qualified person where you operate.',
  },
  {
    question: 'Who is responsible for local laws and for other people\'s information?',
    answer:
      'You are. That includes housing and tenancy law, deposits, fair-housing rules, tax, and privacy or data-protection law. Put a tenant\'s or owner\'s details into the product only if you are allowed to hold them and you will keep access to your account secure. LushLands does not register you as a landlord or obtain local licences for you.',
  },
  {
    question: 'How do I start, and where are the policies?',
    answer:
      'Use Sign in to create an account or open one you already have. The home page is a public overview. Terms, the privacy policy, the disclaimer, and these questions are linked at the bottom of every public page. Sign-in, payment, and dashboard addresses are for account holders and are left out of the sitemap.',
  },
];
