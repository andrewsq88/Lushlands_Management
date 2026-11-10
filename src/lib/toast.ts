type Listener = () => void;

export type ToastItem = {
  id: number;
  message: string;
};

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();
const timers = new Set<ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const toastStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return toasts;
  },
};

export function pushErrorToast(message: string) {
  const id = nextId;
  nextId += 1;
  toasts = [...toasts, { id, message }];
  emit();
  const timer = setTimeout(() => {
    timers.delete(timer);
    toasts = toasts.filter((toast) => toast.id !== id);
    emit();
  }, 5000);
  timers.add(timer);
}

export function resetToastsForTests() {
  for (const timer of timers) clearTimeout(timer);
  timers.clear();
  toasts = [];
  emit();
}

export function errorText(error: unknown, fallback: string) {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  if (!message || message === fallback) return fallback;
  return `${fallback} ${message}`;
}
