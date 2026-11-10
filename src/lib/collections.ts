import { createCollection } from './liveCollection';
import { resetRealtimeForTests } from './realtime';
import { resetToastsForTests } from './toast';
import type { Database } from './supabase';

export type Property = Database['public']['Tables']['properties']['Row'];

export type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'] & {
  tenants: { name: string; email: string } | null;
  properties: { address: string; type: string } | null;
};

export type Tenant = Database['public']['Tables']['tenants']['Row'] & {
  properties: { address: string; type: string } | null;
};

export type Payment = Database['public']['Tables']['payments']['Row'] & {
  tenants: {
    name: string;
    email: string;
    properties: { address: string } | null;
  } | null;
};

export const propertiesCollection = createCollection<Property>();
export const maintenanceCollection = createCollection<MaintenanceRequest>();
export const tenantsCollection = createCollection<Tenant>();
export const paymentsCollection = createCollection<Payment>();

export function resetLiveDataForTests() {
  propertiesCollection.reset();
  maintenanceCollection.reset();
  tenantsCollection.reset();
  paymentsCollection.reset();
  resetRealtimeForTests();
  resetToastsForTests();
}
