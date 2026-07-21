"use client";

import { useEffect, useState } from "react";

import { useInView } from "@/hooks/use-in-view";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Anime un nombre de 0 vers `target` lorsqu'il entre dans le viewport.
 * Désactivé si l'utilisateur préfère réduire les animations.
 */
export function useCountUp(target: number, duration = 1400) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const total = prefersReduced ? 0 : duration;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = total === 0 ? 1 : Math.min((now - start) / total, 1);
      setValue(Math.round(target * easeOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return { ref, value };
}
