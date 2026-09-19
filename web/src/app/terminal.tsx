import { useEffect, useRef } from "react";
import { SaShell } from "../utils/sash";

import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import type { CanvasAddon } from "@xterm/addon-canvas";
import type { Unicode11Addon } from "@xterm/addon-unicode11";

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

    const view = containerRef.current;

    let mounted = true;

    let term: Terminal | undefined;
    let fitAddon: FitAddon | undefined;
    let canvasAddon: CanvasAddon | undefined;
    let uc11: Unicode11Addon | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let sashell: SaShell | undefined;
    (async () => {
      const [
        { Terminal },
        { FitAddon },
        { CanvasAddon },
        { Unicode11Addon },
      ] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
        import("@xterm/addon-canvas"),
        import("@xterm/addon-unicode11"),
        import("@xterm/xterm/css/xterm.css"),
      ]);

      if (mounted) await scheduler.yield();
      if (mounted) term = new Terminal({
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

      if (mounted) await scheduler.yield();
      if (mounted) fitAddon = new FitAddon();
      if (mounted) await scheduler.yield();
      if (mounted) canvasAddon = new CanvasAddon();
      if (mounted) await scheduler.yield();
      if (mounted) uc11 = new Unicode11Addon();

      if (mounted) await scheduler.yield();
      if (mounted) term!.loadAddon(fitAddon!);
      if (mounted) await scheduler.yield();
      if (mounted) term!.loadAddon(canvasAddon!);
      if (mounted) await scheduler.yield();
      if (mounted) term!.loadAddon(uc11!);

      if (mounted) await scheduler.yield();
      if (mounted) term!.unicode.activeVersion = '11';
      if (mounted) term!.open(view);

      if (mounted) await scheduler.yield();
      if (mounted) requestAnimationFrame(() => {
        fitAddon!.fit();
      });

      if (mounted) await scheduler.yield();
      if (mounted) resizeObserver = new ResizeObserver(() => {
        if (
          containerRef.current &&
          containerRef.current.clientWidth > 0 &&
          containerRef.current.clientHeight > 0
        ) {
          fitAddon!.fit();
        }
      });

      if (mounted) await scheduler.yield();
      if (mounted) resizeObserver!.observe(view);
      if (mounted) sashell = new SaShell(term!);

      if (mounted) await scheduler.yield();
      if (mounted) xterm.current = sashell!;

      if (mounted) await scheduler.yield();
      if (mounted) sashell!.launch();
    })();

    return () => {
      mounted = false;

      resizeObserver?.disconnect();
      uc11?.dispose();
      canvasAddon?.dispose();

      term?.dispose();

      xterm.current = null;
    };
  }, [xterm]);

  return <div id="xterm" ref={containerRef} className="w-full h-full overflow-hidden min-h-0 min-w-0"></div>;
}