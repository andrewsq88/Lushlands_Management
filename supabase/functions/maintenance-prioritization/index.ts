import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PriorityResult {
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

function analyzePriority(description: string): PriorityResult {
  const desc = description.toLowerCase();

  const highPriorityKeywords = [
    'leak', 'flooding', 'water damage', 'electrical', 'fire', 'smoke', 'gas',
    'broken window', 'door lock', 'security', 'emergency', 'urgent',
    'no heat', 'no hot water', 'toilet overflow', 'ceiling collapse',
    'mold', 'pest', 'infestation', 'break in', 'burglary'
  ];

  const mediumPriorityKeywords = [
    'air conditioning', 'heating', 'appliance', 'dishwasher', 'washing machine',
    'dryer', 'refrigerator', 'oven', 'stove', 'garbage disposal',
    'light fixture', 'outlet', 'switch', 'faucet', 'shower', 'bathtub',
    'cabinet', 'door handle', 'window', 'blind', 'curtain'
  ];

  const lowPriorityKeywords = [
    'paint', 'scratch', 'scuff', 'cosmetic', 'minor', 'squeaky',
    'loose handle', 'flickering light', 'slow drain', 'running toilet',
    'sticky door', 'creaky floor', 'small hole', 'touch up'
  ];

  for (const keyword of highPriorityKeywords) {
    if (desc.includes(keyword)) {
      return {
        priority: 'High',
        reasoning: `High priority due to: ${keyword}. Requires immediate attention for safety/security.`
      };
    }
  }

  for (const keyword of lowPriorityKeywords) {
    if (desc.includes(keyword)) {
      return {
        priority: 'Low',
        reasoning: `Low priority: ${keyword}. Cosmetic or minor issue that can be scheduled.`
      };
    }
  }

  for (const keyword of mediumPriorityKeywords) {
    if (desc.includes(keyword)) {
      return {
        priority: 'Medium',
        reasoning: `Medium priority: ${keyword}. Affects comfort or functionality.`
      };
    }
  }

  return { priority: 'Medium', reasoning: 'Standard maintenance request' };
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

    const { description } = await req.json();

    if (!description || typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = analyzePriority(description);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Maintenance prioritization error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Prioritization failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
