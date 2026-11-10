import { describe, expect, it, vi } from 'vitest';

vi.mock('./supabase', () => ({
  supabase: {
    channel: () => {
      throw new Error('default client should not be used');
    },
    removeChannel: () => undefined,
  },
}));

import { subscribeToTable } from './realtime';

type Handler = () => void;

function fakeClient() {
  let postgres: Handler = () => undefined;
  let status: (next: string) => void = () => undefined;
  const channel = {
    on: (_event: 'postgres_changes', _filter: { event: string; schema: string; table: string }, callback: Handler) => {
      postgres = callback;
      return channel;
    },
    subscribe: (callback: (next: string) => void) => {
      status = callback;
      return channel;
    },
  };
  return {
    client: {
      channel: () => channel,
      removeChannel: vi.fn(),
    },
    emit() {
      postgres();
    },
    setStatus(next: string) {
      status(next);
    },
  };
}

describe('subscribeToTable', () => {
  it('ignores events until the channel is subscribed', () => {
    const fake = fakeClient();
    const changes: number[] = [];
    const stop = subscribeToTable('properties', () => changes.push(1), fake.client);

    fake.emit();
    fake.setStatus('CHANNEL_ERROR');
    fake.emit();
    fake.setStatus('TIMED_OUT');
    fake.emit();
    expect(changes).toEqual([]);

    fake.setStatus('SUBSCRIBED');
    fake.emit();
    expect(changes).toEqual([1]);

    stop();
    fake.emit();
    expect(changes).toEqual([1]);
    expect(fake.client.removeChannel).toHaveBeenCalled();
  });
});
