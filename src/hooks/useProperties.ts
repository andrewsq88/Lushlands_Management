import { useEffect, useSyncExternalStore } from 'react';
import { propertiesCollection } from '../lib/collections';
import { createLoader } from '../lib/liveCollection';
import { commitOptimistic } from '../lib/optimisticUpdate';
import { retainRealtime } from '../lib/realtime';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

const loadProperties = createLoader(
  propertiesCollection,
  async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  'Error fetching properties:',
);

propertiesCollection.setDirtyFlush(() => {
  void loadProperties(true);
});

function onPropertiesChange() {
  if (propertiesCollection.hasInflightWrites()) {
    propertiesCollection.markDirty();
    return;
  }
  void loadProperties(true);
}

export function useProperties() {
  const { items: properties, loading } = useSyncExternalStore(
    propertiesCollection.subscribe,
    propertiesCollection.getSnapshot,
    propertiesCollection.getSnapshot,
  );

  useEffect(() => {
    void loadProperties();
    return retainRealtime('properties', onPropertiesChange);
  }, []);

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
      propertiesCollection.upsert(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding property:', error);
      return { data: null, error };
    }
  };

  const updateProperty = (id: string, updates: PropertyUpdate) => {
    return commitOptimistic(
      propertiesCollection,
      id,
      updates,
      async () => {
        const { data, error } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error || !data) return { data: null, error: error ?? new Error('Property update failed') };
        return { data, error: null };
      },
      "Couldn't update the property. The previous value was restored.",
    );
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      propertiesCollection.remove(id);
      return { error: null };
    } catch (error) {
      console.error('Error deleting property:', error);
      return { error };
    }
  };

  const stats = {
    total: properties.length,
    occupied: properties.filter((property) => property.status === 'occupied').length,
    vacant: properties.filter((property) => property.status === 'vacant').length,
    maintenance: properties.filter((property) => property.status === 'maintenance').length,
  };

  return {
    properties,
    loading,
    stats,
    addProperty,
    updateProperty,
    deleteProperty,
    refetch: () => loadProperties(true),
  };
}
