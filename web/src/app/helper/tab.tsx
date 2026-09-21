import { XIcon } from "lucide-react";

import { Button } from "#components/ui/button";
import { Tooltip, TooltipTrigger } from "#components/ui/tooltip";
import { Icon } from "../files/entry";
import { guessKind } from "../files/types";
import { Separator } from "#components/ui/separator";
import { useAppCtx } from "../../utils/editor";

import type { Model } from "../../utils/editor/model";

interface Props {
  model: Model;
}

export function Tab({ model }: Props) {
  const modelMgr = useAppCtx().models;

  const name = model.uri.fsPath.split('\\').pop() || "unknown";

  const kind = guessKind(name);
  const active = (!(modelMgr.editor instanceof Set) && modelMgr.editor.getModel()) == model ? 'bg-accent border border-border ' : 'border border-transparent ';

  return <div
    className={active + "hover:bg-accent group shrink-0 cursor-pointer select-none min-w-18 max-w-32 w-fit h-6 text-sm flex rounded-md pl-1 text-center items-center"}
    onClick={(e) => {
      e.stopPropagation();

      modelMgr.setModelIfNotSet(model);
    }}
  >
    <Icon kind={kind} />
    <span className="truncate mx-1">{name}</span>

    <Separator aria-label="separator" orientation="vertical" className='bg-transparent group-hover:bg-card ml-auto' />

    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label="Close"
            variant='ghost'
            size='icon-xs'
            className='cursor-pointer'
            onClick={(e) => {
              e.stopPropagation();
              modelMgr.removeModel(model);
            }}
          >
            <XIcon />
          </Button>
        }
      />

    </Tooltip>
  </div>;
}