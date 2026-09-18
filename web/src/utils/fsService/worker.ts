import type { CbFn, Message, Response, TransientCb } from "../fs/types";
import FsWorker from "../fs/index?worker";

export const fsWorker = new FsWorker({
  name: "fsworker"
});

let counter = 0;
let outcounter = 0;
export const cbmap: Map<number, CbFn> = new Map();
export const outerr: Map<number, TransientCb> = new Map();

export const registerWorker = (directory: string, cb: CbFn): number => {
  counter += 1;
  cbmap.set(counter, cb);

  fsWorker.postMessage({
    type: "register",
    dir: directory,
    hwnd: counter
  } as Message);

  return counter;
};

export const unregister = (hwnd: number): void => {
  cbmap.delete(hwnd);
  fsWorker.postMessage({
    type: "unregister",
    hwnd
  } as Message);
};

export function registerOut(msg: Message, cb: TransientCb): number {
  outcounter += 1;
  outerr.set(outcounter, cb);

  fsWorker.postMessage({
    ...msg,
    token: outcounter
  } as Message);

  return outcounter;
}

fsWorker.onmessage = (msg: MessageEvent<Response>) => {
  const data = msg.data;

  if (data.type === "watch") {
    const cb = cbmap.get(data.hwnd);
    if (cb) cb(data.entries);
  } else {
    const cb = outerr.get(data.token);

    if (cb) {
      outerr.delete(data.token);
      cb(data);
    }
  }
};

export function sendWorkerCmd<T>(
  msg: Message,
  handler: (out: Response, resolve: (val: T) => void, reject: (reason?: any) => void) => void,
  timeoutMs = 1000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let suc = false;
    const ctr = registerOut(msg, (out) => {
      suc = true;
      if (out.type === "err") {
        reject(out.msg);
      } else {
        handler(out, resolve, reject);
      }
    });

    setTimeout(() => {
      if (!suc) {
        outerr.delete(ctr);
        reject("Timed out. Please try again!");
      }
    }, timeoutMs);
  });
}
