import { describe, expect, it, vi } from 'vitest';
import { createCollection } from './liveCollection';
import { commitOptimistic } from './optimisticUpdate';
import { resetToastsForTests, toastStore } from './toast';

type Row = { id: string; status: string; updated_at: string };

function listen<T extends { id: string }>(collection: ReturnType<typeof createCollection<T>>) {
  const seen: T[][] = [];
  const stop = collection.subscribe(() => {
    seen.push(collection.getSnapshot().items);
  });
  return { seen, stop };
}

describe('commitOptimistic', () => {
  it('updates every subscriber immediately, then keeps the saved row', async () => {
    const collection = createCollection<Row>();
    collection.replaceAll([{ id: '1', status: 'vacant', updated_at: '2026-01-01T00:00:00.000Z' }]);
    const first = listen(collection);
    const second = listen(collection);

    let release: (value: { data: Row | null; error: unknown }) => void = () => undefined;
    const pending = commitOptimistic(
      collection,
      '1',
      { status: 'occupied' },
      () => new Promise((resolve) => {
        release = resolve;
      }),
      'Could not save.',
    );

    expect(collection.getById('1')?.status).toBe('occupied');
    expect(first.seen.at(-1)?.[0].status).toBe('occupied');
    expect(second.seen.at(-1)?.[0].status).toBe('occupied');

    release({
      data: { id: '1', status: 'occupied', updated_at: '2026-02-01T00:00:00.000Z' },
      error: null,
    });
    await pending;

    expect(collection.getById('1')).toMatchObject({ status: 'occupied', updated_at: '2026-02-01T00:00:00.000Z' });
    first.stop();
    second.stop();
  });

  it('restores the previous value and shows an error when the write fails', async () => {
    resetToastsForTests();
    const collection = createCollection<Row>();
    collection.replaceAll([{ id: '1', status: 'vacant', updated_at: '2026-01-01T00:00:00.000Z' }]);

    const result = await commitOptimistic(
      collection,
      '1',
      { status: 'maintenance' },
      async () => ({ data: null, error: { message: 'permission denied' } }),
      'Could not save.',
    );

    expect(result.error).toBeTruthy();
    expect(collection.getById('1')?.status).toBe('vacant');
    expect(toastStore.getSnapshot()[0]?.message).toMatch(/Could not save/);
    expect(toastStore.getSnapshot()[0]?.message).toMatch(/permission denied/);
    resetToastsForTests();
  });

  it('can switch through every status and back', async () => {
    const collection = createCollection<Row>();
    collection.replaceAll([{ id: '1', status: 'vacant', updated_at: '2026-01-01T00:00:00.000Z' }]);
    const statuses = ['occupied', 'maintenance', 'vacant'];

    for (const status of statuses) {
      await commitOptimistic(
        collection,
        '1',
        { status },
        async () => ({ data: { id: '1', status, updated_at: '2026-03-01T00:00:00.000Z' }, error: null }),
        'Could not save.',
      );
      expect(collection.getById('1')?.status).toBe(status);
    }
  });

  it('does not let a stale reload wipe an in-flight edit', async () => {
    const collection = createCollection<Row>();
    const original = { id: '1', status: 'vacant', updated_at: '2026-01-01T00:00:00.000Z' };
    collection.replaceAll([original, { id: '2', status: 'occupied', updated_at: '2026-01-01T00:00:00.000Z' }]);
    const token = collection.startFetch();

    let release: (value: { data: Row | null; error: unknown }) => void = () => undefined;
    const pending = commitOptimistic(
      collection,
      '1',
      { status: 'maintenance' },
      () => new Promise((resolve) => {
        release = resolve;
      }),
      'Could not save.',
    );

    const applied = collection.replaceAll(
      [
        { id: '1', status: 'vacant', updated_at: '2026-01-01T00:00:00.000Z' },
        { id: '2', status: 'occupied', updated_at: '2026-01-01T00:00:00.000Z' },
      ],
      token,
    );
    expect(applied).toBe(false);
    expect(collection.getById('1')?.status).toBe('maintenance');
    expect(collection.getSnapshot().items).toHaveLength(2);

    release({ data: { id: '1', status: 'maintenance', updated_at: '2026-04-01T00:00:00.000Z' }, error: null });
    await pending;
    expect(collection.getById('1')?.status).toBe('maintenance');
    expect(collection.getById('2')?.status).toBe('occupied');
    vi.restoreAllMocks();
  });
});
