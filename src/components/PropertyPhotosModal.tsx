import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Download, Image as ImageIcon, AlertCircle, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PropertyPhotosModalProps {
  property: any;
  onClose: () => void;
}

interface PropertyPhoto {
  id: string;
  url: string;
  name: string;
  size: number;
  uploaded_at: string;
}

export function PropertyPhotosModal({ property, onClose }: PropertyPhotosModalProps) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchPropertyPhotos();
  }, [property.id]);

  const fetchPropertyPhotos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // List files in the property's folder
      const { data: files, error } = await supabase.storage
        .from('property-media')
        .list(`${user.id}/properties/${property.id}`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      // Get public URLs for all files
      const photoPromises = files
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('property-media')
            .getPublicUrl(`${user.id}/properties/${property.id}/${file.name}`);

          return {
            id: file.id || file.name,
            url: publicUrl,
            name: file.name,
            size: file.metadata?.size || 0,
            uploaded_at: file.created_at || file.updated_at || new Date().toISOString(),
          };
        });

      const propertyPhotos = await Promise.all(photoPromises);
      setPhotos(propertyPhotos);
    } catch (error) {
      console.error('Error fetching property photos:', error);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError(null);

    // Validate file count (max 20 photos per property)
    if (photos.length + files.length > 20) {
      setError(`Maximum 20 photos allowed per property. You can add ${20 - photos.length} more photos.`);
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file sizes (10MB per file)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);

    if (oversizedFiles.length > 0) {
      const oversizedNames = oversizedFiles.map(file => file.name).join(', ');
      setError(`The following files exceed 10MB limit: ${oversizedNames}`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const uploadPromises = selectedFiles.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/properties/${property.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('property-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
        return fileName;
      });

      await Promise.all(uploadPromises);
      
      // Clear selected files and refresh the photo list
      setSelectedFiles([]);
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await fetchPropertyPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: PropertyPhoto) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const filePath = `${user.id}/properties/${property.id}/${photo.name}`;

      const { error } = await supabase.storage
        .from('property-media')
        .remove([filePath]);

      if (error) throw error;

      // Remove photo from local state
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Camera className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Property Photos</h3>
              <p className="text-sm text-gray-600">{property.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-sm font-medium text-purple-900 mb-3">Upload New Photos</h4>
            
            <div className="space-y-3">
              <div>
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  disabled={uploading}
                />
                <p className="text-xs text-purple-600 mt-1">
                  Max 20 photos per property, 10MB each. JPEG, PNG, WebP formats only.
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 mb-2">
                    Selected: {selectedFiles.length} files
                    <span className="text-xs text-purple-600 ml-2">
                      (Total: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))})
                    </span>
                  </p>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex justify-between text-xs text-purple-700">
                        <span className="truncate">{file.name}</span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                Property Photos ({photos.length}/20)
              </h4>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                <p className="text-gray-500">Upload photos to showcase this property</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <a
                          href={photo.url}
                          download={photo.name}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeletePhoto(photo)}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photo info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">{photo.name}</p>
                      <p className="text-white text-xs opacity-75">{formatFileSize(photo.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}