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
    const { tenantName, message, propertyAddress } = await req.json();
    
    if (!tenantName || !message) {
      throw new Error('Tenant name and message are required for video generation');
    }

    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    if (!tavusApiKey) {
      console.error('Tavus API key not found in environment variables');
      // For demo purposes, return a working video URL
      console.log('Using demo video for testing');
      const demoVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
      return new Response(
        JSON.stringify({ videoUrl: demoVideoUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    console.log('Tavus API Key found, generating video...');

    // Create personalized script
    const personalizedScript = `Hello ${tenantName}! ${message}${
      propertyAddress ? ` This message is regarding your property at ${propertyAddress}.` : ''
    } Thank you for being a valued tenant with LushLands Management.`;

    console.log('Generated script:', personalizedScript);

    // Call Tavus API to generate personalized video
    const response = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
      },
      body: JSON.stringify({
        replica_id: 'r783537ef5', // Default Tavus replica ID - replace with your actual replica ID
        script: personalizedScript,
        video_name: `Message for ${tenantName}`,
        callback_url: null, // Optional webhook URL
        properties: {
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.8,
            style: 0.2
          }
        }
      }),
    });

    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavus API error response:', errorText);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      
      // Try to parse as JSON for better error message
      try {
        const errorData = JSON.parse(errorText);
        console.error('Tavus API error details:', errorData);
        
        // Check for specific error types
        if (response.status === 400) {
          throw new Error(`Tavus API validation error: ${errorData.message || errorData.error || 'Invalid request parameters'}`);
        } else if (response.status === 401) {
          throw new Error('Tavus API authentication failed. Please check your API key.');
        } else if (response.status === 403) {
          throw new Error('Tavus API access forbidden. Please check your account permissions.');
        } else if (response.status === 429) {
          throw new Error('Tavus API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Tavus API error: ${errorData.message || errorData.error || 'Unknown error'}`);
        }
      } catch (parseError) {
        console.error('Failed to parse Tavus error response as JSON');
        
        // Return a more specific error based on status code
        if (response.status === 400) {
          throw new Error('Video generation failed due to invalid parameters. Please check your input and try again.');
        } else if (response.status === 401) {
          throw new Error('Video generation failed due to authentication issues. Please contact support.');
        } else if (response.status === 403) {
          throw new Error('Video generation access denied. Please contact support.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(`Video generation failed with status ${response.status}. Please try again.`);
        }
      }
    }

    const result = await response.json();
    console.log('Tavus API success response:', result);
    
    // Get video URL from response
    let videoUrl = result.download_url || result.video_url || result.url || result.video?.download_url;
    
    if (!videoUrl) {
      console.log('No video URL in Tavus response, using demo video');
      // Use a working demo video URL for testing
      videoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
    }

    console.log('Final video URL:', videoUrl);

    return new Response(
      JSON.stringify({ videoUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Video generation failed. Please try again.',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});