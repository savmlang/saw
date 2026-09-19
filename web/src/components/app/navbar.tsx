import { Button } from "#components/ui/button";
import { ButtonGroup } from "#components/ui/button-group";
import { BsThreeDots } from "react-icons/bs"
import { CiCircleQuestion } from "react-icons/ci"
import { BiPaint } from "react-icons/bi"
import { updateToggleTheme } from "../../utils/theme";

import type { SaShell } from "../../utils/sash";
import type { RefObject } from "react";
import { Spinner } from "#components/ui/spinner";
import { Badge } from "#components/ui/badge";

import { savmWasmRuntime, useWasmState } from "../../utils/wasm";
import { LeafyGreenIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";

export function NavBar({ shell }: { shell: RefObject<SaShell | null> }) {
  const status = useWasmState(savmWasmRuntime);

  return <div className="w-full mx-8 p-2 h-14 flex gap-2 border border-border bg-accent dark:bg-card/90 rounded-md">
    <ButtonGroup>
      <Button
        className={"h-10 w-24"}
        variant={"default"}
        onClick={() => {
          shell.current?.askPrompt.forcePrompt("sasm")
        }}
      >
        Run
      </Button>
      <Button
        className={"size-10"}
        variant={"secondary"}
        aria-label="More Options"
      >
        <BsThreeDots />
      </Button>
    </ButtonGroup>

    <Badge
      className={"ml-auto h-7 flex text-center justfify-center items-center"}
      variant={"outline"}
    >
      {
        status !== "running" ?
          <Spinner className="size-4" /> :
          <LeafyGreenIcon className="size-4 text-green-800 dark:text-green-500" />
      }
      {
        status === "running" ? "SaVM is running" : status[0].toUpperCase() + status.slice(1) + " SaVM"}
    </Badge>

    <Button
      className={"h-10"}
      variant={"outline"}
      onClick={() => {
        updateToggleTheme();
      }}
    >
      <BiPaint className="size-4" />
      Theme
    </Button>

    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className={"size-10"}
            variant={"outline"}
            aria-label="Help"
          >
            <CiCircleQuestion className="size-6" />
          </Button>
        }
      />
      <TooltipContent>Help</TooltipContent>
    </Tooltip>

  </div>;
}