import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Feedback = Database['public']['Tables']['feedback']['Row'];
type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (feedbackData: Omit<FeedbackInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feedback')
        .insert([{ ...feedbackData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setFeedback(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding feedback:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return {
    feedback,
    loading,
    addFeedback,
    refetch: fetchFeedback,
  };
}