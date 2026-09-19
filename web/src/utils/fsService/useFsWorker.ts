import type { Entries } from "../fs/types";
import { useSyncExternalStore, useCallback, useRef } from "react";
import { registerWorker, unregister } from "./worker";

export function useFsWorker(directory: string, active: boolean): Entries | 'loading' {
  const storeRef = useRef<{ dir: string; data: Entries | undefined }>({
    dir: directory,
    data: undefined,
  });

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!active) return () => { };

      const hwnd = registerWorker(directory, (data) => {
        if (storeRef.current.dir === directory) {
          storeRef.current.data = data;
          onStoreChange();
        }
      });

      return () => {
        unregister(hwnd);
      };
    },
    [directory, active]
  );

  const getSnapshot = useCallback((): Entries | 'loading' => {
    if (!active || storeRef.current.dir !== directory) {
      storeRef.current = { dir: directory, data: undefined };
      return 'loading';
    }
    return storeRef.current.data ?? 'loading';
  }, [directory, active]);

  return useSyncExternalStore(subscribe, getSnapshot);
}