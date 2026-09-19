import { Separator } from "#components/ui/separator";
import { Fragment, useEffect, useRef, useState, type RefObject, } from "react";
import { requestMkdir, requestRm, requestTouch, useFsWorker } from "../../utils/fsService";
import { FileEntry, FillEntry } from "./entry";
import type { Entries } from "../../utils/fs/types";
import type { ActiveRef, Callback, FileKind, RefNode, } from "./types";
import { toast } from "sonner";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "#components/ui/context-menu";
import { ExpandIcon, FilePlus2, FolderPlusIcon, ShrinkIcon, TrashIcon } from "lucide-react";

interface Props {
  name: string;
  path: string[];
  activeRef: ActiveRef;

  sparse?: ActiveRef;
}

export function DirContaier({ activeRef, name, path, sparse }: Props) {
  const [expanded, setExpanded] = useState(!!sparse);

  const dirPath = path.length != 0 ? [...path, name] : [''];
  const state = useFsWorker(dirPath.join("/"), expanded);

  const [kind, setKind] = useState<"dir" | "file" | undefined>(undefined);
  const node = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nodeObj = node.current!;
    return () => {
      // oxlint-disable-next-line react-hooks/exhaustive-deps
      if (activeRef.current?.node == nodeObj) {
        activeRef.current = null;
      }
    }
  }, [activeRef]);

  const cb = (folder: boolean) => {
    setExpanded(true);
    setKind(folder ? "dir" : "file");
  };
  const trigger = useRef(cb);
  trigger.current = cb;

  const list = <DirectoryListing
    process={(form) => {
      if (form) {
        const input = form.querySelector("input")!;

        const val = input.value;

        if (kind == 'dir') {
          toast.promise(requestMkdir(dirPath.join("/"), val), {
            position: "bottom-right",
            loading: "Creating directory...",
            success: "Created",
            error: (err) => `An error occured: ${err}`
          });
        } else {
          toast.promise(requestTouch(dirPath.join("/"), val), {
            position: "bottom-right",
            loading: "Creating file...",
            success: "Created",
            error: (err) => `An error occured: ${err}`
          });
        }
      }

      setKind(undefined);
    }}
    trigger={trigger}
    refNode={node}
    kind={kind}
    activeRef={activeRef}
    entries={state}
    dirPath={dirPath}
  />;

  if (sparse) {
    sparse.current = {
      node: node.current!,
      trigger
    };
    return list;
  }
  return <div ref={node} className="w-full">
    <ContextMenu>
      <ContextMenuTrigger
        render={<FileEntry
          name={name}
          kind="dir"
          expanded={expanded}
          loading={expanded && state === 'loading'}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((e) => !e);
            activeRef.current = {
              node: node.current!,
              trigger
            };
          }}
        />}
      />

      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Folder</ContextMenuLabel>

          <ContextMenuItem
            onClick={() => setExpanded((e) => !e)}
          >
            {!expanded ? <ExpandIcon /> : <ShrinkIcon />}
            {!expanded ? "Expand" : "Collapse"}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => {
              trigger.current!(true);
            }}
          >
            <FolderPlusIcon />
            New Sub Folder
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => {
              trigger.current!(false);
            }}
          >
            <FilePlus2 />
            New Sub File
          </ContextMenuItem>
        </ContextMenuGroup>

        <ContextMenuSeparator />

        <ContextMenuGroup>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem
            variant="destructive"
            className='text-destructive! hover:text-foreground! bg-destructive/20!'
            onClick={() => {
              toast.promise(requestRm(path.join("/"), name, true), {
                position: "bottom-right",
                loading: "Deleting directory...",
                success: "Deleted",
                error: (err) => `An error occured: ${err}`
              });
            }}
          >
            <TrashIcon />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>

    {expanded && <div className="flex w-full pl-3 gap-0.5">
      <Separator orientation="vertical" />

      <div className="w-full flex flex-col">
        {list}
      </div>
    </div>}
  </div>;
}

export function DirectoryListing({ process, trigger, refNode, kind, activeRef, dirPath, entries }: { process?: (e?: HTMLFormElement) => void, trigger: RefObject<Callback>, refNode: RefNode, kind?: FileKind, activeRef: ActiveRef, dirPath: string[], entries: Entries | 'loading' }) {

  return <Fragment>
    {kind
      &&
      <FillEntry
        kind={kind}
        cancel={() => process && process()}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (process) process(e.target);
        }}
      />
    }

    {
      entries !== 'loading' && entries.map((val) => {
        const key = val.name + val.kind;

        if (val.kind == 'file') {
          return <FileEntry
            key={key}
            kind={guessKind(val.name)}
            name={val.name}
            loading={false}
            onClick={(e) => {
              e.stopPropagation();
              if (refNode.current) {
                activeRef.current = {
                  node: refNode.current!,
                  trigger
                };
              } else {
                activeRef.current = null;
              }
            }}
          />
        }

        return <DirContaier activeRef={activeRef} key={key} name={val.name} path={dirPath} />
      })
    }
  </Fragment>;
}

const guessKind = (name: string) => {
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

  for (const category of tkns) {
    if (category.ends.some((s) =>
      typeof (s) == 'string' ? name.endsWith(s) : s.test(name)
    )) {
      return category.kind
    }
  }

  return "file"
};