import { Separator } from "#components/ui/separator";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "#components/ui/context-menu";

import { Fragment, useEffect, useRef, useState, type RefObject, } from "react";
import { requestMkdir, requestRm, requestTouch, useFsWorker } from "../../utils/fsService";
import { FileEntry, Icon, FillEntry } from "./entry";

import type { Entries } from "../../utils/fs/types";
import { guessKind, type ActiveRef, type Callback, type FileKind, type RefNode, } from "./types";

import { toast } from "sonner";
import { ExpandIcon, FilePlus2, FolderPlusIcon, ShrinkIcon, TrashIcon } from "lucide-react";
import { useAppCtx } from "../../utils/editor";

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
  const modelMgr = useAppCtx().models;

  const deleteFile = (name: string) => toast.promise(requestRm(dirPath.join("/"), name, false), {
    position: "bottom-right",
    loading: "Deleting file...",
    success: "Deleted",
    error: (err) => `An error occured: ${err}`
  });

  const openEditor = (dir: string[], file: string) => {
    const id = file + dir.join('/');
    toast.promise(modelMgr.createModel(dir, file), {
      id,
      position: "bottom-right",
      loading: "Launching editor instance",
      success: () => {
        requestAnimationFrame(() => {
          toast.dismiss(id);
        });
      },
      dismissible: true,
      error: (err) => `An error occured: ${err}`,
    })
  };

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
          const kind = guessKind(val.name);

          return <ContextMenu key={key}>
            <ContextMenuTrigger
              render={
                <FileEntry
                  kind={kind}
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

                    openEditor(dirPath, val.name);
                  }}
                />
              }
            />
            <ContextMenuContent>
              <ContextMenuGroup>
                <ContextMenuLabel>File</ContextMenuLabel>

                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditor(dirPath, val.name);
                  }}
                >
                  <Icon kind={kind} expanded />
                  Open in editor
                </ContextMenuItem>
              </ContextMenuGroup>

              <ContextMenuGroup>
                <ContextMenuLabel>Actions</ContextMenuLabel>

                <ContextMenuItem
                  variant="destructive"
                  className='text-destructive! hover:text-foreground! bg-destructive/20!'
                  onClick={() =>
                    deleteFile(val.name)
                  }
                >
                  <TrashIcon />

                  Delete
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenu>;
        }

        return <DirContaier activeRef={activeRef} key={key} name={val.name} path={dirPath} />
      })
    }
  </Fragment>;
}

