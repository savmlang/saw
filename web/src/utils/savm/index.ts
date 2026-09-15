import wasmBinaryUrl from "#wasm/saw.wasm?url";
import sawJsUrl from "#wasm/saw.js?url";

import createSawModule from "#wasm/saw.js";
import type { RXMessage, TXMessage } from "../message";
import { DeliveryVan } from "./queue";


declare module "../../savm/saw.js" {
  export interface EmscriptenModuleOptions {
    print?: (text: string) => void;
    printErr?: (text: string) => void;
    noInitialRun?: boolean;
    noExitRuntime?: boolean;
    arguments?: string[];
    locateFile?: (url: string, scriptDirectory: string) => string;
    onRuntimeInitialized?: () => void;
    onAbort?: (what: any) => void;
  }

  // Overwrite the lazy (options?: unknown) signature
  export default function MainModuleFactory(
    options?: EmscriptenModuleOptions
  ): Promise<MainModule>;
}

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


(async () => {
  await startup;

  const module = await createSawModule({
    print: (out: string) => {
      const content = (new TextEncoder().encode(out)).buffer;

      // @ts-ignore
      self.postMessage({ type: "terminal.write", content } as RXMessage, [content]);
    },
    locateFile(path) {
      if (path.endsWith(".wasm")) return wasmBinaryUrl;
      return path;
    },
    mainScriptUrlOrBlob: sawJsUrl
  });

  van.on((event) => {

  });
})()