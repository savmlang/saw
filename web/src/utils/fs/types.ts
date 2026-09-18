export interface Entry {
  name: string;
  kind: "dir" | "file";
}

export type Entries = Entry[];

export type CbFn = (entry: Entries) => void;

/**
 * Mapping of command names to their input payload shapes.
 */
export interface CmdPayloadMap {
  ls: { dir: string };
  rm: { dir: string; toRemove: string; rf: boolean };
  dirExists: { dir: string };
}

/**
 * Mapping of command names to their output result shapes.
 */
export interface CmdResultMap {
  ls: { entries: Entries };
  rm: void;
  dirExists: { exists: boolean };
}

export type CmdName = keyof CmdPayloadMap;

export type CmdMessage<K extends CmdName = CmdName> = K extends CmdName
  ? { type: "cmd"; cmd: K; token: number } & CmdPayloadMap[K]
  : never;

export type RegisterMessage = {
  type: "register";
  dir: string;
  hwnd: number;
};

export type UnregisterMessage = {
  type: "unregister";
  hwnd: number;
};

export type Message = RegisterMessage | UnregisterMessage | CmdMessage;

export type WatchResponse = {
  type: "watch";
  hwnd: number;
  entries: Entries;
};

export type ErrResponse = {
  type: "err";
  token: number;
  msg: string;
};

export type OutResponse<K extends CmdName = CmdName> = K extends CmdName
  ? CmdResultMap[K] extends void
    ? { type: "out"; cmd: K; token: number }
    : { type: "out"; cmd: K; token: number } & CmdResultMap[K]
  : never;

export type Response = WatchResponse | ErrResponse | OutResponse;

export type TransientCb = (out: Response) => void;