import type { Uri, editor as Editor } from "monaco-editor";
import type { AppCtx } from ".";

import { useRef, useSyncExternalStore, type RefObject } from "react";
import { delay, requestCat, requestTouch } from "../fsService";

export type CodeEditor = Editor.IStandaloneCodeEditor;
export type Model = Editor.ITextModel;
export type ModelMap = Set<Model>;
export type ModelMapCallback<T> = (_: ModelMap) => T;

export interface Task {
  dirName: string;
  fileName: string;
  content: ArrayBuffer;
}

export class ModelManager {
  models: Set<Model> = new Set();
  listeners: Set<(_: ModelMap) => void> = new Set();

  parse: (_: string) => Uri = undefined as unknown as (_: string) => Uri;
  editor: Editor.IStandaloneCodeEditor | Set<() => void> = new Set();
  monaco: typeof Editor | Promise<void> | undefined = undefined;

  ctx: AppCtx = undefined as unknown as AppCtx;
  theme: string = "dark";

  taskQueue: Map<Model, Task> = new Map();

  constructor() {
    this.taskQueueHandler();
  }

  async taskQueueHandler() {
    while (true) {
      const tasks = Array.from(this.taskQueue.values()).map(
        (item) => requestTouch(item.dirName, item.fileName, item.content)
      );
      this.taskQueue.clear();

      tasks.push(delay(200));
      await Promise.allSettled(tasks);
    }
  }

  registerCtx(ctx: AppCtx) {
    this.ctx = ctx;
  }

  // Send a notice that models have mutated!
  private mutateModels() {
    this.listeners.forEach((d) => d(this.models))
  }

  listen(cb: ModelMapCallback<void>) {
    this.listeners.add(cb);
  }
  unlisten(cb: ModelMapCallback<void>) {
    this.listeners.delete(cb);
  }
  setTheme(theme: string) {
    this.theme = theme;

    if (this.monaco && !(this.monaco instanceof Promise)) {
      this.monaco.setTheme(theme);
    }
  }

  setModelIfNotSet(model: Model | null) {
    if (!(this.editor instanceof Set)) {
      if (this.editor.getModel() != model) {
        this.editor.setModel(model);
        this.mutateModels();
      }
    }
  }

  async createModel(
    dirName: string[],
    fileName: string
  ): Promise<void> {
    if (!this.monaco) {
      this.monaco = (async () => {
        const {
          editor, monacoInstance, parse
        } = await (await import("./load")).loadMonaco(this.ctx.editorDiv);


        this.parse = parse;
        this.addEditor(monacoInstance, editor);
      })();
    }

    const path = [...dirName, fileName];

    if (this.monaco instanceof Promise) {
      try {
        await this.monaco;
      } catch {
        await delay(100);
        this.monaco = undefined;
        return this.createModel(dirName, fileName);
      }
    }

    const monaco = this.monaco as typeof Editor;

    if (!this.monaco || !this.editor) {
      return;
    }

    const dir = dirName.join('/');

    const url = path.join("/");
    const uri = this.parse(`file://${url}`);

    const model = monaco.getModel(uri) ?? monaco.createModel(
      new TextDecoder().decode(await requestCat(dir, fileName)),
      undefined,
      uri
    );
    model.onDidChangeContent(() => {
      const text = model.getValue();
      const content = (new TextEncoder().encode(text)).buffer;

      this.taskQueue.set(model, {
        fileName,
        dirName: dir,
        content
      });
    });
    this.models.add(model);
    this.setModelIfNotSet(model);
    this.mutateModels();
  }

  async removeModel(
    model: Model
  ) {
    if (this.editor instanceof Set) {
      return;
    }

    if (this.models.has(model)) {
      model.dispose();
      this.models.delete(model);
      if (this.editor.getModel() == model) {
        this.editor.setModel(null);
      }

      this.mutateModels();
    }
  }

  private addEditor(editor: Editor.IStandaloneCodeEditor, monaco: typeof Editor) {
    if (this.editor instanceof Set) {
      this.editor.forEach((d) => d());
    } else {
      this.editor.dispose();
    }
    this.editor = editor;
    this.monaco = monaco;

    this.monaco.setTheme(this.theme);
    this.editor.setModel(null);
  }
}

export function useIsMonacoMounted(mgr: ModelManager) {
  const value = useRef(false);
  return useSyncExternalStore(
    (onChange) => {
      const handler = () => {
        value.current = true;
        onChange();
      };
      if (mgr.editor instanceof Set) {
        mgr.editor.add(handler);
      } else {
        value.current = true;
        onChange();
      }

      return () => {
        if (mgr.editor instanceof Set) {
          mgr.editor.delete(handler);
        }
      }
    },
    () => value.current
  );

}

export function useMonacoModels(mgr: ModelManager): [RefObject<Model[]>, Model[]] {
  const value = useRef(Array.from(mgr.models));

  const store = useSyncExternalStore(
    (onChange) => {
      const handler = (models: ModelMap) => {
        value.current = Array.from(models);
        onChange();
      };
      mgr.listen(handler);

      return () => {
        mgr.unlisten(handler);
      };
    },
    () => value.current
  );

  return [value, store];
}