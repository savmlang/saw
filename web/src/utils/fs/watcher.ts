import type { Response } from "./types";

import { isEqual } from "lodash";
import { dirnmap } from "./state";
import { ls } from "./opfs";

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let cold = false;
let currentDelay = 100;

const MIN_DELAY = 100;
const MAX_DELAY = 5000;
const BACKOFF_FACTOR = 1.25;
async function scheduleNextPoll(hasMutated: boolean) {
  if (hasMutated) {
    if (cold) {
      self.postMessage({
        type: "hot"
      } as Response);
      cold = false;
    }

    currentDelay = MIN_DELAY;
  } else {
    currentDelay = Math.min(currentDelay * BACKOFF_FACTOR, MAX_DELAY);

    if (currentDelay > 1500 && !cold) {
      cold = true;
      self.postMessage({
        type: "cold"
      } as Response);
    }
  }

  await delay(currentDelay);
}

export async function startWatcher(): Promise<void> {
  while (true) {
    let hasMutated = false;

    const iterators = Array.from(dirnmap.entries());

    await Promise.allSettled(
      iterators.map(
        async (entry) => {
          const [hwnd, dirn] = entry;
          const { hwnd: dir, old } = dirn;

          const dirEntries = await ls(dir);
          if (!isEqual(old, dirEntries)) {
            hasMutated = true;

            dirn.old = dirEntries;
            self.postMessage({
              type: "watch",
              entries: dirEntries,
              hwnd
            } as Response);
          }
        }
      )
    );

    // Ensures we do not run into churn
    await scheduleNextPoll(hasMutated);
  }
}
