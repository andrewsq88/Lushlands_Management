type Listener = () => void;

export type FetchToken = {
  seq: number;
  epoch: number;
};

type Snapshot<T> = {
  items: T[];
  loading: boolean;
};

export type LiveCollection<T extends { id: string }> = {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => Snapshot<T>;
  getById: (id: string) => T | undefined;
  isLoaded: () => boolean;
  hasInflightWrites: () => boolean;
  markDirty: () => void;
  setDirtyFlush: (flush: () => void) => void;
  setLoading: (loading: boolean) => void;
  startFetch: () => FetchToken;
  replaceAll: (rows: T[], token?: FetchToken) => boolean;
  failFetch: (token: FetchToken) => void;
  beginWrite: () => void;
  endWrite: () => void;
  patch: (id: string, updates: Partial<T>) => void;
  restore: (id: string, previous: T) => void;
  upsert: (row: T) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export function createCollection<T extends { id: string }>(): LiveCollection<T> {
  let items: T[] = [];
  let loading = true;
  let loaded = false;
  let epoch = 0;
  let fetchSeq = 0;
  let inflightWrites = 0;
  let dirty = false;
  let onDirtyFlush: (() => void) | null = null;
  const pending = new Map<string, Partial<T>>();
  const listeners = new Set<Listener>();
  let snapshot: Snapshot<T> = { items, loading };

  function publish() {
    snapshot = { items, loading };
    listeners.forEach((listener) => listener());
  }

  function overlay(rows: T[]) {
    return rows.map((row) => {
      const extra = pending.get(row.id);
      return extra ? { ...row, ...extra } : row;
    });
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    getById(id) {
      return items.find((item) => item.id === id);
    },
    isLoaded() {
      return loaded;
    },
    hasInflightWrites() {
      return inflightWrites > 0;
    },
    markDirty() {
      dirty = true;
    },
    setDirtyFlush(flush) {
      onDirtyFlush = flush;
    },
    setLoading(next) {
      loading = next;
      publish();
    },
    startFetch() {
      fetchSeq += 1;
      return { seq: fetchSeq, epoch };
    },
    replaceAll(rows, token) {
      if (token && (token.seq !== fetchSeq || token.epoch !== epoch)) return false;
      items = overlay(rows);
      loaded = true;
      loading = false;
      publish();
      return true;
    },
    failFetch(token) {
      if (token.seq !== fetchSeq) return;
      loading = false;
      publish();
    },
    beginWrite() {
      inflightWrites += 1;
      if (loaded) epoch += 1;
    },
    endWrite() {
      inflightWrites = Math.max(0, inflightWrites - 1);
      if (inflightWrites === 0 && dirty) {
        dirty = false;
        onDirtyFlush?.();
      }
    },
    patch(id, updates) {
      const current = items.find((item) => item.id === id);
      if (!current) return;
      const next = {
        ...(pending.get(id) ?? {}),
        ...updates,
        updated_at: new Date().toISOString(),
      } as Partial<T>;
      pending.set(id, next);
      items = items.map((item) => (item.id === id ? { ...item, ...next } : item));
      publish();
    },
    restore(id, previous) {
      pending.delete(id);
      items = items.map((item) => (item.id === id ? previous : item));
      publish();
    },
    upsert(row) {
      pending.delete(row.id);
      if (loaded) epoch += 1;
      const exists = items.some((item) => item.id === row.id);
      items = exists ? items.map((item) => (item.id === row.id ? row : item)) : [row, ...items];
      loaded = true;
      loading = false;
      publish();
    },
    remove(id) {
      pending.delete(id);
      if (loaded) epoch += 1;
      items = items.filter((item) => item.id !== id);
      publish();
    },
    reset() {
      items = [];
      loading = true;
      loaded = false;
      epoch = 0;
      fetchSeq = 0;
      inflightWrites = 0;
      dirty = false;
      pending.clear();
      publish();
    },
  };
}

export function createLoader<T extends { id: string }>(
  collection: LiveCollection<T>,
  query: () => Promise<{ data: T[] | null; error: unknown }>,
  label: string,
) {
  let current: Promise<void> | null = null;

  return async function load(force = false) {
    if (!force && collection.isLoaded()) return;
    if (current && !force) return current;

    const token = collection.startFetch();
    if (!collection.isLoaded()) collection.setLoading(true);

    const run = (async () => {
      try {
        const { data, error } = await query();
        if (error) throw error;
        collection.replaceAll(data ?? [], token);
      } catch (error) {
        console.error(label, error);
        collection.failFetch(token);
      }
    })();

    current = run;
    try {
      await run;
    } finally {
      if (current === run) current = null;
    }
  };
}
