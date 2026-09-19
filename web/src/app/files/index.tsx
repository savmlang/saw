import { Button } from "#components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";
import { FilePlus, FolderPlus, LeafyGreen } from "lucide-react";
import { Separator } from "#components/ui/separator";
import { DirContaier } from "./dirContainer";
import { useHotness } from "../../utils/fsService/store";
import { useRef } from "react";
import type { ActiveState } from "./types";

export default function FileViewer() {
  const activeObjRef = useRef<ActiveState | null>(null);
  const sparseObj = useRef<ActiveState | null>(null);
  const hotState = useHotness();

  const createItem = (file: boolean) => {
    const state = activeObjRef.current || sparseObj.current!;

    state.trigger.current!(!file);
  };

  return <div className="w-full h-full flex flex-col justify-start text-start items-start p-2 gap-2">
    <div className="w-full text-sm text-foreground flex items-center justify-center gap-1">
      <span className="my-auto mr-auto">Files</span>

      <div className={hotState ? "hidden" : ""}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size={"icon-xs"}
                variant={"ghost"}
                aria-label="Eco Mode"
                className="text-foreground/40"
              >
                <LeafyGreen />
              </Button>
            }
          />
          <TooltipContent>
            <p className="w-[25ch] text-center">Watching (idle). Changes may take up to 5s to appear.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size={"icon-xs"}
              variant={"outline"}
              className="cursor-pointer"
              aria-label="New File"

              onClick={() => createItem(true)}
            >
              <FilePlus />
            </Button>
          }
        />
        <TooltipContent>
          <p>New file at root</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size={"icon-xs"}
              variant={"outline"}
              aria-label="New Folder"
              className="cursor-pointer"

              onClick={() => createItem(false)}
            >
              <FolderPlus />
            </Button>
          }
        />
        <TooltipContent>
          <p>New folder at root</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <Separator />

    <div
      className="w-full h-full flex flex-col overflow-x-hidden scrollbar-small gap-0.5 text-start items-start justify-start"
      onClick={(e) => {
        e.stopPropagation();
        activeObjRef.current = null;
      }}
    >
      <DirContaier
        activeRef={activeObjRef}
        name=""
        path={[]}
        sparse={sparseObj}
      />
    </div>
  </div>;
}