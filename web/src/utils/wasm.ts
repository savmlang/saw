import { useCallback, useSyncExternalStore } from "react";
import type { RXMessage, TXMessage } from "./message";
import workerUri from "./savm/index?url"
import type { Terminal } from "@xterm/xterm";

export type Status = "restarting" | "starting" | "error" | "running";

export class WasmRuntime {
  public worker: Worker = new Worker(workerUri, { type: "module" });

  public status: Listenable<Status> = new Listenable("starting" as Status);

  private terminal: Terminal | undefined;
  public procTerm: (() => void) | undefined;

  constructor() {
    this.runWorker();
  }

  attachTerminal(term: Terminal) {
    this.terminal = term;
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
            case "terminal.write":
              if (this.terminal) {
                this.terminal.write(ev.content);
              }
              return;
            case "process.exit":
              if (this.procTerm) {
                this.procTerm();
                this.procTerm = undefined;
              }
              return;
            default:
              return;
          }
        }

        const errPromise = new Promise((resolve) => {
          this.worker.onerror = () => {
            this.status.data = "error";

            if (this.procTerm) {
              this.procTerm();
              this.procTerm = undefined;
            }

            setTimeout(() => {
              console.log("Restarting");
              this.status.data = "restarting";
              this.worker.terminate();

              this.worker = new Worker(workerUri, { type: "module" });

              resolve(null);
            }, 1000);
          }
        });

        console.log("Sent Start Response");
        setTimeout(() => {
          this.worker.postMessage({
            type: "start"
          } as TXMessage);
        }, 2000);

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