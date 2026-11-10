import { useEffect, useSyncExternalStore } from 'react';
import { propertiesCollection } from '../lib/collections';
import type { Property } from '../lib/collections';
import { createLoader } from '../lib/liveCollection';
import { commitOptimistic } from '../lib/optimisticUpdate';
import { isFreePropertyLimitError } from '../lib/propertyLimit';
import { retainRealtime } from '../lib/realtime';
import { errorText, pushErrorToast } from '../lib/toast';
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
    const optimisticId = `pending-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
    let started = false;
    const rollback = () => {
      if (propertiesCollection.getById(optimisticId)) propertiesCollection.remove(optimisticId);
    };
    const reportFailure = (error: unknown) => {
      console.error('Error adding property:', error);
      // The form shows PropertyLimitNotice for this error. A generic toast would cover it.
      if (!isFreePropertyLimitError(error)) {
        pushErrorToast(errorText(error, "Couldn't add the property. It was removed."));
      }
      return { data: null, error };
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date().toISOString();
      const optimistic: Property = {
        id: optimisticId,
        address: property.address,
        type: property.type,
        status: property.status ?? 'vacant',
        rent_amount: property.rent_amount ?? null,
        bedrooms: property.bedrooms ?? null,
        bathrooms: property.bathrooms ?? null,
        square_feet: property.square_feet ?? null,
        description: property.description ?? null,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      };

      propertiesCollection.beginWrite();
      started = true;
      propertiesCollection.upsert(optimistic);

      const { data, error } = await supabase
        .from('properties')
        .insert([{ ...property, user_id: user.id }])
        .select()
        .single();

      rollback();
      if (error || !data) return reportFailure(error ?? new Error('Could not add the property.'));
      propertiesCollection.upsert(data);
      return { data, error: null };
    } catch (error) {
      rollback();
      return reportFailure(error);
    } finally {
      if (started) propertiesCollection.endWrite();
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
