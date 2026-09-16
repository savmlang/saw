import wasmBinaryUrl from "#wasm/saw.wasm?url";
import sawJsUrl from "#wasm/saw.js?url";

import createSawModule from "#wasm/saw.js";
import { DeliveryVan } from "./queue";

import type { RXMessage, TXMessage } from "../message";
import { js_fs_mkdir, js_fs_read, js_fs_readdir, js_fs_write } from "./fs";
import { allocator } from "./allocator";


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
    const content = (new TextEncoder().encode(out)).buffer;

    // @ts-ignore
    self.postMessage({ type: "terminal.write", content } as RXMessage, [content]);
  },
  locateFile(path: string) {
    if (path.endsWith(".wasm")) return wasmBinaryUrl;
    return path;
  },
  mainScriptUrlOrBlob: sawJsUrl,

  js_fs_write,
  js_fs_mkdir,
  js_fs_readdir,
  js_fs_read,
});

allocator.setModule(module);

van.on((event) => {

});