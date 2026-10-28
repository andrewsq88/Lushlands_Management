import { createClient } from 'npm:@supabase/supabase-js@2';
import { TAVUS_API, corsHeaders, json, ownerTag, tavusError } from '../_shared/tavus.ts';

// Returns the state of a Tavus video job owned by the caller:
// { status: 'pending' | 'ready' | 'failed', progress?, videoUrl?, error? }
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authorization header required' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'User not authenticated' }, 401);

    const { videoId } = await req.json();
    if (!videoId || typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(videoId)) {
      return json({ error: 'A valid videoId is required' }, 400);
    }

    const apiKey = Deno.env.get('TAVUS_API_KEY');
    if (!apiKey) return json({ error: 'Video generation is not configured. Please contact support.' }, 503);

    const res = await fetch(`${TAVUS_API}/videos/${videoId}`, { headers: { 'x-api-key': apiKey } });
    if (res.status === 404) return json({ error: 'Video not found' }, 404);
    if (!res.ok) return json({ error: await tavusError(res, 'Could not check video status.') }, 502);
    const v = await res.json();

    if (!String(v.video_name ?? '').startsWith(ownerTag(user.id))) {
      return json({ error: 'Video not found' }, 404);
    }

    const s = String(v.status ?? '').toLowerCase();
    if (s === 'ready') {
      const videoUrl = v.download_url || v.stream_url || v.hosted_url;
      if (!videoUrl) return json({ status: 'pending', progress: '100%' });
      return json({ status: 'ready', videoUrl, hostedUrl: v.hosted_url ?? null });
    }
    if (s === 'error' || s === 'deleted') {
      return json({ status: 'failed', error: v.status_details || 'Video generation failed.' });
    }
    return json({ status: 'pending', progress: v.generation_progress ?? null });
  } catch (error) {
    console.error('Video status error:', error);
    return json({ error: error instanceof Error ? error.message : 'Video status check failed' }, 500);
  }
});
