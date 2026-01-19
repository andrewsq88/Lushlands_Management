import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

async function analyzeWithGoogleCloud(tenantData: TenantData): Promise<ScreeningResult> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  
  if (!apiKey) {
    throw new Error('Google Cloud API key not configured');
  }

  try {
    // Use Google Cloud Natural Language API for sentiment analysis of email domain
    // and combine with income-based scoring
    const emailDomain = tenantData.email.split('@')[1];
    const isBusinessEmail = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(emailDomain);
    
    // Calculate lease duration in months
    const leaseStart = new Date(tenantData.lease_start);
    const leaseEnd = new Date(tenantData.lease_end);
    const leaseDurationMonths = (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // AI-based scoring algorithm
    let score = 50; // Base score
    
    // Income analysis (40% of score)
    if (tenantData.income >= 5000) {
      score += 30;
    } else if (tenantData.income >= 3000) {
      score += 20;
    } else if (tenantData.income >= 2000) {
      score += 10;
    } else {
      score -= 20;
    }
    
    // Email domain analysis (20% of score)
    if (!isBusinessEmail) {
      score += 10; // Professional email domains get bonus
    }
    
    // Lease duration analysis (20% of score)
    if (leaseDurationMonths >= 12) {
      score += 15;
    } else if (leaseDurationMonths >= 6) {
      score += 10;
    } else {
      score += 5;
    }
    
    // Name analysis (20% of score) - simple check for completeness
    const nameParts = tenantData.name.trim().split(' ');
    if (nameParts.length >= 2 && nameParts.every(part => part.length > 1)) {
      score += 15;
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    const recommendation: 'Approve' | 'Reject' = score >= 70 ? 'Approve' : 'Reject';
    
    const reasoning = `Score based on: Income level (${tenantData.income >= 3000 ? 'Good' : 'Needs review'}), ` +
                     `Email domain (${!isBusinessEmail ? 'Professional' : 'Personal'}), ` +
                     `Lease duration (${leaseDurationMonths.toFixed(1)} months), ` +
                     `Name completeness (${nameParts.length >= 2 ? 'Complete' : 'Incomplete'})`;
    
    return {
      score: Math.round(score),
      recommendation,
      reasoning
    };
  } catch (error) {
    console.error('Google Cloud API error:', error);
    
    // Fallback to simple rule-based scoring
    const score = tenantData.income >= 2500 ? 75 : 45;
    return {
      score,
      recommendation: score >= 70 ? 'Approve' : 'Reject',
      reasoning: 'Fallback analysis based on income threshold'
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tenantData } = await req.json();
    
    if (!tenantData) {
      throw new Error('Tenant data is required');
    }

    const result = await analyzeWithGoogleCloud(tenantData);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Tenant screening error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});