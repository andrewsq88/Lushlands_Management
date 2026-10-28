import { createClient } from 'npm:@supabase/supabase-js@2';

// Free-plan monthly caps (must match src/hooks/useSubscription.ts).
export const FREE_LIMITS = { voiceover: 5, video: 1 } as const;
export type Feature = keyof typeof FREE_LIMITS;

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

const monthYear = () => new Date().toISOString().slice(0, 7);

/** Returns null when allowed, or an error message when the free cap is reached. */
export async function checkLimit(userId: string, feature: Feature): Promise<string | null> {
  const db = admin();
  const { data: sub } = await db
    .from('user_subscriptions')
    .select('subscription_type,status')
    .eq('user_id', userId)
    .maybeSingle();
  if (sub?.subscription_type === 'premium' && sub?.status === 'active') return null;

  const { data: logs, error } = await db
    .from('premium_usage_logs')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('feature_type', feature)
    .eq('month_year', monthYear());
  if (error) throw new Error(`Usage check failed: ${error.message}`);
  const used = (logs ?? []).reduce((n, r) => n + (r.usage_count ?? 0), 0);
  return used >= FREE_LIMITS[feature]
    ? `You have reached your monthly limit for ${feature} generation. Upgrade to Premium for unlimited access.`
    : null;
}

/** Records one use server-side so the cap can't be bypassed from the browser. */
export async function logUsage(userId: string, feature: Feature, provider: 'eleven_labs' | 'tavus') {
  const { error } = await admin().from('premium_usage_logs').insert([{
    user_id: userId, feature_type: feature, api_provider: provider, month_year: monthYear(), usage_count: 1,
  }]);
  if (error) console.error('Failed to log usage:', error.message);
}
