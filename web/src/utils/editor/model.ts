import type { editor } from "monaco-editor";

export type Model = editor.ITextModel;
export type ModelMap = Map<number, Model>;
export type ModelMapCallback<T> = (_: ModelMap) => T;

export class ModelManager {
  models: Map<number, Model> = new Map();
  listeners: Set<(_: ModelMap) => void> = new Set();

  mutateModels(cb: ModelMapCallback<ModelMap>) {
    this.models = cb(this.models);
    this.listeners.forEach((d) => d(this.models))
  }

  listen(cb: ModelMapCallback<void>) {
    this.listeners.add(cb);
  }
}