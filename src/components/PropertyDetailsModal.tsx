import React from 'react';
import { X, MapPin, Bed, Bath, Square } from 'lucide-react';

interface PropertyDetailsModalProps {
  property: any;
  onClose: () => void;
}

export function PropertyDetailsModal({ property, onClose }: PropertyDetailsModalProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      occupied: 'bg-green-100 text-green-800',
      vacant: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Address and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">{property.address}</h2>
              </div>
              <p className="text-lg text-gray-600 capitalize">{property.type}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusBadge(property.status)}`}>
              {property.status}
            </span>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {property.rent_amount && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Monthly Rent</p>
                <p className="text-2xl font-bold text-green-900">${property.rent_amount.toLocaleString()}</p>
              </div>
            )}

            {property.bedrooms && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Bedrooms</p>
                    <p className="text-xl font-bold text-blue-900">{property.bedrooms}</p>
                  </div>
                </div>
              </div>
            )}

            {property.bathrooms && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <Bath className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Bathrooms</p>
                    <p className="text-xl font-bold text-purple-900">{property.bathrooms}</p>
                  </div>
                </div>
              </div>
            )}

            {property.square_feet && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <Square className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Square Feet</p>
                    <p className="text-xl font-bold text-orange-900">{property.square_feet.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Property Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-600">Added</p>
              <p className="text-gray-900">{new Date(property.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-gray-900">{new Date(property.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}