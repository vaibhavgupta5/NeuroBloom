"use client";

import { useEffect } from "react";

export default function SmoothScroll({ children }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let instance;
    (async () => {
      try {
        const LocomotiveScroll = (await import("locomotive-scroll")).default;
        instance = new LocomotiveScroll({
          lenisOptions: {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.1,
            duration: 1.2,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            normalizeWheel: true,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://easings.net
          }
        });
      } catch (error) {
        console.error("Locomotive Scroll initialization failed", error);
      }
    })();
    return () => instance?.destroy();
  }, []);

  return <>{children}</>;
}
