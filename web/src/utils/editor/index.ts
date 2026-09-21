import { createContext, useContext, type RefObject } from "react";

import type { SaShell } from "../sash";
import type { ModelManager } from "./model";

export interface AppCtx {
  xterm: RefObject<SaShell | null>,
  editorDiv: RefObject<HTMLDivElement | null>,

  models: ModelManager,
}

export const State = createContext<AppCtx>(undefined as unknown as AppCtx);

export function useAppCtx() {
  return useContext(State);
}

export class MonacoHandle {
  model: ModelManager;

  constructor(state: AppCtx) {
    this.model = state.models;
  }
}