import type { Message } from "./types";
import { executeTask } from "./executor";
import { startWatcher } from "./watcher";

let queue = Promise.resolve();

self.onmessage = (msg: MessageEvent<Message>) => {
  const data = msg.data;
  queue = queue.then(() => executeTask(data));
};

startWatcher();