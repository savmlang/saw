import type { RefObject } from "react";

export type FileKind = "dir" | "sasm" | "bin" | "textfile" | "js" | "ts" | "file";
export type RefNode = RefObject<HTMLDivElement | null>;
export type ActiveRef = RefObject<ActiveState | null>;

export type Callback = (folder: boolean) => void;
export interface ActiveState {
  trigger: RefObject<Callback>;
  node: HTMLDivElement;
}