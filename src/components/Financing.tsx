import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useAffiliateLinks } from '../hooks/useAffiliateLinks';
import { AffiliateCard } from './AffiliateCard';
import { AdSenseBanner } from './AdSenseBanner';
import { SEOHead } from './SEOHead';
import { getPageSEO, generateStructuredData } from '../utils/seoConfig';

export function Financing() {
  const seoConfig = getPageSEO('financing');
  const { affiliateLinks, loading } = useAffiliateLinks();

  const mortgagePartners = affiliateLinks.filter(link => link.category === 'mortgage');
  const insurancePartners = affiliateLinks.filter(link => link.category === 'insurance');
  const taxLienPartners = affiliateLinks.filter(link => link.category === 'tax_lien');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const financingBreadcrumb = generateStructuredData.breadcrumb([
    { name: 'Home', url: 'https://www.lushlandsmanagement.com/' },
    { name: 'Financing', url: 'https://www.lushlandsmanagement.com/financing' }
  ]);

  return (
    <>
      <SEOHead config={seoConfig} structuredData={financingBreadcrumb} />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Financing Solutions</h1>
          <p className="mt-2 text-gray-600">Explore mortgage partners and financing options for your real estate investments</p>
        </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-8 w-8 mr-3" />
          <h2 className="text-2xl font-bold">Property Investment Financing</h2>
        </div>
        <p className="text-blue-100 text-lg leading-relaxed">
          Access competitive financing solutions, comprehensive insurance coverage, and expert assistance 
          for all your property investment needs. Our trusted partners offer specialized services 
          tailored for real estate investors.
        </p>
      </div>

      {/* AdSense Banner - Between hero and partners */}
      <AdSenseBanner 
        slot="4567890123" 
        format="horizontal"
        className="max-w-4xl mx-auto"
      />

      {/* Recommended Partners */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Partners</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mortgage Partners */}
          {mortgagePartners.map((partner) => (
            <AffiliateCard
              key={partner.id}
              name={partner.name}
              description={partner.description}
              url={partner.url}
              category={partner.category}
            />
          ))}

          {/* Insurance Partners */}
          {insurancePartners.map((partner) => (
            <AffiliateCard
              key={partner.id}
              name={partner.name}
              description={partner.description}
              url={partner.url}
              category={partner.category}
            />
          ))}

          {/* Tax Lien Partners */}
          {taxLienPartners.map((partner) => (
            <AffiliateCard
              key={partner.id}
              name={partner.name}
              description={partner.description}
              url={partner.url}
              category={partner.category}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Affiliate Disclosure</h3>
            <p className="text-sm text-yellow-700">
              We may earn a commission from affiliate links. This helps us provide you with free tools 
              and resources while connecting you with trusted partners in the real estate industry.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}