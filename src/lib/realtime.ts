import { supabase } from './supabase';

type Channel = {
  on: (
    event: 'postgres_changes',
    filter: { event: string; schema: string; table: string },
    callback: () => void,
  ) => Channel;
  subscribe: (callback: (status: string) => void) => Channel;
};

type RealtimeClient = {
  channel: (name: string) => Channel;
  removeChannel: (channel: Channel) => void;
};

const retains = new Map<string, { stop: () => void; count: number }>();

/**
 * Cross-tab updates arrive only after the channel is SUBSCRIBED.
 * Until public.<table> is in the supabase_realtime publication, that
 * status never arrives and these events stay ignored.
 */
export function subscribeToTable(
  table: string,
  onChange: () => void,
  client: RealtimeClient = supabase as unknown as RealtimeClient,
) {
  let live = false;
  const channel = client
    .channel(`live-${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      if (!live) return;
      onChange();
    })
    .subscribe((status) => {
      live = status === 'SUBSCRIBED';
    });

  return () => {
    live = false;
    client.removeChannel(channel);
  };
}

export function retainRealtime(table: string, onChange: () => void) {
  let entry = retains.get(table);
  if (!entry) {
    entry = { stop: subscribeToTable(table, onChange), count: 0 };
    retains.set(table, entry);
  }
  entry.count += 1;
  return () => {
    const current = retains.get(table);
    if (!current) return;
    current.count -= 1;
    if (current.count <= 0) {
      current.stop();
      retains.delete(table);
    }
  };
}

export function resetRealtimeForTests() {
  for (const entry of retains.values()) entry.stop();
  retains.clear();
}
