import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type MaintenanceRequestInsert = Database['public']['Tables']['maintenance_requests']['Insert'];
type MaintenanceRequestUpdate = Database['public']['Tables']['maintenance_requests']['Update'];

export function useMaintenanceRequests() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaintenanceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenants (
            name,
            email
          ),
          properties (
            address,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaintenanceRequests(data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMaintenanceRequest = async (request: Omit<MaintenanceRequestInsert, 'user_id' | 'priority'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get AI priority analysis
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-prioritization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: request.description
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
          priority 
        }])
        .select(`
          *,
          tenants (
            name,
            email
          ),
          properties (
            address,
            type
          )
        `)
        .single();

      if (error) throw error;
      setMaintenanceRequests(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding maintenance request:', error);
      return { data: null, error };
    }
  };

  const updateMaintenanceRequest = async (id: string, updates: MaintenanceRequestUpdate) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          tenants (
            name,
            email
          ),
          properties (
            address,
            type
          )
        `)
        .single();

      if (error) throw error;
      setMaintenanceRequests(prev => prev.map(r => r.id === id ? data : r));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      return { data: null, error };
    }
  };

  const deleteMaintenanceRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMaintenanceRequests(prev => prev.filter(r => r.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const highPriorityRequests = maintenanceRequests.filter(r => r.priority === 'High' && r.status === 'Open');
  const openRequests = maintenanceRequests.filter(r => r.status === 'Open');

  return {
    maintenanceRequests,
    highPriorityRequests,
    openRequests,
    loading,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    refetch: fetchMaintenanceRequests,
  };
}