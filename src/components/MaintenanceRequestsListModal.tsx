import React, { useState } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, User, MapPin, Calendar } from 'lucide-react';
import { MaintenanceDetailsModal } from './MaintenanceDetailsModal';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';

interface MaintenanceRequestsListModalProps {
  title: string;
  maintenanceRequests: any[];
  onClose: () => void;
}

export function MaintenanceRequestsListModal({ title, maintenanceRequests, onClose }: MaintenanceRequestsListModalProps) {
  const { updateMaintenanceRequest } = useMaintenanceRequests();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const getPriorityBadge = (priority: string) => {
    const styles = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Open: 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Closed: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const handlePriorityUpdate = async (requestId: string, newPriority: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateMaintenanceRequest(requestId, { priority: newPriority });
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateMaintenanceRequest(requestId, { status: newStatus });
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
            {maintenanceRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
                <p className="text-gray-500">No maintenance requests match the selected criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => handleRequestClick(request)}
                    className="w-full p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex flex-col space-y-3">
                      {/* Priority and Status Row */}
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(request.priority)}
                        <select
                          value={request.priority}
                          onChange={(e) => handlePriorityUpdate(request.id, e.target.value, e)}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityBadge(request.priority)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value, e)}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(request.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
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
      {showDetailsModal && selectedRequest && (
        <MaintenanceDetailsModal
          maintenanceRequest={selectedRequest}
          onClose={closeDetailsModal}
        />
      )}
    </>
  );
}