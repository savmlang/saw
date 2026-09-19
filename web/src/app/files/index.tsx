import { Button } from "#components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";
import { FilePlus, FolderPlus, LeafyGreen } from "lucide-react";
import { Separator } from "#components/ui/separator";
import { DirectoryListing } from "./dirContainer";
import { useFsWorker } from "../../utils/fsService";
import { useHotness } from "../../utils/fsService/store";

export default function FileViewer() {
  const state = useFsWorker('', true);
  const hotState = useHotness();

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
            <p>Eco Mode</p>
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

    <div className="w-full h-full flex flex-col overflow-x-hidden scrollbar-small gap-0.5 text-start items-start justify-start">
      <DirectoryListing dirPath={[]} entries={state} />
    </div>
  </div>;
}