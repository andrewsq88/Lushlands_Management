import React, { useState } from 'react';
import { X, Wrench, Plus, Trash2 } from 'lucide-react';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';
import { useProperties } from '../hooks/useProperties';
import { useTenants } from '../hooks/useTenants';

interface MaintenanceFormProps {
  onClose: () => void;
}

interface MaintenanceIssue {
  id: string;
  description: string;
  property_id: string;
  tenant_id: string;
}

export function MaintenanceForm({ onClose }: MaintenanceFormProps) {
  const { addMaintenanceRequest } = useMaintenanceRequests();
  const { properties } = useProperties();
  const { tenants } = useTenants();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [issues, setIssues] = useState<MaintenanceIssue[]>([
    {
      id: '1',
      description: '',
      property_id: '',
      tenant_id: '',
    }
  ]);

  const addIssue = () => {
    const newIssue: MaintenanceIssue = {
      id: Date.now().toString(),
      description: '',
      property_id: '',
      tenant_id: '',
    };
    setIssues([...issues, newIssue]);
  };

  const removeIssue = (id: string) => {
    if (issues.length > 1) {
      setIssues(issues.filter(issue => issue.id !== id));
    }
  };

  const updateIssue = (id: string, field: keyof Omit<MaintenanceIssue, 'id'>, value: string) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, [field]: value } : issue
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate all issues
      const invalidIssues = issues.filter(issue => !issue.description.trim() || !issue.property_id);
      if (invalidIssues.length > 0) {
        setError('Please fill in description and property for all issues');
        return;
      }

      // Submit all issues
      const promises = issues.map(issue => 
        addMaintenanceRequest({
          description: issue.description,
          property_id: issue.property_id,
          tenant_id: issue.tenant_id || null,
        })
      );

      const results = await Promise.all(promises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        setError('Some maintenance requests failed to submit. Please try again.');
      } else {
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Submit Maintenance Request{issues.length > 1 ? 's' : ''}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {issues.length === 1 ? 'Add a maintenance issue' : `Adding ${issues.length} maintenance issues`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {issues.map((issue, index) => (
              <div key={issue.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Issue #{index + 1}
                  </h4>
                  {issues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIssue(issue.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove this issue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property *
                    </label>
                    <select
                      required
                      value={issue.property_id}
                      onChange={(e) => updateIssue(issue.id, 'property_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a property</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenant (Optional)
                    </label>
                    <select
                      value={issue.tenant_id}
                      onChange={(e) => updateIssue(issue.id, 'tenant_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} - {tenant.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Problem/Issue Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={issue.description}
                      onChange={(e) => updateIssue(issue.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the maintenance issue in detail (e.g., 'leaky pipe in kitchen sink', 'flickering light in bedroom')..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Another Issue Button */}
            <button
              type="button"
              onClick={addIssue}
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Issue
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 text-center">
              AI will automatically assign priority based on your descriptions
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Wrench className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Submitting...' : `Submit ${issues.length} Request${issues.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}