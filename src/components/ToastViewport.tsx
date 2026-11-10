import { useSyncExternalStore } from 'react';
import { toastStore } from '../lib/toast';

export function ToastViewport() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2" aria-live="assertive">
      {toasts.map((toast) => (
        <div key={toast.id} role="alert" className="rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
