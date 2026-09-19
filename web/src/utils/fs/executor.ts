import type {
  CmdMessage,
  CmdName,
  CmdResultMap,
  Message,
  Response
} from "./types";
import { dirnmap } from "./state";
import { dirHandle, ls } from "./opfs";
import { delay } from "./watcher";

export type CommandHandler<K extends CmdName> = (
  cmd: CmdMessage<K>
) => Promise<CmdResultMap[K]> | CmdResultMap[K];

export type CommandHandlers = {
  [K in CmdName]: CommandHandler<K>;
};

export const commandHandlers: CommandHandlers = {
  async ls(data) {
    const handle = await dirHandle(data.dir);
    const entries = await ls(handle);
    return { entries };
  },

  async rm(data) {
    const handle = await dirHandle(data.dir);
    await handle.removeEntry(data.toRemove, { recursive: data.rf });
  },

  async dirExists(data) {
    let exists = true;
    try {
      await dirHandle(data.dir, false);
    } catch {
      exists = false;
    }
    return { exists };
  },

  async mkdir(data) {
    const dir = await dirHandle(data.dir, true);

    await dir.getDirectoryHandle(data.dirName, { create: true });
  }
};

let knowsReady = false;

(async () => {
  while (!knowsReady) {
    self.postMessage({
      type: "ready"
    } as Response);

    await delay(100);
  }
})()

async function handleCommand(data: CmdMessage): Promise<void> {
  const { token, cmd } = data;
  try {
    const handler = commandHandlers[cmd] as (
      msg: CmdMessage
    ) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void;

    if (!handler) {
      throw new Error(`Unknown command: ${cmd}`);
    }

    const result = await handler(data);

    self.postMessage({
      type: "out",
      cmd,
      token,
      ...(result && typeof result === "object" ? result : {})
    } as Response);
  } catch (e) {
    self.postMessage({
      type: "err",
      token,
      msg: "An error had occured"
    } as Response);

    console.error(`Error \`cmd\` [${cmd}]:`, e);
  }
}

export type ActionType = Message["type"];
export type ActionHandler<T extends ActionType> = (
  data: Extract<Message, { type: T }>
) => Promise<void> | void;

export type ActionHandlers = {
  [K in ActionType]: ActionHandler<K>;
};

export const actionHandlers: ActionHandlers = {
  async register(data) {
    dirnmap.set(data.hwnd, {
      hwnd: await dirHandle(data.dir, false),
      old: undefined
    });
  },

  unregister(data) {
    dirnmap.delete(data.hwnd);
  },

  async cmd(data) {
    await handleCommand(data);
  },

  ok() {
    knowsReady = true;
  }
};

export async function executeTask(data: Message): Promise<void> {
  try {
    const handler = actionHandlers[data.type] as (msg: Message) => Promise<void> | void;
    if (!handler) {
      console.error(`Unknown action type: ${(data as any).type}`);
      return;
    }

    await handler(data);
  } catch (e) {
    console.error(`Error processing action "${data.type}":`, e);
  }
}
