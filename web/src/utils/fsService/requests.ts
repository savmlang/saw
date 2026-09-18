import type { Entries } from "../fs/types";
import { sendWorkerCmd } from "./worker";

export async function requestRm(dir: string, toRemove: string, rf: boolean): Promise<void> {
  return sendWorkerCmd<void>(
    {
      type: "cmd",
      cmd: "rm",
      dir,
      rf,
      toRemove,
      token: 0
    },
    (out, resolve) => {
      if (out.type === "out" && out.cmd === "rm") {
        resolve();
      }
    }
  );
}

export async function requestExists(dir: string): Promise<boolean> {
  return sendWorkerCmd<boolean>(
    {
      type: "cmd",
      cmd: "dirExists",
      dir,
      token: 0
    },
    (out, resolve) => {
      if (out.type === "out" && out.cmd === "dirExists") {
        resolve(out.exists);
      }
    }
  );
}

export async function requestLs(dir: string): Promise<Entries> {
  return sendWorkerCmd<Entries>(
    {
      type: "cmd",
      cmd: "ls",
      dir,
      token: 0
    },
    (out, resolve) => {
      if (out.type === "out" && out.cmd === "ls") {
        resolve(out.entries);
      }
    }
  );
}
