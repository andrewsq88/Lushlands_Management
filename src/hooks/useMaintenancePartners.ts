import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type MaintenancePartner = {
  id: string;
  business_name: string;
  description: string;
  business_type: string;
  phone?: string;
  email?: string;
  website_url?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  service_radius: number;
  hourly_rate?: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  availability_status: string;
  response_time_hours: number;
  logo_url?: string;
  created_at: string;
  updated_at: string;
};

export function useMaintenancePartners(country?: string, city?: string) {
  const [partners, setPartners] = useState<MaintenancePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('maintenance_partners')
        .select('*')
        .eq('is_verified', true)
        .order('rating', { ascending: false });

      if (country) {
        query = query.eq('country', country);
      }

      if (city) {
        query = query.eq('city', city);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPartners(data || []);
    } catch (err) {
      console.error('Error fetching maintenance partners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [country, city]);

  const getCountries = () => {
    const countries = [...new Set(partners.map(p => p.country))];
    return countries.sort();
  };

  const getCitiesByCountry = (selectedCountry: string) => {
    const cities = [...new Set(
      partners
        .filter(p => p.country === selectedCountry)
        .map(p => p.city)
    )];
    return cities.sort();
  };

  return {
    partners,
    loading,
    error,
    refetch: fetchPartners,
    getCountries,
    getCitiesByCountry,
  };
}
