import { Suspense, useEffect, useState, type ReactNode } from "react";

export function LazySuspense({ fallback, children }: {
  fallback: ReactNode,
  children: ReactNode
}) {
  const [shouldMount, setShouldMount] = useState(false);

  // Inside LazySuspense activation:
  const activateWhenTrulyIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback((deadline) => {
        if (deadline.timeRemaining() > 30) {
          setShouldMount(true);
        } else {
          window.requestIdleCallback(() => setShouldMount(true));
        }
      }, { timeout: 3000 });
    } else {
      setTimeout(() => setShouldMount(true), 200);
    }
  };

  useEffect(() => { activateWhenTrulyIdle() }, []);

  if (!shouldMount) return fallback;
  return <Suspense fallback={fallback}>
    {children}
  </Suspense>;
}