import { createContext, useContext, type RefObject } from "react";
import type { SaShell } from "../sash";
import type { editor } from "monaco-editor";
import type { ModelManager } from "./model";

interface AppCtx {
  xterm: RefObject<SaShell | null>,
  editorObj: RefObject<editor.IStandaloneCodeEditor | undefined>,

  models: ModelManager,
}

export const State = createContext<AppCtx>(undefined as unknown as AppCtx);

export function useEditorRef() {
  return useContext(State)?.editorObj;
}

export class EditorHandle {
  editor: editor.IStandaloneCodeEditor;
  model: ModelManager;

  constructor(state: AppCtx) {
    this.editor = state.editorObj.current!;
    this.model = state.models;
  }
}