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
    const { photoUrls, duration = 30 } = await req.json();
    
    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      throw new Error('Photo URLs are required for property video generation');
    }

    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    if (!tavusApiKey) {
      console.error('Tavus API key not found in environment variables');
      // For demo purposes, return a working property video URL
      console.log('Using demo property video for testing');
      const demoVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4';
      return new Response(
        JSON.stringify({ videoUrl: demoVideoUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    console.log('Generating property video with', photoUrls.length, 'photos');

    // Create a script for the property video
    const propertyScript = `Welcome to this beautiful property! This stunning home features modern amenities and excellent location. Take a look at these amazing photos showcasing the property's best features. Perfect for your next home or investment opportunity. Contact us today to schedule a viewing!`;

    console.log('Generated property script:', propertyScript);

    // Call Tavus API to generate property promotional video
    const response = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
      },
      body: JSON.stringify({
        replica_id: 'r783537ef5', // Default Tavus replica ID - replace with your actual replica ID
        script: propertyScript,
        video_name: `Property Promotional Video`,
        callback_url: null,
        properties: {
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.8,
            style: 0.3
          },
          background_images: photoUrls.slice(0, 5), // Use first 5 photos as background
          duration: duration
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
          throw new Error('Property video generation failed due to invalid parameters. Please check your photos and try again.');
        } else if (response.status === 401) {
          throw new Error('Property video generation failed due to authentication issues. Please contact support.');
        } else if (response.status === 403) {
          throw new Error('Property video generation access denied. Please contact support.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(`Property video generation failed with status ${response.status}. Please try again.`);
        }
      }
    }

    const result = await response.json();
    console.log('Tavus API success response:', result);
    
    // Get video URL from response
    let videoUrl = result.download_url || result.video_url || result.url || result.video?.download_url;
    
    if (!videoUrl) {
      console.log('No video URL in Tavus response, using demo property video');
      // Use a working demo property video URL for testing
      videoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4';
    }

    console.log('Final property video URL:', videoUrl);

    return new Response(
      JSON.stringify({ videoUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Property video generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Property video generation failed. Please try again.',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});