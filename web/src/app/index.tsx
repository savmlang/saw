import { NavBar } from "#components/app/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#components/ui/resizable";
import { lazy, Suspense, useRef } from "react";

import type { SaShell } from "../utils/sash";

import { Spinner } from "#components/ui/spinner";
import Editor from "./editor";

const TerminalView = lazy(() => import("./terminal"));

export default function App() {
  const xterm = useRef<SaShell | null>(null);

  return <div className="flex flex-col w-full h-full overflow-hidden p-4 items-center text-center justify-center">
    <NavBar shell={xterm} />

    <ResizablePanelGroup className="h-full w-full mx-8 mt-2">
      <ResizablePanel minSize={"12rem"} defaultSize={"14rem"} maxSize={"18rem"} className="h-full bg-gray-300 dark:bg-card/90 rounded-md">

      </ResizablePanel>

      <ResizableHandle withHandle className="mx-1" />

      <ResizablePanel defaultSize={"75%"} className="h-full bg-gray-300 dark:bg-card/90 rounded-md flex">
        <Editor loading={false} />
      </ResizablePanel>

      <ResizableHandle withHandle className="mx-4" />

      <ResizablePanel minSize={"40rem"} maxSize={"50%"} className="h-full bg-gray-300 dark:bg-card/90 rounded-md items-start text-start justify-start">
        <Suspense
          fallback={
            <div className="h-full w-full flex flex-col justify-center items-center text-center">
              <Spinner className="size-8" />
            </div>
          }
        >
          <TerminalView ref={xterm} />
        </Suspense>
      </ResizablePanel>
    </ResizablePanelGroup>

  </div>;
}

