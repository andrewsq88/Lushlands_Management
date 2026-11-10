import React from 'react';
import { X, MapPin, User, Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { maintenancePriorityClass, maintenanceStatusClass } from '../lib/recordOptions';

interface MaintenanceDetailsModalProps {
  maintenanceRequest: any;
  onClose: () => void;
}

export function MaintenanceDetailsModal({ maintenanceRequest, onClose }: MaintenanceDetailsModalProps) {
  const { maintenanceRequests } = useMaintenanceRequests();
  const liveRequest = maintenanceRequests.find((request) => request.id === maintenanceRequest.id) ?? maintenanceRequest;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Maintenance Request Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Priority and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Summary</h2>
              <p className="text-gray-700 leading-relaxed">{liveRequest.description}</p>
            </div>
            <div className="ml-4 space-y-2">
              <div className="flex items-center">
                {getPriorityIcon(liveRequest.priority)}
                <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full border ${maintenancePriorityClass(liveRequest.priority)}`}>
                  {liveRequest.priority} Priority
                </span>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${maintenanceStatusClass(liveRequest.status)}`}>
                  {liveRequest.status}
                </span>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Property Information
            </h4>
            <div className="space-y-1">
              <p className="text-blue-900 font-medium">
                {liveRequest.properties?.address || 'Unknown Property'}
              </p>
              {liveRequest.properties?.type && (
                <p className="text-blue-700 text-sm capitalize">
                  {liveRequest.properties.type}
                </p>
              )}
            </div>
          </div>

          {/* Tenant Information */}
          {liveRequest.tenants && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Tenant Information
              </h4>
              <div className="space-y-1">
                <p className="text-green-900 font-medium">
                  {liveRequest.tenants.name}
                </p>
                <p className="text-green-700 text-sm">
                  {liveRequest.tenants.email}
                </p>
              </div>
            </div>
          )}

          {/* Timeline Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-gray-900">{new Date(liveRequest.created_at).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm">{new Date(liveRequest.created_at).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-gray-900">{new Date(liveRequest.updated_at).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm">{new Date(liveRequest.updated_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Request ID */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Request ID</h4>
            <p className="text-gray-600 text-sm font-mono">{liveRequest.id}</p>
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