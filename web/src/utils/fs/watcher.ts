import { isEqual } from "lodash";
import type { Response } from "./types";
import { dirnmap } from "./state";
import { ls } from "./opfs";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function startWatcher(): Promise<void> {
  while (true) {
    for (const [hwnd, dirn] of dirnmap.entries()) {
      const { hwnd: dir, old } = dirn;

      const dirEntries = await ls(dir);

      if (!isEqual(old, dirEntries)) {
        dirn.old = dirEntries;
        self.postMessage({
          type: "watch",
          entries: dirEntries,
          hwnd
        } as Response);
      }
    }

    // Ensures we do not run into churn
    if (dirnmap.size === 0) {
      await delay(100);
    } else {
      await delay(10);
    }
  }
}
