import React, { useState } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, User, MapPin, Calendar } from 'lucide-react';
import { MaintenanceDetailsModal } from './MaintenanceDetailsModal';
import { MaintenancePrioritySelect, MaintenanceStatusSelect } from './RecordSelects';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import type { MaintenanceListFilter } from '../lib/recordOptions';

interface MaintenanceRequestsListModalProps {
  title: string;
  filter: MaintenanceListFilter;
  onClose: () => void;
}

export function MaintenanceRequestsListModal({ title, filter, onClose }: MaintenanceRequestsListModalProps) {
  const { maintenanceRequests, updateMaintenanceRequest } = useMaintenanceRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const visibleRequests = maintenanceRequests.filter((request) => {
    if (filter === 'all') return true;
    if (filter === 'open') return request.status === 'Open';
    return request.priority === 'High' && request.status === 'Open';
  });
  const selectedRequest = maintenanceRequests.find((request) => request.id === selectedRequestId) ?? null;

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
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40">
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
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
            {visibleRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
                <p className="text-gray-500">No maintenance requests match the selected criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequestId(request.id)}
                    className="w-full p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex flex-col space-y-3">
                      {/* Priority and Status Row */}
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(request.priority)}
                        <MaintenancePrioritySelect
                          value={request.priority}
                          ariaLabel={`Priority for ${request.description}`}
                          onChange={(priority) => { void updateMaintenanceRequest(request.id, { priority }); }}
                        />
                        <MaintenanceStatusSelect
                          value={request.status}
                          ariaLabel={`Status for ${request.description}`}
                          onChange={(status) => { void updateMaintenanceRequest(request.id, { status }); }}
                        />
                      </div>
                      
                      {/* Description */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          <span className="max-w-full break-words">
                            {request.description}
                          </span>
                        </p>
                      </div>

                      {/* Property, Tenant, and Date Info */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        {request.properties?.address && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{request.properties.address}</span>
                          </div>
                        )}
                        {request.tenants?.name && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{request.tenants.name}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
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

      {/* Maintenance Details Modal */}
      {selectedRequest && (
        <MaintenanceDetailsModal
          maintenanceRequest={selectedRequest}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </>
  );
}