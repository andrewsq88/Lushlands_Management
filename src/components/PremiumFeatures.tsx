import React, { useState } from 'react';
import { Mic, Video, Play, Download, AlertCircle, Loader2, Crown } from 'lucide-react';
import { usePremiumFeatures } from '../hooks/usePremiumFeatures';
import { useProperties } from '../hooks/useProperties';
import { useTenants } from '../hooks/useTenants';
import { useMaintenanceRequests } from '../hooks/useMaintenanceRequests';

export function PremiumFeatures() {
  const { isPremium, loading, error, videoProgress, generateVoiceover, generatePersonalizedVideo, clearError } = usePremiumFeatures();
  const { properties } = useProperties();
  const { tenants } = useTenants();
  const { maintenanceRequests } = useMaintenanceRequests();
  
  const [voiceoverText, setVoiceoverText] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState('');
  const [videoMessage, setVideoMessage] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voiceover' | 'video'>('voiceover');

  const handleGenerateVoiceover = async () => {
    if (!voiceoverText.trim()) return;
    
    clearError();
    const { audioUrl, error } = await generateVoiceover(voiceoverText);
    
    if (audioUrl) {
      setGeneratedAudio(audioUrl);
    }
  };

  const handleGeneratePropertyVoiceover = async () => {
    const property = properties.find(p => p.id === selectedProperty);
    if (!property) return;

    const text = `Welcome to this beautiful ${property.type} located at ${property.address}. ${
      property.description ? property.description : 
      `This property features ${property.bedrooms || 'multiple'} bedrooms, ${property.bathrooms || 'multiple'} bathrooms${
        property.square_feet ? `, and ${property.square_feet} square feet of living space` : ''
      }. ${property.rent_amount ? `Monthly rent is $${property.rent_amount.toLocaleString()}.` : ''}`
    }`;

    clearError();
    const { audioUrl, error } = await generateVoiceover(text);
    
    if (audioUrl) {
      setGeneratedAudio(audioUrl);
    }
  };

  const handleGenerateMaintenanceVoiceover = async () => {
    const request = maintenanceRequests.find(r => r.id === selectedMaintenanceRequest);
    if (!request) return;

    const text = `Maintenance request update: ${request.description}. Priority level: ${request.priority}. Current status: ${request.status}. ${
      request.properties?.address ? `Property location: ${request.properties.address}.` : ''
    } Thank you for your patience as we work to resolve this issue.`;

    clearError();
    const { audioUrl, error } = await generateVoiceover(text);
    
    if (audioUrl) {
      setGeneratedAudio(audioUrl);
    }
  };

  const handleGenerateVideo = async () => {
    const tenant = tenants.find(t => t.id === selectedTenant);
    if (!tenant || !videoMessage.trim()) return;

    const property = tenant.property_id ? properties.find(p => p.id === tenant.property_id) : null;
    
    clearError();
    const { videoUrl, error } = await generatePersonalizedVideo(
      tenant.name,
      videoMessage,
      property?.address
    );
    
    if (videoUrl) {
      setGeneratedVideo(videoUrl);
    }
  };

  if (!isPremium) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Crown className="h-6 w-6 text-yellow-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Premium Features</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">AI-powered voice and video accessibility tools</p>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('voiceover')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'voiceover'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mic className="h-4 w-4 mr-2" />
            Voiceover
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'video'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Video className="h-4 w-4 mr-2" />
            Video Messages
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Voiceover Tab */}
        {activeTab === 'voiceover' && (
          <div className="space-y-6">
            {/* Custom Text Voiceover */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Text Voiceover</h3>
              <textarea
                value={voiceoverText}
                onChange={(e) => setVoiceoverText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter text to convert to speech..."
              />
              <button
                onClick={handleGenerateVoiceover}
                disabled={loading || !voiceoverText.trim()}
                className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                Generate Voiceover
              </button>
            </div>

            {/* Property Description Voiceover */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Property Description Voiceover</h3>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.address}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGeneratePropertyVoiceover}
                disabled={loading || !selectedProperty}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                Generate Property Voiceover
              </button>
            </div>

            {/* Maintenance Request Voiceover */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Maintenance Update Voiceover</h3>
              <select
                value={selectedMaintenanceRequest}
                onChange={(e) => setSelectedMaintenanceRequest(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              >
                <option value="">Select a maintenance request</option>
                {maintenanceRequests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.description.substring(0, 50)}... - {request.properties?.address}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerateMaintenanceVoiceover}
                disabled={loading || !selectedMaintenanceRequest}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                Generate Maintenance Voiceover
              </button>
            </div>

            {/* Generated Audio Player */}
            {generatedAudio && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Generated Voiceover</h3>
                <div className="flex items-center space-x-3">
                  <audio controls className="flex-1">
                    <source src={generatedAudio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <a
                    href={generatedAudio}
                    download="voiceover.mp3"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Personalized Tenant Video</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Message</label>
                  <textarea
                    value={videoMessage}
                    onChange={(e) => setVideoMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your personalized message for the tenant..."
                  />
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={loading || !selectedTenant || !videoMessage.trim()}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4 mr-2" />
                  )}
                  {videoProgress ? `Generating video: ${videoProgress}` : 'Generate Personalized Video'}
                </button>
              </div>
              {videoProgress && (
                <p className="text-xs text-gray-500 mt-2">
                  Videos usually take a few minutes to render. Keep this tab open.
                </p>
              )}
            </div>

            {/* Generated Video Player */}
            {generatedVideo && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-sm font-medium text-purple-900 mb-3">Generated Video Message</h3>
                <div className="space-y-3">
                  <video controls className="w-full rounded-lg">
                    <source src={generatedVideo} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-purple-700">
                      Personalized video ready to share with {tenants.find(t => t.id === selectedTenant)?.name}
                    </p>
                    <a
                      href={generatedVideo}
                      download="personalized-video.mp4"
                      className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}