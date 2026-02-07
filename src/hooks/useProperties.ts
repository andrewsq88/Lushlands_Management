import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { retryWithBackoff } from '../utils/retryHelper';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('No authenticated user found');
        setProperties([]);
        setLoading(false);
        return;
      }

      const data = await retryWithBackoff(
        async () => {
          const { data, error: fetchError } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

          if (fetchError) {
            throw new Error(fetchError.message);
          }

          return data;
        },
        { maxAttempts: 2, initialDelay: 500 }
      );

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load properties: ${errorMessage}`);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (property: Omit<PropertyInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const authError = new Error('User not authenticated');
        console.error('Add property failed:', authError);
        return { data: null, error: authError };
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([{ ...property, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding property:', error);
        return { data: null, error };
      }

      if (data) {
        setProperties(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error adding property:', error);
      return { data: null, error };
    }
  };

  const updateProperty = async (id: string, updates: PropertyUpdate) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProperties(prev => prev.map(p => p.id === id ? data : p));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating property:', error);
      return { data: null, error };
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        alert(`Failed to delete property: ${error.message}`);
        throw error;
      }
      setProperties(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting property:', error);
      alert(`Failed to delete property: ${error?.message || 'Unknown error'}`);
      return { error };
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const stats = {
    total: properties.length,
    occupied: properties.filter(p => p.status === 'occupied').length,
    vacant: properties.filter(p => p.status === 'vacant').length,
  };

  return {
    properties,
    loading,
    error,
    stats,
    addProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
}