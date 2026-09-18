import type { Terminal } from "@xterm/xterm";
import { savmWasmRuntime } from "../wasm";
import type { TXMessage } from "../message";
import type { Context } from ".";

export function sasm({ shell }: Context, ___: string[], term: Terminal) {
  return new Promise((resolve) => {
    savmWasmRuntime.procTerm = () => {
      term.writeln("");
      resolve(null);
    };

    savmWasmRuntime.worker.postMessage({
      type: "sasm",
      binarydir: shell.getLeafForCwd("bin"),
      distdir: shell.getLeafForCwd("dist")
    } as TXMessage);
  });
}