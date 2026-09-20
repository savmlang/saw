import { NavBar } from "#components/app/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#components/ui/resizable";
import { lazy, Suspense, useRef } from "react";
import { Spinner } from "#components/ui/spinner";

import type { SaShell } from "../utils/sash";
import type { editor } from "monaco-editor";

import Editor from "./editor";
import FileViewerSplash from "./files/splash";
import { State } from "../utils/editor";
import { ModelManager } from "../utils/editor/model";

const TerminalView = lazy(() => import("./terminal"));
const EnhancedEditorView = lazy(() => import("./editorview"));
const FileView = lazy(() => import("./files/index"));


export default function App() {
  const xterm = useRef<SaShell | null>(null);
  const editorObj = useRef<editor.IStandaloneCodeEditor>(undefined);

  const state = {
    xterm,
    editorObj,
    models: new ModelManager()
  };

  return <State.Provider value={state}>
    <div className="flex flex-col w-full h-full overflow-hidden p-4 items-center text-center justify-center">
      <NavBar shell={xterm} />

      <ResizablePanelGroup className="h-full w-full mx-8 mt-2">
        <ResizablePanel minSize={"16rem"} defaultSize={"18rem"} maxSize={"20%"} className="h-full border border-border dark:bg-card/90 rounded-md overflow-none">
          <Suspense
            fallback={
              <FileViewerSplash />
            }>
            <FileView />
          </Suspense>
        </ResizablePanel>

        <ResizableHandle withHandle className="mx-2" />

        <ResizablePanel defaultSize={"75%"} className="h-full rounded-md flex">
          <Suspense
            fallback={
              <Editor loading />
            }>
            <EnhancedEditorView ref={editorObj} />
          </Suspense>
        </ResizablePanel>

        <ResizableHandle withHandle className="mx-2" />

        <ResizablePanel minSize={"20rem"} defaultSize={"35rem"} maxSize={"35%"} className="h-full bg-black dark:bg-card rounded-md items-start text-start justify-start p-4">
          <Suspense
            fallback={
              <LoadingSpinner text="Booting Terminal..." />
            }
          >
            <TerminalView ref={xterm} />
          </Suspense>
        </ResizablePanel>
      </ResizablePanelGroup>

    </div>
  </State.Provider>;
}

function LoadingSpinner({ text }: { text: string }) {
  return <div className="h-full w-full flex flex-col justify-center items-center text-center">
    <Spinner className="size-8 text-muted-foreground" />

    <h1 className="text-sm mt-4 text-muted-foreground">{text}</h1>
  </div>
}