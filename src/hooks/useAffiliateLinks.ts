import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type AffiliateLink = Database['public']['Tables']['affiliate_links']['Row'];

export function useAffiliateLinks(category?: string) {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAffiliateLinks = async () => {
    try {
      let query = supabase
        .from('affiliate_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAffiliateLinks(data || []);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateLinks();
  }, [category]);

  return {
    affiliateLinks,
    loading,
    refetch: fetchAffiliateLinks,
  };
}