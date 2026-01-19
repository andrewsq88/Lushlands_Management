const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MaintenanceRequest {
  description: string;
}

interface PriorityResult {
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

async function analyzePriorityWithGoogleCloud(description: string): Promise<PriorityResult> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  
  if (!apiKey) {
    throw new Error('Google Cloud API key not configured');
  }

  try {
    // Convert description to lowercase for analysis
    const desc = description.toLowerCase();
    
    // High priority keywords (safety, water, electrical, security)
    const highPriorityKeywords = [
      'leak', 'flooding', 'water damage', 'electrical', 'fire', 'smoke', 'gas',
      'broken window', 'door lock', 'security', 'emergency', 'urgent',
      'no heat', 'no hot water', 'toilet overflow', 'ceiling collapse',
      'mold', 'pest', 'infestation', 'break in', 'burglary'
    ];
    
    // Medium priority keywords (comfort, functionality)
    const mediumPriorityKeywords = [
      'air conditioning', 'heating', 'appliance', 'dishwasher', 'washing machine',
      'dryer', 'refrigerator', 'oven', 'stove', 'garbage disposal',
      'light fixture', 'outlet', 'switch', 'faucet', 'shower', 'bathtub',
      'cabinet', 'door handle', 'window', 'blind', 'curtain'
    ];
    
    // Low priority keywords (cosmetic, minor issues)
    const lowPriorityKeywords = [
      'paint', 'scratch', 'scuff', 'cosmetic', 'minor', 'squeaky',
      'loose handle', 'flickering light', 'slow drain', 'running toilet',
      'sticky door', 'creaky floor', 'small hole', 'touch up'
    ];
    
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    let reasoning = 'Standard maintenance request';
    
    // Check for high priority indicators
    for (const keyword of highPriorityKeywords) {
      if (desc.includes(keyword)) {
        priority = 'High';
        reasoning = `High priority due to: ${keyword}. Requires immediate attention for safety/security.`;
        break;
      }
    }
    
    // If not high priority, check for low priority indicators
    if (priority !== 'High') {
      for (const keyword of lowPriorityKeywords) {
        if (desc.includes(keyword)) {
          priority = 'Low';
          reasoning = `Low priority: ${keyword}. Cosmetic or minor issue that can be scheduled.`;
          break;
        }
      }
    }
    
    // If not high or low, check for medium priority indicators
    if (priority === 'Medium') {
      for (const keyword of mediumPriorityKeywords) {
        if (desc.includes(keyword)) {
          reasoning = `Medium priority: ${keyword}. Affects comfort or functionality.`;
          break;
        }
      }
    }
    
    return {
      priority,
      reasoning
    };
  } catch (error) {
    console.error('Google Cloud API error:', error);
    
    // Fallback to simple keyword analysis
    const desc = description.toLowerCase();
    if (desc.includes('leak') || desc.includes('emergency') || desc.includes('urgent')) {
      return {
        priority: 'High',
        reasoning: 'Fallback analysis detected urgent keywords'
      };
    } else if (desc.includes('light') || desc.includes('minor') || desc.includes('cosmetic')) {
      return {
        priority: 'Low',
        reasoning: 'Fallback analysis detected minor issue keywords'
      };
    } else {
      return {
        priority: 'Medium',
        reasoning: 'Fallback analysis - standard priority'
      };
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description) {
      throw new Error('Description is required');
    }

    const result = await analyzePriorityWithGoogleCloud(description);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Maintenance prioritization error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});