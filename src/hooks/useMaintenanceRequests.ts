import { useEffect, useSyncExternalStore } from 'react';
import { maintenanceCollection } from '../lib/collections';
import type { MaintenanceRequest } from '../lib/collections';
import { createLoader } from '../lib/liveCollection';
import { commitOptimistic } from '../lib/optimisticUpdate';
import { retainRealtime } from '../lib/realtime';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type MaintenanceRequestInsert = Database['public']['Tables']['maintenance_requests']['Insert'];
type MaintenanceRequestUpdate = Database['public']['Tables']['maintenance_requests']['Update'];

const requestSelect = `
  *,
  tenants (
    name,
    email
  ),
  properties (
    address,
    type
  )
`;

const loadMaintenanceRequests = createLoader(
  maintenanceCollection,
  async () => {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(requestSelect)
      .order('created_at', { ascending: false });
    return { data: data as MaintenanceRequest[] | null, error };
  },
  'Error fetching maintenance requests:',
);

maintenanceCollection.setDirtyFlush(() => {
  void loadMaintenanceRequests(true);
});

function onMaintenanceChange() {
  if (maintenanceCollection.hasInflightWrites()) {
    maintenanceCollection.markDirty();
    return;
  }
  void loadMaintenanceRequests(true);
}

export function useMaintenanceRequests() {
  const { items: maintenanceRequests, loading } = useSyncExternalStore(
    maintenanceCollection.subscribe,
    maintenanceCollection.getSnapshot,
    maintenanceCollection.getSnapshot,
  );

  useEffect(() => {
    void loadMaintenanceRequests();
    return retainRealtime('maintenance_requests', onMaintenanceChange);
  }, []);

  const addMaintenanceRequest = async (request: Omit<MaintenanceRequestInsert, 'user_id' | 'priority'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');
      const user = session.user;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-prioritization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: request.description,
        }),
      });

      let priority = 'Medium';
      if (response.ok) {
        const aiResult = await response.json();
        priority = aiResult.priority;
      }

      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([{
          ...request,
          user_id: user.id,
          priority,
        }])
        .select(requestSelect)
        .single();

      if (error) throw error;
      maintenanceCollection.upsert(data as MaintenanceRequest);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding maintenance request:', error);
      return { data: null, error };
    }
  };

  const updateMaintenanceRequest = (id: string, updates: MaintenanceRequestUpdate) => {
    return commitOptimistic(
      maintenanceCollection,
      id,
      updates,
      async () => {
        try {
          const { data, error } = await supabase
            .from('maintenance_requests')
            .update(updates)
            .eq('id', id)
            .select(requestSelect)
            .single();
          if (error || !data) return { data: null, error: error ?? new Error('Maintenance update failed') };
          return { data: data as MaintenanceRequest, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      "Couldn't update the maintenance request. The previous value was restored.",
    );
  };

  const deleteMaintenanceRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      maintenanceCollection.remove(id);
      return { error: null };
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      return { error };
    }
  };

  const highPriorityRequests = maintenanceRequests.filter((request) => request.priority === 'High' && request.status === 'Open');
  const openRequests = maintenanceRequests.filter((request) => request.status === 'Open');

  return {
    maintenanceRequests,
    highPriorityRequests,
    openRequests,
    loading,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    refetch: () => loadMaintenanceRequests(true),
  };
}
