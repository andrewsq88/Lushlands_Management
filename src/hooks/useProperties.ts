import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (property: Omit<PropertyInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert([{ ...property, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setProperties(prev => [data, ...prev]);
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

      if (error) throw error;
      setProperties(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting property:', error);
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
    stats,
    addProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
}