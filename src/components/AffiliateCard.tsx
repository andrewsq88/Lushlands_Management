import React from 'react';
import { ExternalLink, Building, Shield, AlertTriangle, Wrench, Edit2, Trash2 } from 'lucide-react';

interface AffiliateCardProps {
  name: string;
  description: string;
  url: string;
  category: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AffiliateCard({ name, description, url, category, onEdit, onDelete }: AffiliateCardProps) {
  const getIcon = () => {
    switch (category) {
      case 'mortgage':
        return <Building className="h-6 w-6 text-blue-600" />;
      case 'insurance':
        return <Shield className="h-6 w-6 text-green-600" />;
      case 'tax_lien':
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case 'maintenance_partner':
        return <Wrench className="h-6 w-6 text-cyan-600" />;
      default:
        return <Building className="h-6 w-6 text-gray-600" />;
    }
  };

  const getCardColor = () => {
    switch (category) {
      case 'mortgage':
        return 'border-blue-200 hover:border-blue-300 hover:bg-blue-50';
      case 'insurance':
        return 'border-green-200 hover:border-green-300 hover:bg-green-50';
      case 'tax_lien':
        return 'border-orange-200 hover:border-orange-300 hover:bg-orange-50';
      case 'maintenance_partner':
        return 'border-cyan-200 hover:border-cyan-300 hover:bg-cyan-50';
      default:
        return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 ${getCardColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getIcon()}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          </div>
        </div>
        {(onEdit || onDelete) ? (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit partner"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Delete partner"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <ExternalLink className="h-4 w-4 text-gray-400" />
        )}
      </div>

      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Learn More
        <ExternalLink className="h-4 w-4 ml-2" />
      </a>
    </div>
  );
}