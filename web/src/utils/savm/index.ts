import wasmBinaryUrl from "#wasm/saw.wasm?url";
import sawJsUrl from "#wasm/saw.js?url";

import createSawModule from "#wasm/saw.js";
import { DeliveryVan } from "./queue";

import type { RXMessage, TXMessage } from "../message";
import { js_fs_mkdir, js_fs_read, js_fs_readdir, js_fs_write } from "./fs";
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

  imports: {
    env: {
      js_fs_write,
      js_fs_mkdir,
      js_fs_readdir,
      js_fs_read
    }
  },
});

allocator.setModule(module);

console.log("wasmMemory =", module.wasmMemory);
console.log("buffer =", module.wasmMemory?.buffer);
console.log("HEAPU8 =", module.HEAPU8);
console.log("HEAPU8.length =", module.HEAPU8?.length);
console.log("sa_malloc =", module._sa_malloc(8, 2));
console.log("_malloc_size =", module._malloc_size(8));
console.log("___libc_malloc =", module.___libc_malloc(8));

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
  }
}