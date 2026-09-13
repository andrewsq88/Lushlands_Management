/** ClickBank hop links for nickname asq88. Replace vendor IDs with live Marketplace offers. */
export type ClickBankOffer = {
  name: string;
  description: string;
  vendor: string;
  category: 'mortgage' | 'insurance' | 'tax_lien' | 'maintenance_partner';
};

export const CLICKBANK_NICKNAME = 'asq88';

export const lushlandsClickBankOffers: ClickBankOffer[] = [
  {
    name: 'Landlord Credit and Financing Tools',
    description: 'Compare landlord-friendly credit and financing resources for property portfolios.',
    vendor: 'REPLACE_VENDOR',
    category: 'mortgage',
  },
  {
    name: 'Rental Property Insurance Guides',
    description: 'Protect rentals with insurance education and offers tailored to landlords.',
    vendor: 'REPLACE_VENDOR',
    category: 'insurance',
  },
  {
    name: 'Tax Lien and Investment Education',
    description: 'Learn tax-lien and real-estate investing strategies relevant to property managers.',
    vendor: 'REPLACE_VENDOR',
    category: 'tax_lien',
  },
];

export function clickBankHopUrl(vendor: string): string {
  const params = new URLSearchParams({
    affiliate: CLICKBANK_NICKNAME,
    vendor,
  });
  return 'https://hop.clickbank.net/?' + params.toString();
}
