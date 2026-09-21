import type { RefObject } from "react";

export type FileKind = "dir" | "sasm" | "bin" | "textfile" | "js" | "ts" | "file";
export type RefNode = RefObject<HTMLDivElement | null>;
export type ActiveRef = RefObject<ActiveState | null>;

export type Callback = (folder: boolean) => void;
export interface ActiveState {
  trigger: RefObject<Callback>;
  node: HTMLDivElement;
}

const tkns: { ends: (string | RegExp)[]; kind: FileKind; }[] = [
  {
    ends: [".js"],
    kind: "js"
  },
  {
    ends: [".ts"],
    kind: "ts"
  },
  {
    ends: [".bin", ".sabin", ".sbin", ".exe"],
    kind: "bin"
  },
  {
    ends: [".sasm"],
    kind: "sasm"
  },
  {
    ends: [/^.*\..*$/],
    kind: "textfile"
  }
];

export const guessKind = (name: string) => {
  for (const category of tkns) {
    if (category.ends.some((s) =>
      typeof s == 'string' ? name.endsWith(s) : s.test(name)
    )) {
      return category.kind
    }
  }

  return "file"
};