import type { Terminal } from "@xterm/xterm";
import { savmWasmRuntime } from "../wasm";
import type { TXMessage } from "../message";

export function sasm(__: string, ___: string[], term: Terminal) {
  return new Promise((resolve) => {
    savmWasmRuntime.procTerm = () => {
      term.writeln("");
      resolve(null);
    };

    savmWasmRuntime.worker.postMessage({
      type: "sasm",
      binarydir: "bin",
      distdir: "dist"
    } as TXMessage);
  });
}