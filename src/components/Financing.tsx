import React, { useState } from 'react';
import { TrendingUp, Wrench, X, Plus, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Financing() {
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerUrl, setPartnerUrl] = useState('');
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState(false);
  const [partnerError, setPartnerError] = useState('');

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    setPartnerSubmitting(true);
    setPartnerError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('partner_submissions')
        .insert([{
          submitted_by: user.id,
          business_name: partnerName.trim(),
          website_url: partnerUrl.trim() || null,
        }]);

      if (error) throw error;

      setPartnerSuccess(true);
      setPartnerName('');
      setPartnerUrl('');
      setTimeout(() => {
        setPartnerSuccess(false);
        setShowPartnerForm(false);
      }, 2500);
    } catch (err) {
      setPartnerError(err instanceof Error ? err.message : 'Failed to submit partner');
    } finally {
      setPartnerSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financing</h1>
        <p className="mt-2 text-gray-600">Explore financing options for your property investments</p>
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

      {/* Partner Submission Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Financing Partners</h2>
              <p className="text-sm text-gray-600 mt-1">Suggest a trusted financing company</p>
            </div>
            <button
              onClick={() => setShowPartnerForm(!showPartnerForm)}
              className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors group"
              title="Submit a partner"
            >
              {showPartnerForm ? (
                <X className="h-5 w-5 text-cyan-600 group-hover:text-cyan-700" />
              ) : (
                <Wrench className="h-5 w-5 text-cyan-600 group-hover:text-cyan-700" />
              )}
            </button>
          </div>
        </div>
        <div className="p-6">
          {showPartnerForm ? (
            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              {partnerSuccess ? (
                <div className="flex flex-col items-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-green-800 font-medium">Partner submitted!</p>
                  <p className="text-sm text-green-600 mt-1">We'll review and add them shortly.</p>
                </div>
              ) : (
                <>
                  {partnerError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{partnerError}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="financing-partner-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      id="financing-partner-name"
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. First National Mortgage"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="financing-partner-url" className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      id="financing-partner-url"
                      type="url"
                      value={partnerUrl}
                      onChange={(e) => setPartnerUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={partnerSubmitting || !partnerName.trim()}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {partnerSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {partnerSubmitting ? 'Submitting...' : 'Submit Partner'}
                  </button>
                </>
              )}
            </form>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Know a great financing company?</p>
              <p className="text-sm text-gray-400">
                Click the wrench icon above to suggest a partner for our network.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
