import { useCallback, useSyncExternalStore } from "react";
import type { RXMessage, TXMessage } from "./message";
import workerUri from "./savm/index?url"

export type Status = "restarting" | "starting" | "error" | "running";

export class WasmRuntime {
  public worker: Worker = new Worker(workerUri, { type: "module", name: "ahqrtrt" });

  public status: Listenable<Status> = new Listenable("starting" as Status);

  constructor() {
    this.runWorker();
  }

  private runWorker() {
    (async () => {

      while (true) {
        this.status.data = "starting";
        this.worker.onmessage = (msg: MessageEvent<RXMessage>) => {
          const ev = msg.data;

          switch (ev.type) {
            case "started":
              this.status.data = "running";
              return;
            default:
              return;
          }
        }

        const errPromise = new Promise((resolve) => {
          this.worker.onerror = () => {
            this.status.data = "error";

            setTimeout(() => {
              this.status.data = "restarting";
              this.worker.terminate();

              this.worker = new Worker(workerUri, { type: "module", name: "ahqrtrt" });
              resolve(null);
            }, 1000);
          }
        });

        this.worker.postMessage({
          type: "start"
        } as TXMessage);

        await errPromise;
      }
    })();
  }
}

export class Listenable<T> {
  private value: T;

  private counter = 0;
  private events: Map<number, (v: T) => void> = new Map();

  constructor(def: T) {
    this.value = def;
  }

  public get data(): T {
    return this.value;
  }

  public set data(v: T) {
    this.value = v;
    this.events.forEach((val) => val(v));
  }

  register(cb: (v: T) => void): number {
    const idx = this.counter;
    this.events.set(idx, cb);
    this.counter++;

    return idx;
  }

  unregister(idx: number) {
    this.events.delete(idx);
  }
}

export function useWasmState(runtime: WasmRuntime): Status {
  const subscribe = useCallback((callback: () => void) => {
    const id = runtime.status.register(() => callback());
    return (() => {
      runtime.status.unregister(id);
    });
  }, [runtime]);

  const get = useCallback(() => {
    return runtime.status.data;
  }, [runtime]);

  return useSyncExternalStore(
    subscribe,
    get,
  );
}

export const savmWasmRuntime = new WasmRuntime();