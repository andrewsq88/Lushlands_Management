import React, { useState } from 'react';
import { X, MapPin, User, Calendar, AlertTriangle, Clock, CheckCircle, ChevronDown } from 'lucide-react';

interface MaintenanceDetailsModalProps {
  maintenanceRequest: any;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<any>;
}

export function MaintenanceDetailsModal({ maintenanceRequest, onClose, onUpdate }: MaintenanceDetailsModalProps) {
  const [priority, setPriority] = useState(maintenanceRequest.priority);
  const [status, setStatus] = useState(maintenanceRequest.status);
  const [updating, setUpdating] = useState(false);

  const handlePriorityChange = async (newPriority: string) => {
    setUpdating(true);
    setPriority(newPriority);
    await onUpdate(maintenanceRequest.id, { priority: newPriority });
    setUpdating(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setStatus(newStatus);
    await onUpdate(maintenanceRequest.id, { status: newStatus });
    setUpdating(false);
  };
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
              <p className="text-gray-700 leading-relaxed">{maintenanceRequest.description}</p>
            </div>
            <div className="ml-4 space-y-3">
              {/* Priority Dropdown */}
              <div className="flex items-center">
                {getPriorityIcon(priority)}
                <div className="relative ml-2">
                  <select
                    value={priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    disabled={updating}
                    className={`appearance-none px-3 py-1 pr-8 text-sm font-medium rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getPriorityBadge(priority)} ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center">
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className={`appearance-none px-3 py-1 pr-8 text-sm font-medium rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getStatusBadge(status)} ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
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
                {maintenanceRequest.properties?.address || 'Unknown Property'}
              </p>
              {maintenanceRequest.properties?.type && (
                <p className="text-blue-700 text-sm capitalize">
                  {maintenanceRequest.properties.type}
                </p>
              )}
            </div>
          </div>

          {/* Tenant Information */}
          {maintenanceRequest.tenants && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Tenant Information
              </h4>
              <div className="space-y-1">
                <p className="text-green-900 font-medium">
                  {maintenanceRequest.tenants.name}
                </p>
                <p className="text-green-700 text-sm">
                  {maintenanceRequest.tenants.email}
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
                <p className="text-gray-900">{new Date(maintenanceRequest.created_at).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm">{new Date(maintenanceRequest.created_at).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-gray-900">{new Date(maintenanceRequest.updated_at).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm">{new Date(maintenanceRequest.updated_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Request ID */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Request ID</h4>
            <p className="text-gray-600 text-sm font-mono">{maintenanceRequest.id}</p>
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