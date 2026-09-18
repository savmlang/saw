import editorWorker from 'monaco-editor/editor/editor.worker.js?worker';

// For Vite or bundlers supporting ?worker imports:
self.MonacoEnvironment = {
  async getWorker(_: unknown, label: string) {
    switch (label) {
      case 'json':
        const jsonWorker = (await import("monaco-editor/language/json/json.worker.js?worker")).default;
        return new jsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        const cssWorker = (await import("monaco-editor/language/css/css.worker.js?worker")).default;
        return new cssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        const htmlWorker = (await import("monaco-editor/language/html/html.worker.js?worker")).default;
        return new htmlWorker();
      case 'typescript':
      case 'javascript':
        const tsWorker = (await import("monaco-editor/language/typescript/ts.worker.js?worker")).default;
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
};