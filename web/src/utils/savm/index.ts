import wasmBinaryUrl from "#wasm/saw.wasm?url";
import sawJsUrl from "#wasm/saw.js?url";

import createSawModule from "#wasm/saw.js";
import type { RXMessage, TXMessage } from "../message";


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
        return;
    }
  }
});


(async () => {
  await startup;

  const module = await createSawModule({
    locateFile(path) {
      if (path.endsWith(".wasm")) return wasmBinaryUrl;
      return path;
    },
    mainScriptUrlOrBlob: sawJsUrl
  });

})()