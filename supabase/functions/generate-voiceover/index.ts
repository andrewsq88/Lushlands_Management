const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'default' } = await req.json();
    
    if (!text) {
      throw new Error('Text is required for voiceover generation');
    }

    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!elevenLabsApiKey) {
      throw new Error('Eleven Labs API key not configured');
    }

    // Use a default voice ID - replace with actual Eleven Labs voice ID
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (default)
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eleven Labs API error:', errorText);
      throw new Error('Voiceover generation failed. Please try again.');
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for easier handling
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return new Response(
      JSON.stringify({ audioUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Voiceover generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});