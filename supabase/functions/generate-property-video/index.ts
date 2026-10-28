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

    const { photoUrls, duration = 30 } = await req.json();

    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Photo URLs are required for property video generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof duration !== 'number' || duration < 5 || duration > 300) {
      return new Response(
        JSON.stringify({ error: 'Duration must be between 5 and 300 seconds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    if (!tavusApiKey) {
      return json({ error: 'Video generation is not configured. Please contact support.' }, 503);
    }

    const propertyScript = `Welcome to this beautiful property! This stunning home features modern amenities and excellent location. Take a look at these amazing photos showcasing the property's best features. Perfect for your next home or investment opportunity. Contact us today to schedule a viewing!`;

    const job = await startTavusVideo(tavusApiKey, propertyScript, `${ownerTag(user.id)}Property video`);
    if ('error' in job) return json({ error: job.error }, job.status);

    // Count usage only once Tavus has accepted the job.
    await logUsage(user.id, 'video', 'tavus');

    return json({ videoId: job.videoId, status: 'pending' }, 202);
  } catch (error) {
    console.error('Property video generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Property video generation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
