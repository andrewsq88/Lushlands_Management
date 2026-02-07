import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Tenant = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];
type ScreeningResult = Database['public']['Tables']['screening_results']['Row'];

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          properties (
            address,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTenant = async (tenant: Omit<TenantInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tenants')
        .insert([{ ...tenant, user_id: user.id }])
        .select(`
          *,
          properties (
            address,
            type
          )
        `)
        .single();

      if (error) throw error;
      setTenants(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding tenant:', error);
      return { data: null, error };
    }
  };

  const updateTenant = async (id: string, updates: TenantUpdate) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          properties (
            address,
            type
          )
        `)
        .single();

      if (error) throw error;
      setTenants(prev => prev.map(t => t.id === id ? data : t));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating tenant:', error);
      return { data: null, error };
    }
  };

  const deleteTenant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        alert(`Failed to delete tenant: ${error.message}`);
        throw error;
      }
      setTenants(prev => prev.filter(t => t.id !== id));
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      alert(`Failed to delete tenant: ${error?.message || 'Unknown error'}`);
      return { error };
    }
  };

  const screenTenantAI = async (tenant: Tenant) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call AI screening function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-screening`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantData: {
            name: tenant.name,
            email: tenant.email,
            income: tenant.income || 0,
            lease_start: tenant.lease_start || '',
            lease_end: tenant.lease_end || '',
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to screen tenant');
      }

      const aiResult = await response.json();

      // Save screening result to database
      const { data, error } = await supabase
        .from('screening_results')
        .insert([{
          tenant_id: tenant.id,
          user_id: user.id,
          score: aiResult.score,
          recommendation: aiResult.recommendation,
        }])
        .select()
        .single();

      if (error) throw error;

      return { 
        data: {
          ...aiResult,
          id: data.id
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error screening tenant:', error);
      return { data: null, error };
    }
  };

  const getScreeningResults = async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('screening_results')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error fetching screening results:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    tenants,
    loading,
    addTenant,
    updateTenant,
    deleteTenant,
    screenTenantAI,
    getScreeningResults,
    refetch: fetchTenants,
  };
}