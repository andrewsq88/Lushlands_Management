import React from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useFeedback } from '../hooks/useFeedback';

export function FeedbackList() {
  const { feedback, loading } = useFeedback();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      general: 'bg-gray-100 text-gray-800',
      suggestion: 'bg-blue-100 text-blue-800',
      complaint: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800',
    };
    return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="mt-2 text-gray-600">View and manage your submitted feedback</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {feedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p className="text-gray-500">Your submitted feedback will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{item.message}</p>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}