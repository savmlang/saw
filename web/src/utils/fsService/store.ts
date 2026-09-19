import { useSyncExternalStore } from 'react';

export let hot = true;

const listeners: Set<() => void> = new Set();
export function setHotness(hotness: boolean) {
  hot = hotness;

  listeners.forEach((f) => f());
}

export function useHotness() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);

      return () => {
        listeners.delete(notify);
      }
    },
    () => hot,
  );
}

