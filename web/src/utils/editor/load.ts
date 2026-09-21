import type { RefObject } from "react";

export async function loadMonaco(
  editorDiv: RefObject<HTMLDivElement | null>
) {
  const [, { editor }] = await Promise.all([
    import("./offload"),
    import("monaco-editor")
  ]);

  const rules = {
    rules: [],
    colors: {
      // #00000000 sets editor background to 100% transparent
      'editor.background': '#00000000',
      'minimap.background': '#00000000',
    }
  };

  editor.defineTheme('dark', {
    base: 'vs-dark',
    inherit: true,
    ...rules,
  });

  editor.defineTheme('light', {
    base: 'vs',
    inherit: true,
    ...rules,
  });

  const monacoInstance = editor.create(editorDiv.current!, {
    automaticLayout: true,
    wordWrap: "on",
    model: null,

    useTabStops: false,

    hover: {
      enabled: 'on',
      above: false,
    },
    parameterHints: {
      enabled: true,
      cycle: true,
    },
    suggest: {
      localityBonus: true,
    },
  });

  return { monacoInstance, editor };
}