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
import { MobileView } from "./mobile";
import { useMediaQuery } from "../utils/media";

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

  const fileview = <Suspense
    fallback={
      <FileViewerSplash />
    }>
    <FileView />
  </Suspense>;

  const editor = <Suspense
    fallback={
      <Editor loading />
    }>
    <EnhancedEditorView ref={editorObj} />
  </Suspense>;

  const terminal = <Suspense
    fallback={
      <LoadingSpinner text="Booting Terminal..." />
    }
  >
    <TerminalView ref={xterm} />
  </Suspense>;

  const desktop = useMediaQuery("(min-width: 768px)");

  if (!desktop) return <State.Provider value={state}>
    <MobileView xterm={xterm} editor={editor} files={fileview} terminal={terminal} />
  </State.Provider>;

  return <State.Provider value={state}>
    <div className="flex flex-col w-full h-full overflow-hidden p-4 items-center text-center justify-center">
      <NavBar shell={xterm} />

      <ResizablePanelGroup className="h-full w-full mx-8 mt-2">
        <ResizablePanel minSize={"16rem"} defaultSize={"18rem"} maxSize={"20%"} className="h-full border border-border dark:bg-card/90 rounded-md overflow-none">
          {fileview}
        </ResizablePanel>

        <ResizableHandle withHandle className="mx-2" />

        <ResizablePanel defaultSize={"75%"} className="h-full rounded-md flex">
          {editor}
        </ResizablePanel>

        <ResizableHandle withHandle className="mx-2" />

        <ResizablePanel minSize={"20rem"} defaultSize={"35rem"} maxSize={"35%"} className="h-full border border-border bg-zinc-900 dark:bg-card rounded-md items-start text-start justify-start p-4">
          {terminal}
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