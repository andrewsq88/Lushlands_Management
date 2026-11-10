export type WriteCall = {
  table: string;
  op: 'update' | 'insert' | 'delete';
  payload: unknown;
  filters: Record<string, unknown>;
};

type WriteResult = { data: unknown; error: unknown };

export let handleWrite: (call: WriteCall) => WriteResult | Promise<WriteResult> = () => ({
  data: null,
  error: { message: 'unhandled write' },
});

export function setHandleWrite(next: typeof handleWrite) {
  handleWrite = next;
}

export function resetSupabaseMock() {
  handleWrite = () => ({
    data: null,
    error: { message: 'unhandled write' },
  });
}

function builder(table: string, op: 'select' | 'update' | 'insert' | 'delete', payload?: unknown) {
  const filters: Record<string, unknown> = {};
  const result = op === 'select'
    ? Promise.resolve({ data: [] as unknown[], error: null })
    : Promise.resolve().then(() => handleWrite({ table, op, payload, filters }));

  const api = {
    select: () => api,
    eq: (column: string, value: unknown) => {
      filters[column] = value;
      return api;
    },
    order: () => api,
    limit: () => api,
    in: () => api,
    single: () => result,
    maybeSingle: () => result,
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => result.then(resolve, reject),
  };
  return api;
}

function channel() {
  const api = {
    on: () => api,
    subscribe: (callback?: (status: string) => void) => {
      callback?.('SUBSCRIBED');
      return api;
    },
  };
  return api;
}

export const supabase = {
  from(table: string) {
    return {
      select: () => builder(table, 'select'),
      insert: (payload: unknown) => builder(table, 'insert', payload),
      update: (payload: unknown) => builder(table, 'update', payload),
      delete: () => builder(table, 'delete'),
    };
  },
  channel,
  removeChannel() {
    return Promise.resolve('ok');
  },
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
};
