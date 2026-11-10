import { useState } from 'react';
import { Crown } from 'lucide-react';
import { FREE_PROPERTY_LIMIT_MESSAGE } from '../lib/propertyLimit';

interface PropertyLimitNoticeProps {
  onUpgrade: () => Promise<void>;
}

export function PropertyLimitNotice({ onUpgrade }: PropertyLimitNoticeProps) {
  const [busy, setBusy] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  const handleUpgrade = async () => {
    setBusy(true);
    setUpgradeError('');
    try {
      await onUpgrade();
    } catch (error) {
      console.error('Premium checkout redirect failed:', error);
      setUpgradeError('The Premium checkout could not be opened. Use Subscription in the menu to try again.');
      setBusy(false);
    }
  };

  return (
    <div
      id="property-limit-notice"
      role="status"
      className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Crown className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-amber-950">Free plan property limit</h2>
          <p className="mt-1 text-sm text-amber-900">{FREE_PROPERTY_LIMIT_MESSAGE}</p>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={busy}
            className="mt-3 inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Opening checkout...' : 'Upgrade to Premium'}
          </button>
          {upgradeError && (
            <p className="mt-2 text-sm text-red-700">{upgradeError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
