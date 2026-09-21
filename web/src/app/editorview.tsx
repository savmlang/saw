import { Fragment, useEffect, type Ref } from "react"
import { useTheme } from "../utils/theme";
import { Separator } from "#components/ui/separator";

import Editor from "./editor"

import { useAppCtx } from "../utils/editor";
import { useIsMonacoMounted, useMonacoModels } from "../utils/editor/model";
import { Tab } from "./helper/tab";

export default function EnhancedEditorView({ ref }: { ref: Ref<HTMLDivElement | null> }) {
  const appCtx = useAppCtx();

  const modelMgr = appCtx.models;
  const [, models] = useMonacoModels(modelMgr);
  const init = useIsMonacoMounted(modelMgr);

  // Set theme of editor
  const theme = useTheme();
  useEffect(() => {
    modelMgr.setTheme(theme);
  }, [theme, modelMgr]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return <div className="w-full h-full flex flex-col gap-2">
    {models.length == 0 ?
      <Editor loading={false} />
      :
      init ? <></> : <Editor loading={true} text="Booting editor" />
    }

    {(models.length != 0 && init) &&
      <>
        <div className={`w-full border border-zinc-300 dark:border-border dark:bg-card flex flex-col text-start justify-start rounded-md items-start overflow-hidden p-1 pb-0 h-9 ${models.length == 0 ? "hidden" : ""}`}>
          <div
            className="w-full h-full flex gap-1 overflow-y-hidden overflow-x-scroll scrollbar-small shrink-0"
            onWheel={handleWheel}
          >
            {models.map((model) => <Fragment key={model.uri.toString()}>
              <Tab model={model} />
            </Fragment>)}
          </div>
        </div>

        <div className={`w-full px-2`}>
          <Separator />
        </div>
      </>
    }

    <div className={`${(models.length != 0 && init) ? "" : "hidden!"} border border-zinc-300 dark:border-border overflow-x-hidden dark:bg-card w-full h-full flex items-start justify-start text-start rounded-md p-2`}>
      <div className="w-full h-full" ref={ref}></div>
    </div>
  </div>
}