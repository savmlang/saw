import type { FileKind } from "./types";

import { ChevronRight } from "lucide-react";

import { LuBinary } from "react-icons/lu";
import { FcFolder, FcOpenedFolder } from "react-icons/fc";
import { BsTypescript, BsJavascript, BsFileEarmarkBinaryFill, BsFileEarmarkFill, BsFileEarmarkTextFill } from "react-icons/bs";

import { useMemo, type ComponentPropsWithoutRef, type Ref } from "react";
import { Spinner } from "#components/ui/spinner";

export function FileEntry({ name, kind, loading, expanded, ...props }: ComponentPropsWithoutRef<'button'> & { loading: boolean, name: string, kind: FileKind, expanded?: boolean }) {
  const IconData = useMemo(() => Icon({ kind, expanded }), [kind, expanded]);

  return <button {...props} className="cursor-pointer h-6 max-h-6 text-xs rounded-md w-full hover:bg-border/80 dark:hover:bg-border flex text-center items-center px-1 gap-0.5">
    {
      loading ?
        <Spinner className="size-3 max-w-3 min-w-3 mx-0.5" />
        :
        kind == 'dir' ?
          <ChevronRight className={`size-4 transition-all ${expanded ? "rotate-90" : ""}`} />
          :
          <div className="w-4 min-w-4 max-w-4" />
    }

    <section className="mr-1">{IconData}</section>

    <span className="truncate">{name}</span>
  </button>
}

export function FillEntry({ kind, ref, cancel, ...props }: ComponentPropsWithoutRef<'form'> & { cancel: () => void, kind: FileKind, ref?: Ref<HTMLFormElement | null> }) {
  const IconData = useMemo(() => Icon({ kind, expanded: false }), [kind]);

  return <form ref={ref} {...props} className="h-6 max-h-6 text-xs rounded-md w-full hover:bg-border/80 dark:hover:bg-border flex text-center items-center px-1 gap-0.5">
    <div className="w-4" />

    <section className="mr-1">{IconData}</section>

    <input
      autoFocus={true}
      minLength={1}
      maxLength={30}
      autoCorrect="false"
      autoCapitalize="false"
      autoSave="false"
      autoComplete="false"
      inputMode="text"
      className="w-[75%]"
      pattern={
        "^(?!(\\.|\\.\\.)$)[\\-A-Za-z0-9._]+$"
      }
      onBlur={() =>
        cancel()
      }
      onKeyDown={(e) => {
        if (e.key == 'Escape') {
          e.preventDefault();

          cancel();
        }
      }}
      required
    />
  </form>
}


export function Icon({ kind, expanded }: { kind: FileKind, expanded?: boolean }) {
  switch (kind) {
    case "dir":
      return expanded ? <FcOpenedFolder aria-label="Dir" className="size-4 min-w-4 max-w-4" /> : <FcFolder aria-label="Dir" className="size-4 min-w-4 max-w-4" />;
    case "bin":
      return <LuBinary aria-label="Bin" className="p-[0.5px] rounded-sm border border-red-800 dark:border-red-400 size-4 min-w-4 max-w-4 text-red-800 dark:text-red-400" />
    case "sasm":
      return <BsFileEarmarkBinaryFill aria-label="Sasm" className="size-4 min-w-4 max-w-4 text-red-800 dark:text-red-400" />
    case "textfile":
      return <BsFileEarmarkTextFill aria-label="Text" className="size-4 min-w-4 max-w-4 text-zinc-500 dark:text-inherit" />;
    case "js":
      return <BsJavascript aria-label="JS" className="size-4 min-w-4 max-w-4 rounded-xs text-yellow-600 dark:text-[#F7DF1E]" />;
    case "ts":
      return <BsTypescript aria-label="TS" className="size-4 min-w-4 max-w-4 rounded-xs text-[#3178C6]" />;
    default:
      return <BsFileEarmarkFill aria-label="File" className="size-4 min-w-4 max-w-4 text-zinc-500 dark:text-inherit" />;
  }
}