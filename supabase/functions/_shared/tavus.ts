// Shared Tavus helpers. Video generation is asynchronous: we start a job and
// the browser polls `video-status` until Tavus reports it ready.
export const TAVUS_API = 'https://tavusapi.com/v2';

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Jobs are tagged with the owner's id so video-status can refuse other users' jobs.
export const ownerTag = (userId: string) => `lushlands:${userId}:`;

export async function tavusError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  console.error('Tavus API error', res.status, text.slice(0, 500));
  if (res.status === 401) return 'Video service authentication failed. Please contact support.';
  if (res.status === 429) return 'Video service rate limit reached. Please try again later.';
  try {
    const d = JSON.parse(text);
    return d.message || d.error || fallback;
  } catch {
    return fallback;
  }
}

/** Starts a Tavus video job. Returns { videoId } or { error, status }. */
export async function startTavusVideo(
  apiKey: string,
  script: string,
  videoName: string,
): Promise<{ videoId: string } | { error: string; status: number }> {
  const res = await fetch(`${TAVUS_API}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({
      replica_id: Deno.env.get('TAVUS_REPLICA_ID') || 'r783537ef5',
      script,
      video_name: videoName,
    }),
  });
  if (!res.ok) return { error: await tavusError(res, 'Could not start video generation.'), status: 502 };
  const data = await res.json();
  if (!data?.video_id) return { error: 'Video service did not return a job id.', status: 502 };
  return { videoId: data.video_id };
}
