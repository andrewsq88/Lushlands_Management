import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from './SEOHead';

export function NotFound() {
  const navigate = useNavigate();

  const seoConfig = {
    title: '404 - Page Not Found | LushLands Management',
    description: 'The page you are looking for could not be found. Return to LushLands Management property management platform.',
    keywords: ['404', 'page not found', 'property management'],
    canonicalUrl: 'https://www.lushlandsmanagement.com/404'
  };

  return (
    <>
      <SEOHead config={seoConfig} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to managing your properties.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Popular Pages
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/properties')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                Properties
              </button>
              <button
                onClick={() => navigate('/tenants')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                Tenants
              </button>
              <button
                onClick={() => navigate('/maintenance')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                Maintenance
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                Payments
              </button>
              <button
                onClick={() => navigate('/financing')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                Financing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
