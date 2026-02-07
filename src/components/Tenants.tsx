import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, Calendar, MapPin, Brain, DollarSign, CheckCircle, XCircle, Video, Download, AlertCircle } from 'lucide-react';
import { useTenants } from '../hooks/useTenants';
import { useSubscription } from '../hooks/useSubscription';
import { usePremiumFeatures } from '../hooks/usePremiumFeatures';
import { TenantForm } from './TenantForm';
import { AdSenseBanner } from './AdSenseBanner';

export function Tenants() {
  const { tenants, loading, deleteTenant, screenTenantAI, getScreeningResults } = useTenants();
  const { isPremium, getRemainingUsage } = useSubscription();
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [screeningResults, setScreeningResults] = useState<Record<string, any>>({});
  const [screeningLoading, setScreeningLoading] = useState<Record<string, boolean>>({});

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenant.properties?.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (tenant: any) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      await deleteTenant(id);
    }
  };

  const handleScreenTenant = async (tenant: any) => {
    setScreeningLoading(prev => ({ ...prev, [tenant.id]: true }));
    
    try {
      const { data, error } = await screenTenantAI(tenant);
      
      if (error) {
        console.error('Screening error:', error);
        alert('Failed to screen tenant. Please try again.');
      } else if (data) {
        setScreeningResults(prev => ({ ...prev, [tenant.id]: data }));
      }
    } catch (error) {
      console.error('Screening error:', error);
      alert('Failed to screen tenant. Please try again.');
    } finally {
      setScreeningLoading(prev => ({ ...prev, [tenant.id]: false }));
    }
  };

  const loadExistingScreeningResults = async (tenantId: string) => {
    const { data } = await getScreeningResults(tenantId);
    if (data) {
      setScreeningResults(prev => ({ ...prev, [tenantId]: data }));
    }
  };

  React.useEffect(() => {
    // Load existing screening results for all tenants
    tenants.forEach(tenant => {
      if (!screeningResults[tenant.id]) {
        loadExistingScreeningResults(tenant.id);
      }
    });
  }, [tenants]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getRecommendationIcon = (recommendation: string) => {
    return recommendation === 'Approve' 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getRecommendationColor = (recommendation: string) => {
    return recommendation === 'Approve' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owners/Tenants</h1>
          <p className="mt-2 text-gray-600">Manage your tenant relationships with AI-powered screening</p>
        </div>
        <button
          onClick={() => {
            setEditingTenant(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first tenant'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingTenant(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tenant
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(tenant)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Edit tenant"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete tenant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {tenant.email}
                  </div>
                  
                  {tenant.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {tenant.phone}
                    </div>
                  )}

                  {tenant.income && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${tenant.income.toLocaleString()}/month
                    </div>
                  )}

                  {tenant.properties && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{tenant.properties.address}</span>
                    </div>
                  )}

                  {(tenant.lease_start || tenant.lease_end) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(tenant.lease_start)} - {formatDate(tenant.lease_end)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Screening Section */}
                <div className="border-t border-gray-200 pt-4">
                  {screeningResults[tenant.id] ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">AI Screening Result</span>
                        <div className="flex items-center space-x-2">
                          {getRecommendationIcon(screeningResults[tenant.id].recommendation)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationColor(screeningResults[tenant.id].recommendation)}`}>
                            {screeningResults[tenant.id].recommendation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approval Likelihood</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {screeningResults[tenant.id].score}%
                        </span>
                      </div>
                      {screeningResults[tenant.id].reasoning && (
                        <p className="text-xs text-gray-500 mt-1">
                          {screeningResults[tenant.id].reasoning}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleScreenTenant(tenant)}
                      disabled={screeningLoading[tenant.id] || !tenant.income}
                      className="w-full flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {screeningLoading[tenant.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Screen Tenant
                        </>
                      )}
                    </button>
                  )}
                  {!tenant.income && !screeningResults[tenant.id] && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Income required for AI screening
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AdSense Banner - After tenants grid */}
      <AdSenseBanner 
        slot="3456789012" 
        format="auto"
        className="max-w-3xl mx-auto"
      />

      {/* Tenant Form Modal */}
      {showForm && (
        <TenantForm
          tenant={editingTenant}
          onClose={() => {
            setShowForm(false);
            setEditingTenant(null);
          }}
        />
      )}
    </div>
  );
}