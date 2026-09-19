import type { Entries } from "./types";

export interface HwndData {
  hwnd: FileSystemDirectoryHandle;
  old?: Entries;
}

export const dirnmap: Map<number, HwndData> = new Map();
