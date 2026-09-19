import { Terminal } from "@xterm/xterm";

import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";
import { SaShell } from "../utils/sash";

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}

// const light = {
//   foreground: "black",
//   cursor: "black"
// };

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
      cursorBlink: true,
      fontFamily: "monospace",
      fontSize: 14,

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
      term.dispose();
      xterm.current = null;
    };
  }, [xterm]);

  return <div id="xterm" ref={containerRef} className="w-full h-full overflow-hidden min-h-0 min-w-0"></div>;
}