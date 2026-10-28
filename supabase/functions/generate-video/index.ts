import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkLimit, logUsage } from '../_shared/usage.ts';
import { corsHeaders, json, ownerTag, startTavusVideo } from '../_shared/tavus.ts';

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

    const limitError = await checkLimit(user.id, 'video');
    if (limitError) {
      return new Response(
        JSON.stringify({ error: limitError }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tenantName, message, propertyAddress } = await req.json();

    if (!tenantName || !message) {
      return new Response(
        JSON.stringify({ error: 'Tenant name and message are required for video generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    if (!tavusApiKey) {
      return json({ error: 'Video generation is not configured. Please contact support.' }, 503);
    }

    const personalizedScript = `Hello ${tenantName}! ${message}${
      propertyAddress ? ` This message is regarding your property at ${propertyAddress}.` : ''
    } Thank you for being a valued tenant with LushLands Management.`;

    const job = await startTavusVideo(tavusApiKey, personalizedScript, `${ownerTag(user.id)}Message for ${tenantName}`);
    if ('error' in job) return json({ error: job.error }, job.status);

    // Count usage only once Tavus has accepted the job.
    await logUsage(user.id, 'video', 'tavus');

    return json({ videoId: job.videoId, status: 'pending' }, 202);
  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Video generation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
