import wasmBinaryUrl from "../../../public/savm/saw.wasm?url";
import sawJsUrl from "../../../public/savm/saw.js?url";

import createSawModule from "../../../public/savm/saw.js";
import { DeliveryVan } from "./queue";

import type { RXMessage, TXMessage } from "../message";
import { allocator } from "./allocator";
import { runSasm } from "./sasm";


self.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  throw event.reason;
});

const van = new DeliveryVan<TXMessage>();

const startup = new Promise((resolve) => {
  self.onmessage = (msg: MessageEvent<TXMessage>) => {
    const ev = msg.data;

    switch (ev.type) {
      case "start":
        self.postMessage({
          type: "started"
        } as RXMessage);
        resolve(null);
        return
      default:
        van.emit(ev);
        return;
    }
  }
});


await startup;

const module = await createSawModule({
  print: (out: string) => {
    const content = (new TextEncoder().encode(out));

    // @ts-ignore
    self.postMessage({ type: "terminal.write", content } as RXMessage, [content.buffer]);
  },
  printErr: (out: string) => {
    const content = (new TextEncoder().encode(out));

    // @ts-ignore
    self.postMessage({ type: "terminal.write", content } as RXMessage, [content.buffer]);
  },
  locateFile(path: string) {
    if (path.endsWith(".wasm")) return wasmBinaryUrl;
    return path;
  },
  mainScriptUrlOrBlob: sawJsUrl,
});

allocator.setModule(module);

van.on((event) => {
  procExecAsync(async () => {
    switch (event.type) {
      case "start":
        return
      case "sasm":
        await runSasm(module, event.binarydir, event.distdir);
        break;
      default:
        break;
    }
  });

});

async function procExecAsync<T>(
  cb: () => Promise<T>
): Promise<T> {
  try {
    return await cb();
  }
  finally {
    allocator.unsafe_clear();
    self.postMessage({
      type: "process.exit"
    } as RXMessage);
  }
}