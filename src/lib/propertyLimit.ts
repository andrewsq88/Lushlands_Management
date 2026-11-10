/** Must match the count in supabase/migrations/20261110022000_free_tier_property_limit.sql */
export const FREE_PROPERTY_LIMIT = 5;

export const FREE_PROPERTY_LIMIT_HINT = 'FREE_PROPERTY_LIMIT';

export const FREE_PROPERTY_LIMIT_MESSAGE =
  'Free accounts can have up to 5 properties. Upgrade to Lushlands Premium for unlimited properties. Properties you already have stay in your account, and you can still edit or delete them.';

type LimitError = {
  message?: string;
  hint?: string | null;
  details?: string | null;
};

export function isFreePropertyLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as LimitError;
  const text = [candidate.message, candidate.hint, candidate.details]
    .filter((part): part is string => typeof part === 'string')
    .join(' ');
  return text.includes(FREE_PROPERTY_LIMIT_HINT);
}
