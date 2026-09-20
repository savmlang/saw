import { useEffect, useRef, useState, type RefObject } from "react"
import { editor } from "monaco-editor"
import { useTheme } from "../utils/theme";
import { Separator } from "#components/ui/separator";

import Editor from "./editor"

import "../utils/editor/offload";

editor.defineTheme('dark', {
  base: 'vs-dark', // can be 'vs', 'vs-dark', or 'hc-black'
  inherit: true,
  rules: [],
  colors: {
    // #00000000 sets editor background to 100% transparent
    'editor.background': '#00000000',
    'minimap.background': '#00000000',
  }
});

export default function EnhancedEditorView({ ref: editorObj }: { ref: RefObject<editor.IStandaloneCodeEditor | undefined> }) {
  const editorDiv = useRef<HTMLDivElement>(null);

  const [models] = useState([]);

  const theme = useTheme();
  useEffect(() => {
    editor.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const hwnd = requestIdleCallback(() => {
      editorObj.current = editor.create(editorDiv.current!, {
        automaticLayout: true,
        wordWrap: "on",
        model: null,
      });
    });

    return () => {
      cancelIdleCallback(hwnd);
      editorObj.current?.dispose();
    }
  }, [editorObj]);

  return <div className="w-full h-full flex flex-col gap-2">
    {models.length == 0 && <Editor loading={false} />}

    <div className={`w-full bg-gray-300 dark:bg-card/90 flex flex-col text-start justify-start rounded-md items-start overflow-hidden p-1 pb-1.5 h-14 ${models.length == 0 ? "hidden" : ""}`}>
      <div className="w-full h-12 overflow-y-hidden overflow-x-scroll scrollbar-small">

      </div>
    </div>

    <div className={`${models.length == 0 ? "hidden" : ""} w-full px-2`}>
      <Separator />
    </div>

    <div className={`${models.length == 0 ? "hidden" : ""} overflow-x-hidden bg-gray-300 dark:bg-card/90 w-full h-full flex items-start justify-start text-start rounded-md p-2`}>
      <div className="w-full h-full" ref={editorDiv}></div>
    </div>
  </div>
}