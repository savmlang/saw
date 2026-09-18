import { Button } from "#components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";
import { FilePlus, FolderPlus } from "lucide-react";

export default function FileViewer() {
  return <div className="w-full h-full flex flex-col justify-start text-start items-start p-2">
    <div className="w-full text-sm text-foreground flex items-center justify-center gap-1">
      <span className="my-auto mr-auto">Files</span>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size={"icon-xs"}
              variant={"outline"}
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
  </div>;
}