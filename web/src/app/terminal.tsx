import { Terminal } from "@xterm/xterm";
import { Unicode11Addon } from '@xterm/addon-unicode11';
import { CanvasAddon } from '@xterm/addon-canvas';
import { FitAddon } from "@xterm/addon-fit";

import { useEffect, useRef } from "react";
import { SaShell } from "../utils/sash";

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}

const dark = {
  foreground: "white",
  cursor: "white"
};

export default function TerminalView({ ref: xterm }: { ref: React.RefObject<SaShell | null> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const term = new Terminal({
      fontFamily: [
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Noto Color Emoji"',
        'monospace'
      ].join(', '),
      lineHeight: 1.2,
      cursorBlink: true,
      fontSize: 14,

      allowProposedApi: true,
      allowTransparency: true,

      theme: {
        background: "transparent",
        ...(
          dark
        )
      }
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const canvasAddon = new CanvasAddon();
    term.loadAddon(canvasAddon);

    const uc11 = new Unicode11Addon();
    term.loadAddon(uc11);

    term.unicode.activeVersion = '11';

    term.open(containerRef.current);

    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    const resizeObserver = new ResizeObserver(() => {
      if (
        containerRef.current &&
        containerRef.current.clientWidth > 0 &&
        containerRef.current.clientHeight > 0
      ) {
        fitAddon.fit();
      }
    });

    resizeObserver.observe(containerRef.current);
    const sashell = new SaShell(term);

    xterm.current = sashell;

    sashell.launch();

    return () => {
      resizeObserver.disconnect();
      uc11.dispose();
      canvasAddon.dispose();
      term.dispose();
      xterm.current = null;
    };
  }, [xterm]);

  return <div id="xterm" ref={containerRef} className="w-full h-full overflow-hidden min-h-0 min-w-0"></div>;
}