import React, { useState } from 'react';
import { X, MapPin, Building2 } from 'lucide-react';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { useProperties } from '../hooks/useProperties';

interface PropertyListModalProps {
  title: string;
  properties: any[];
  onClose: () => void;
}

export function PropertyListModal({ title, properties, onClose }: PropertyListModalProps) {
  const { updateProperty } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      occupied: 'bg-green-100 text-green-800',
      vacant: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProperty(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">No properties match the selected criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertyClick(property)}
                    className="w-full p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <h4 className="font-medium text-gray-900 truncate">{property.address}</h4>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{property.type}</p>
                      </div>
                      <select
                        value={property.status}
                        onChange={(e) => updateProperty(property.id, { status: e.target.value })}
                        className={`text-xs font-medium rounded-full border px-2 py-1 capitalize ${getStatusBadge(property.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {property.rent_amount && (
                        <div>
                          <span className="font-medium">Rent:</span> ${property.rent_amount.toLocaleString()}
                        </div>
                      )}
                      {property.bedrooms && property.bathrooms && (
                        <div>
                          <span className="font-medium">Size:</span> {property.bedrooms}bd, {property.bathrooms}ba
                        </div>
                      )}
                      {property.square_feet && (
                        <div>
                          <span className="font-medium">Sq Ft:</span> {property.square_feet.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Added:</span> {new Date(property.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      {showDetailsModal && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={closeDetailsModal}
        />
      )}
    </>
  );
}