import React from 'react';
import { PiggyBank, AlertCircle } from 'lucide-react';
import { useAffiliateLinks } from '../hooks/useAffiliateLinks';
import { AffiliateCard } from './AffiliateCard';

export function DownPayment() {
  const { affiliateLinks, loading } = useAffiliateLinks();

  const mortgagePartners = affiliateLinks.filter(link => link.category === 'mortgage');
  const insurancePartners = affiliateLinks.filter(link => link.category === 'insurance');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Down Payment & Deposits</h1>
        <p className="mt-2 text-gray-600">Secure funding and protection for your property investments</p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
        <div className="flex items-center mb-4">
          <PiggyBank className="h-8 w-8 mr-3" />
          <h2 className="text-2xl font-bold">Smart Investment Funding</h2>
        </div>
        <p className="text-green-100 text-lg leading-relaxed">
          Maximize your investment potential with flexible financing options and comprehensive 
          insurance coverage. Our partners specialize in helping property investors secure 
          the funding and protection they need.
        </p>
      </div>

      {/* Investment Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Down Payment Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Conventional Loans</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 20-25% down payment typical</li>
              <li>• Lower interest rates</li>
              <li>• Better loan terms</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Investment Property Loans</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 25-30% down payment required</li>
              <li>• Higher interest rates</li>
              <li>• Rental income consideration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommended Partners */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Partners</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  );
}