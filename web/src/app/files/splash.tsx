import { Button } from "#components/ui/button";
import { Skeleton } from "#components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";
import { FilePlus, FolderPlus } from "lucide-react";
import { Separator } from "#components/ui/separator";

export default function FileViewerSplash() {
  return <div className="w-full h-full flex flex-col justify-start text-start items-start p-2 gap-2">
    <div className="w-full text-sm text-foreground flex items-center justify-center gap-1">
      <span className="my-auto mr-auto">Files</span>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size={"icon-xs"}
              variant={"outline"}
              aria-label="New File"
              disabled
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
              disabled
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

    <Separator />

    <Skeleton
      className="w-full h-full"
    />
  </div>;
}