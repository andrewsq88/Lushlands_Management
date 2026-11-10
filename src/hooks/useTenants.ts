import { useEffect, useSyncExternalStore } from 'react';
import { tenantsCollection } from '../lib/collections';
import type { Tenant } from '../lib/collections';
import { createLoader } from '../lib/liveCollection';
import { commitOptimistic } from '../lib/optimisticUpdate';
import { retainRealtime } from '../lib/realtime';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

const tenantSelect = `
  *,
  properties (
    address,
    type
  )
`;

const loadTenants = createLoader(
  tenantsCollection,
  async () => {
    const { data, error } = await supabase
      .from('tenants')
      .select(tenantSelect)
      .order('created_at', { ascending: false });
    return { data: data as Tenant[] | null, error };
  },
  'Error fetching tenants:',
);

tenantsCollection.setDirtyFlush(() => {
  void loadTenants(true);
});

function onTenantsChange() {
  if (tenantsCollection.hasInflightWrites()) {
    tenantsCollection.markDirty();
    return;
  }
  void loadTenants(true);
}

export function useTenants() {
  const { items: tenants, loading } = useSyncExternalStore(
    tenantsCollection.subscribe,
    tenantsCollection.getSnapshot,
    tenantsCollection.getSnapshot,
  );

  useEffect(() => {
    void loadTenants();
    return retainRealtime('tenants', onTenantsChange);
  }, []);

  const addTenant = async (tenant: Omit<TenantInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tenants')
        .insert([{ ...tenant, user_id: user.id }])
        .select(tenantSelect)
        .single();

      if (error) throw error;
      tenantsCollection.upsert(data as Tenant);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding tenant:', error);
      return { data: null, error };
    }
  };

  const updateTenant = (id: string, updates: TenantUpdate) => {
    return commitOptimistic(
      tenantsCollection,
      id,
      updates,
      async () => {
        const { data, error } = await supabase
          .from('tenants')
          .update(updates)
          .eq('id', id)
          .select(tenantSelect)
          .single();
        if (error || !data) return { data: null, error: error ?? new Error('Tenant update failed') };
        return { data: data as Tenant, error: null };
      },
      "Couldn't update the tenant. The previous value was restored.",
    );
  };

  const deleteTenant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      tenantsCollection.remove(id);
      return { error: null };
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return { error };
    }
  };

  const screenTenantAI = async (tenant: Tenant) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const user = session.user;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-screening`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantData: {
            name: tenant.name,
            email: tenant.email,
            income: tenant.income || 0,
            lease_start: tenant.lease_start || '',
            lease_end: tenant.lease_end || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to screen tenant');
      }

      const aiResult = await response.json();

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
          id: data.id,
        },
        error: null,
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

  return {
    tenants,
    loading,
    addTenant,
    updateTenant,
    deleteTenant,
    screenTenantAI,
    getScreeningResults,
    refetch: () => loadTenants(true),
  };
}
