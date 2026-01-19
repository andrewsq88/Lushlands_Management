import React, { useState } from 'react';
import { Building2, Users, Home, AlertCircle, X, MapPin, Bed, Bath, Square, AlertTriangle, Clock, Wrench, Plus } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { useProperties as usePropertiesUpdate } from '../hooks/useProperties';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { PropertyListModal } from './PropertyListModal';
import { MaintenanceRequestsListModal } from './MaintenanceRequestsListModal';
import { MaintenanceDetailsModal } from './MaintenanceDetailsModal';
import { AffiliateCard } from './AffiliateCard';
import { AdSenseBanner } from './AdSenseBanner';
import { SEOHead } from './SEOHead';
import { getPageSEO, generateStructuredData } from '../utils/seoConfig';

export function Dashboard() {
  const seoConfig = getPageSEO('home');
  const { properties, stats, loading, updateProperty } = useProperties();
  const { highPriorityRequests, openRequests, loading: maintenanceLoading, updateMaintenanceRequest } = useMaintenanceRequests();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPropertyListModal, setShowPropertyListModal] = useState(false);
  const [showMaintenanceListModal, setShowMaintenanceListModal] = useState(false);
  const [propertyListTitle, setPropertyListTitle] = useState('');
  const [propertyListData, setPropertyListData] = useState([]);
  const [maintenanceListTitle, setMaintenanceListTitle] = useState('');
  const [maintenanceListData, setMaintenanceListData] = useState([]);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerFormData, setPartnerFormData] = useState({
    businessName: '',
    phone: '',
    email: '',
    websiteUrl: '',
    address: '',
    serviceTypes: '',
    userRating: 5,
    userNotes: ''
  });

  const recentProperties = properties.slice(0, 5);

  // Mock maintenance partners data with cities
  const mockMaintenancePartners = [
    {
      id: '1',
      name: 'NYC Property Pros',
      description: 'Full-service property maintenance and repair specialists serving Manhattan and Brooklyn.',
      url: '#',
      category: 'maintenance_partner',
      city: 'New York',
      country: 'USA'
    },
    {
      id: '2',
      name: 'Metro Maintenance Solutions',
      description: 'Emergency repairs, HVAC services, and general maintenance for residential properties.',
      url: '#',
      category: 'maintenance_partner',
      city: 'New York',
      country: 'USA'
    },
    {
      id: '3',
      name: 'LA Property Care',
      description: 'Professional maintenance services for apartments and single-family homes in Los Angeles.',
      url: '#',
      category: 'maintenance_partner',
      city: 'Los Angeles',
      country: 'USA'
    }
  ];

  // Show all maintenance partners
  const filteredPartners = mockMaintenancePartners;

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Supabase to save partner submission
    if (isEditMode) {
      console.log('Updating partner:', editingPartnerId, partnerFormData);
    } else {
      console.log('Adding new partner:', partnerFormData);
    }
    setShowAddPartnerModal(false);
    setIsEditMode(false);
    setEditingPartnerId(null);
    setPartnerFormData({
      businessName: '',
      phone: '',
      email: '',
      websiteUrl: '',
      address: '',
      serviceTypes: '',
      userRating: 5,
      userNotes: ''
    });
  };

  const handleEditPartner = (partner: any) => {
    setIsEditMode(true);
    setEditingPartnerId(partner.id);
    setPartnerFormData({
      businessName: partner.name,
      phone: partner.phone || '',
      email: partner.email || '',
      websiteUrl: partner.url,
      address: partner.address || '',
      serviceTypes: partner.serviceTypes || '',
      userRating: partner.rating || 5,
      userNotes: partner.notes || ''
    });
    setShowAddPartnerModal(true);
  };

  const handleDeletePartner = (partnerId: string) => {
    if (confirm('Are you sure you want to delete this maintenance partner?')) {
      // TODO: Integrate with Supabase to delete partner
      console.log('Deleting partner:', partnerId);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      occupied: 'bg-green-100 text-green-800',
      vacant: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const handleMaintenanceClick = (request: any) => {
    setSelectedMaintenanceRequest(request);
    setShowMaintenanceModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedProperty(null);
  };

  const closeMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setSelectedMaintenanceRequest(null);
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setPropertyListTitle('All Properties');
        setPropertyListData(properties);
        setShowPropertyListModal(true);
        break;
      case 'occupied':
        setPropertyListTitle('Occupied Properties');
        setPropertyListData(properties.filter(p => p.status === 'occupied'));
        setShowPropertyListModal(true);
        break;
      case 'vacant':
        setPropertyListTitle('Vacant Properties');
        setPropertyListData(properties.filter(p => p.status === 'vacant'));
        setShowPropertyListModal(true);
        break;
      case 'high-priority':
        setMaintenanceListTitle('High Priority Maintenance Issues');
        setMaintenanceListData(highPriorityRequests);
        setShowMaintenanceListModal(true);
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

  const dashboardBreadcrumb = generateStructuredData.breadcrumb([
    { name: 'Home', url: 'https://www.lushlandsmanagement.com/' },
    { name: 'Dashboard', url: 'https://www.lushlandsmanagement.com/' }
  ]);

  return (
    <>
      <SEOHead config={seoConfig} structuredData={dashboardBreadcrumb} />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Management Dashboard</h1>
          <p className="mt-2 text-gray-600">Comprehensive overview of your property portfolio with AI-powered insights and analytics</p>
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

      {/* AdSense Banner - Strategic placement after stats */}
      <AdSenseBanner 
        slot="1234567890" 
        format="horizontal"
        className="max-w-4xl mx-auto"
      />

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
                    onClick={() => handlePropertyClick(property)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{property.address}</h3>
                      <p className="text-sm text-gray-600 capitalize">{property.type}</p>
                    </div>
                    <select
                      value={property.status}
                      onChange={(e) => updateProperty(property.id, { status: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs font-medium rounded-full border px-2 py-1 capitalize ${getStatusBadge(property.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
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
                    onClick={() => handleMaintenanceClick(request)}
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
                    onClick={() => handleMaintenanceClick(request)}
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
                    <select
                      value={request.priority}
                      onChange={(e) => updateMaintenanceRequest(request.id, { priority: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs font-medium rounded-full border px-2 py-1 ${getPriorityBadge(request.priority)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Regional Maintenance Partners */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Maintenance Partners</h2>
                <p className="text-sm text-gray-600 mt-1">Trusted local maintenance companies</p>
              </div>
              <Wrench className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
          <div className="p-6">
            {/* Add Partner Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddPartnerModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                <Plus className="h-5 w-5" />
                Add Maintenance Partner
              </button>
            </div>

            {/* Partners List */}
            <div className="space-y-4">
              {filteredPartners.map((partner) => (
                <div key={partner.id} className="transform scale-95">
                  <AffiliateCard
                    name={partner.name}
                    description={partner.description}
                    url={partner.url}
                    category={partner.category}
                    onEdit={() => handleEditPartner(partner)}
                    onDelete={() => handleDeletePartner(partner.id)}
                  />
                </div>
              ))}
            </div>

            {filteredPartners.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No partners available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add your first maintenance partner to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      {showDetailsModal && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={closeModal}
        />
      )}

      {/* Maintenance Details Modal */}
      {showMaintenanceModal && selectedMaintenanceRequest && (
        <MaintenanceDetailsModal
          maintenanceRequest={selectedMaintenanceRequest}
          onClose={closeMaintenanceModal}
        />
      )}

      {/* Property List Modal */}
      {showPropertyListModal && (
        <PropertyListModal
          title={propertyListTitle}
          properties={propertyListData}
          onClose={() => setShowPropertyListModal(false)}
        />
      )}

      {/* Maintenance Requests List Modal */}
      {showMaintenanceListModal && (
        <MaintenanceRequestsListModal
          title={maintenanceListTitle}
          maintenanceRequests={maintenanceListData}
          onClose={() => setShowMaintenanceListModal(false)}
        />
      )}

      {/* Add Partner Modal */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Maintenance Partner' : 'Add Maintenance Partner'}
              </h2>
              <button
                onClick={() => {
                  setShowAddPartnerModal(false);
                  setIsEditMode(false);
                  setEditingPartnerId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="p-6 space-y-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  required
                  value={partnerFormData.businessName}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="ABC Plumbing Services"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={partnerFormData.phone}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={partnerFormData.email}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  value={partnerFormData.websiteUrl}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={partnerFormData.address}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>

              <div>
                <label htmlFor="serviceTypes" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Types * <span className="text-gray-500 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  id="serviceTypes"
                  required
                  value={partnerFormData.serviceTypes}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, serviceTypes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Plumbing, HVAC, Electrical"
                />
              </div>

              <div>
                <label htmlFor="userRating" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Rating
                </label>
                <select
                  id="userRating"
                  value={partnerFormData.userRating}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, userRating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div>
                <label htmlFor="userNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="userNotes"
                  rows={3}
                  value={partnerFormData.userNotes}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, userNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Share your experience with this partner..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPartnerModal(false);
                    setIsEditMode(false);
                    setEditingPartnerId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  {isEditMode ? 'Update Partner' : 'Submit Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}