import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TenantData {
  name: string;
  email: string;
  income: number;
  lease_start: string;
  lease_end: string;
}

interface ScreeningResult {
  score: number;
  recommendation: 'Approve' | 'Reject';
  reasoning: string;
}

function analyzeTenant(tenantData: TenantData): ScreeningResult {
  const emailParts = tenantData.email.split('@');
  const emailDomain = emailParts.length > 1 ? emailParts[1] : '';
  const isPersonalEmail = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(emailDomain);

  const leaseStart = new Date(tenantData.lease_start);
  const leaseEnd = new Date(tenantData.lease_end);
  const leaseDurationMonths = (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24 * 30);

  let score = 50;

  if (tenantData.income >= 5000) score += 30;
  else if (tenantData.income >= 3000) score += 20;
  else if (tenantData.income >= 2000) score += 10;
  else score -= 20;

  if (!isPersonalEmail && emailDomain) score += 10;

  if (leaseDurationMonths >= 12) score += 15;
  else if (leaseDurationMonths >= 6) score += 10;
  else score += 5;

  const nameParts = tenantData.name.trim().split(' ');
  if (nameParts.length >= 2 && nameParts.every(part => part.length > 1)) score += 15;

  score = Math.max(0, Math.min(100, score));

  const recommendation: 'Approve' | 'Reject' = score >= 70 ? 'Approve' : 'Reject';

  const reasoning = `Score based on: Income level (${tenantData.income >= 3000 ? 'Good' : 'Needs review'}), ` +
    `Email domain (${!isPersonalEmail && emailDomain ? 'Professional' : 'Personal'}), ` +
    `Lease duration (${leaseDurationMonths.toFixed(1)} months), ` +
    `Name completeness (${nameParts.length >= 2 ? 'Complete' : 'Incomplete'})`;

  return { score: Math.round(score), recommendation, reasoning };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tenantData } = await req.json();

    if (!tenantData) {
      return new Response(
        JSON.stringify({ error: 'Tenant data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tenantData.name || typeof tenantData.name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Tenant name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tenantData.email || typeof tenantData.email !== 'string' || !tenantData.email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid tenant email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedData: TenantData = {
      name: tenantData.name,
      email: tenantData.email,
      income: typeof tenantData.income === 'number' ? tenantData.income : 0,
      lease_start: tenantData.lease_start || new Date().toISOString(),
      lease_end: tenantData.lease_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = analyzeTenant(validatedData);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Tenant screening error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Tenant screening failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
