import type { CbFn } from "../fs/types";
import { useEffect, useEffectEvent } from "react";
import { registerWorker, unregister } from "./worker";

export function useFsWorker(directory: string, cb: CbFn): void {
  const cbMemo = useEffectEvent(cb);

  useEffect(() => {
    const hwnd = registerWorker(directory, cbMemo);

    return () => {
      unregister(hwnd);
    };
  }, [directory]);
}
