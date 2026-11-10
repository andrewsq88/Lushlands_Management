import type { LiveCollection } from './liveCollection';
import { errorText, pushErrorToast } from './toast';

const chains = new WeakMap<object, Map<string, Promise<unknown>>>();

type WriteResult<T> = {
  data: T | null;
  error: unknown;
};

export function commitOptimistic<T extends { id: string }>(
  collection: LiveCollection<T>,
  id: string,
  updates: Partial<T>,
  write: () => Promise<WriteResult<T>>,
  fallback: string,
): Promise<WriteResult<T>> {
  let queued = chains.get(collection);
  if (!queued) {
    queued = new Map();
    chains.set(collection, queued);
  }

  const previousRun = queued.get(id);
  const run = previousRun
    ? previousRun.catch(() => undefined).then(() => applyOptimistic(collection, id, updates, write, fallback))
    : applyOptimistic(collection, id, updates, write, fallback);

  queued.set(id, run);
  void run.finally(() => {
    if (queued.get(id) === run) queued.delete(id);
  });
  return run;
}

async function applyOptimistic<T extends { id: string }>(
  collection: LiveCollection<T>,
  id: string,
  updates: Partial<T>,
  write: () => Promise<WriteResult<T>>,
  fallback: string,
): Promise<WriteResult<T>> {
  const previous = collection.getById(id);
  if (!previous) {
    try {
      const result = await write();
      if (result.error || !result.data) {
        const error = result.error ?? new Error(fallback);
        console.error(fallback, error);
        pushErrorToast(errorText(error, fallback));
        return { data: null, error };
      }
      collection.upsert(result.data);
      return { data: result.data, error: null };
    } catch (error) {
      console.error(fallback, error);
      pushErrorToast(errorText(error, fallback));
      return { data: null, error };
    }
  }

  collection.beginWrite();
  collection.patch(id, updates);
  try {
    const result = await write();
    if (result.error || !result.data) {
      collection.restore(id, previous);
      const error = result.error ?? new Error(fallback);
      console.error(fallback, error);
      pushErrorToast(errorText(error, fallback));
      return { data: null, error };
    }
    collection.upsert(result.data);
    return { data: result.data, error: null };
  } catch (error) {
    collection.restore(id, previous);
    console.error(fallback, error);
    pushErrorToast(errorText(error, fallback));
    return { data: null, error };
  } finally {
    collection.endWrite();
  }
}
