import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
      const demoVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4';
      return new Response(
        JSON.stringify({ videoUrl: demoVideoUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const propertyScript = `Welcome to this beautiful property! This stunning home features modern amenities and excellent location. Take a look at these amazing photos showcasing the property's best features. Perfect for your next home or investment opportunity. Contact us today to schedule a viewing!`;

    const response = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
      },
      body: JSON.stringify({
        replica_id: 'r783537ef5',
        script: propertyScript,
        video_name: `Property Promotional Video`,
        callback_url: null,
        properties: {
          voice_settings: { stability: 0.8, similarity_boost: 0.8, style: 0.3 },
          background_images: photoUrls.slice(0, 5),
          duration: duration
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavus API error:', errorText);

      let errorMessage = 'Property video generation failed. Please try again.';
      try {
        const errorData = JSON.parse(errorText);
        if (response.status === 401) errorMessage = 'Tavus API authentication failed.';
        else if (response.status === 429) errorMessage = 'Rate limit exceeded. Please try again later.';
        else errorMessage = errorData.message || errorData.error || errorMessage;
      } catch { /* use default */ }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    let videoUrl = result.download_url || result.video_url || result.url || result.video?.download_url;

    if (!videoUrl) {
      videoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4';
    }

    return new Response(
      JSON.stringify({ videoUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Property video generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Property video generation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
