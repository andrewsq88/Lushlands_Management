import { useState } from 'react';
import { useSubscription } from './useSubscription';
import { supabase } from '../lib/supabase';

export function usePremiumFeatures() {
  const { isPremium, canUseFeature, logPremiumUsage } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<string | null>(null);

  // Tavus renders videos asynchronously: poll video-status until ready or failed.
  const waitForVideo = async (videoId: string, accessToken: string): Promise<string> => {
    const started = Date.now();
    const timeoutMs = 15 * 60 * 1000;
    setVideoProgress('Queued');
    while (Date.now() - started < timeoutMs) {
      await new Promise((r) => setTimeout(r, 10000));
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/video-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not check video status.');
      if (body.status === 'ready' && body.videoUrl) return body.videoUrl as string;
      if (body.status === 'failed') throw new Error(body.error || 'Video generation failed.');
      setVideoProgress(body.progress ? `Rendering… ${body.progress}` : 'Rendering…');
    }
    throw new Error('Video is still rendering. Please check back in a few minutes.');
  };

  const generateVoiceover = async (text: string, voice?: string) => {
    // Check if user can use this feature
    if (!canUseFeature('voiceover')) {
      const errorMsg = 'You have reached your monthly limit for voiceover generation. Upgrade to Premium for unlimited access.';
      console.error(errorMsg);
      setError(errorMsg);
      return { audioUrl: null, error: errorMsg };
    }

    console.log('Generating voiceover for text:', text.substring(0, 50) + '...');
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-voiceover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: voice || 'default'
        }),
      });

      console.log('Voiceover API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Voiceover API error:', errorData);
        throw new Error(errorData.error || 'Voiceover generation failed. Please try again.');
      }

      const result = await response.json();
      console.log('Voiceover generated successfully');
      
      // Save audio to Supabase storage
      const audioUrl = await saveAudioToStorage(result.audioUrl, text);
      
      // Log usage (this will count against free user limits)
      await logPremiumUsage('voiceover', 'eleven_labs');
      
      return { audioUrl, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voiceover generation failed. Try again.';
      console.error('Voiceover generation error:', errorMessage);
      setError(errorMessage);
      return { audioUrl: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedVideo = async (tenantName: string, message: string, propertyAddress?: string) => {
    // Check if user can use this feature
    if (!canUseFeature('video')) {
      const errorMsg = 'You have reached your monthly limit for video generation. Upgrade to Premium for unlimited access.';
      console.error(errorMsg);
      setError(errorMsg);
      return { videoUrl: null, error: errorMsg };
    }

    console.log('Generating personalized video for tenant:', tenantName);
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantName,
          message,
          propertyAddress
        }),
      });

      console.log('Video API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Video API error:', errorData);
        throw new Error(errorData.error || 'Video generation failed. Please try again.');
      }

      const result = await response.json();
      if (!result.videoId) throw new Error('Video service did not return a job id.');
      // Usage is logged server-side when the job is accepted.
      const finalUrl = await waitForVideo(result.videoId, session.access_token);
      const videoUrl = await saveVideoToStorage(finalUrl, `${tenantName}-message`);

      return { videoUrl, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Video generation failed. Try again.';
      console.error('Video generation error:', errorMessage);
      setError(errorMessage);
      return { videoUrl: null, error: errorMessage };
    } finally {
      setLoading(false);
      setVideoProgress(null);
    }
  };

  const generatePropertyVideo = async (photos: File[]) => {
    // Check if user can use this feature
    if (!canUseFeature('video')) {
      const errorMsg = 'You have reached your monthly limit for video generation. Upgrade to Premium for unlimited access.';
      console.error(errorMsg);
      setError(errorMsg);
      return { videoUrl: null, error: errorMsg };
    }

    console.log('Generating property video with', photos.length, 'photos');
    setLoading(true);
    setError(null);

    try {
      // Upload photos to Supabase storage first
      const photoUrls = await uploadPropertyPhotos(photos);
      
      // Generate video using Tavus API with uploaded photos
      const { data: { session: videoSession } } = await supabase.auth.getSession();
      if (!videoSession) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-property-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${videoSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrls,
          duration: 30 // 30 second video
        }),
      });

      console.log('Property video API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Property video API error:', errorData);
        throw new Error(errorData.error || 'Property video generation failed. Please try again.');
      }

      const result = await response.json();
      if (!result.videoId) throw new Error('Video service did not return a job id.');
      // Usage is logged server-side when the job is accepted.
      const finalUrl = await waitForVideo(result.videoId, videoSession.access_token);
      const videoUrl = await saveVideoToStorage(finalUrl, 'property-promotional');

      return { videoUrl, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Property video generation failed. Try again.';
      console.error('Property video generation error:', errorMessage);
      setError(errorMessage);
      return { videoUrl: null, error: errorMessage };
    } finally {
      setLoading(false);
      setVideoProgress(null);
    }
  };

  const uploadPropertyPhotos = async (photos: File[]): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const photoUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileName = `${user.id}/property-photos/${Date.now()}-${i}.${photo.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('property-media')
        .upload(fileName, photo, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading photo:', error);
        throw new Error(`Failed to upload photo ${i + 1}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-media')
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl);
    }

    console.log('Successfully uploaded', photoUrls.length, 'photos');
    return photoUrls;
  };

  const saveAudioToStorage = async (audioDataUrl: string, description: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Convert data URL to blob
      const response = await fetch(audioDataUrl);
      const blob = await response.blob();
      
      const fileName = `${user.id}/audio/${Date.now()}-voiceover.mp3`;
      
      const { data, error } = await supabase.storage
        .from('property-media')
        .upload(fileName, blob, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error saving audio to storage:', error);
        return audioDataUrl; // Return original if storage fails
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-media')
        .getPublicUrl(fileName);

      console.log('Audio saved to storage:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in saveAudioToStorage:', error);
      return audioDataUrl; // Return original if storage fails
    }
  };

  const saveVideoToStorage = async (videoUrl: string, description: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // If it's already a data URL, convert to blob
      if (videoUrl.startsWith('data:')) {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        
        const fileName = `${user.id}/videos/${Date.now()}-${description}.mp4`;
        
        const { data, error } = await supabase.storage
          .from('property-media')
          .upload(fileName, blob, {
            contentType: 'video/mp4',
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Error saving video to storage:', error);
          return videoUrl; // Return original if storage fails
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-media')
          .getPublicUrl(fileName);

        console.log('Video saved to storage:', publicUrl);
        return publicUrl;
      }

      // If it's already a URL, return as is (might be from external service)
      return videoUrl;
    } catch (error) {
      console.error('Error in saveVideoToStorage:', error);
      return videoUrl; // Return original if storage fails
    }
  };

  return {
    isPremium,
    videoProgress,
    loading,
    error,
    canUseFeature,
    generateVoiceover,
    generatePersonalizedVideo,
    generatePropertyVideo,
    uploadPropertyPhotos,
    clearError: () => setError(null)
  };
}