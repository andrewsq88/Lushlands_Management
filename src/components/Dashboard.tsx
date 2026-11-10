import React, { useState } from 'react';
import { Building2, Users, Home, X, AlertTriangle, Clock, Wrench, Plus, CheckCircle } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { PropertyListModal } from './PropertyListModal';
import { MaintenanceRequestsListModal } from './MaintenanceRequestsListModal';
import { MaintenanceDetailsModal } from './MaintenanceDetailsModal';
import { MaintenancePrioritySelect, PropertyStatusSelect } from './RecordSelects';
import type { MaintenanceListFilter, PropertyListStatus } from '../lib/recordOptions';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { properties, stats, loading, updateProperty } = useProperties();
  const { maintenanceRequests, highPriorityRequests, openRequests, loading: maintenanceLoading, updateMaintenanceRequest } = useMaintenanceRequests();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(null);
  const [propertyList, setPropertyList] = useState<{ title: string; status: PropertyListStatus } | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<{ title: string; filter: MaintenanceListFilter } | null>(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerUrl, setPartnerUrl] = useState('');
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState(false);
  const [partnerError, setPartnerError] = useState('');

  const recentProperties = properties.slice(0, 5);

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

  const getPriorityBadge = (priority: string) => {
    const styles = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) ?? null;
  const selectedMaintenanceRequest = maintenanceRequests.find((request) => request.id === selectedMaintenanceId) ?? null;

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  const handleMaintenanceClick = (requestId: string) => {
    setSelectedMaintenanceId(requestId);
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setPropertyList({ title: 'All Properties', status: 'all' });
        break;
      case 'occupied':
        setPropertyList({ title: 'Occupied Properties', status: 'occupied' });
        break;
      case 'vacant':
        setPropertyList({ title: 'Vacant Properties', status: 'vacant' });
        break;
      case 'high-priority':
        setMaintenanceList({ title: 'High Priority Maintenance Issues', filter: 'high-priority' });
        break;
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your property portfolio with AI insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button 
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleStatsCardClick('occupied')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupied}</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleStatsCardClick('vacant')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-yellow-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Home className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vacant</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vacant}</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleStatsCardClick('high-priority')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority Issues</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceLoading ? '...' : highPriorityRequests.length}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
          </div>
          <div className="p-6">
            {recentProperties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No properties yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first property to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertyClick(property.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{property.address}</h3>
                      <p className="text-sm text-gray-600 capitalize">{property.type}</p>
                    </div>
                    <PropertyStatusSelect
                      value={property.status}
                      ariaLabel={`Status for ${property.address}`}
                      onChange={(status) => { void updateProperty(property.id, { status }); }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* High Priority Maintenance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">High Priority Maintenance</h2>
            <p className="text-sm text-gray-600 mt-1">AI-identified urgent issues</p>
          </div>
          <div className="p-6">
            {maintenanceLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : highPriorityRequests.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No high priority issues</p>
                <p className="text-sm text-gray-400 mt-1">All maintenance requests are under control</p>
              </div>
            ) : (
              <div className="space-y-4">
                {highPriorityRequests.slice(0, 5).map((request) => (
                  <button
                    key={request.id}
                    onClick={() => handleMaintenanceClick(request.id)}
                    className="w-full p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {request.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.properties?.address}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Maintenance Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance</h2>
          </div>
          <div className="p-6">
            {maintenanceLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : openRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No open maintenance requests</p>
                <p className="text-sm text-gray-400 mt-1">All issues have been resolved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openRequests.slice(0, 5).map((request) => (
                  <button
                    key={request.id}
                    onClick={() => handleMaintenanceClick(request.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 w-full break-words">
                        {request.description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {request.properties?.address}
                      </p>
                    </div>
                    <MaintenancePrioritySelect
                      value={request.priority}
                      ariaLabel={`Priority for ${request.description}`}
                      onChange={(priority) => { void updateMaintenanceRequest(request.id, { priority }); }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Partners - Submit a Partner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Maintenance Partners</h2>
                <p className="text-sm text-gray-600 mt-1">Suggest a trusted maintenance company</p>
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
                      <label htmlFor="partner-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        id="partner-name"
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. ABC Plumbing Services"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="partner-url" className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        id="partner-url"
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
                <p className="text-gray-500 mb-2">Know a great maintenance company?</p>
                <p className="text-sm text-gray-400">
                  Click the wrench icon above to suggest a partner for our network.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedPropertyId(null)}
        />
      )}

      {selectedMaintenanceRequest && (
        <MaintenanceDetailsModal
          maintenanceRequest={selectedMaintenanceRequest}
          onClose={() => setSelectedMaintenanceId(null)}
        />
      )}

      {propertyList && (
        <PropertyListModal
          title={propertyList.title}
          status={propertyList.status}
          onClose={() => setPropertyList(null)}
        />
      )}

      {maintenanceList && (
        <MaintenanceRequestsListModal
          title={maintenanceList.title}
          filter={maintenanceList.filter}
          onClose={() => setMaintenanceList(null)}
        />
      )}
    </div>
  );
}