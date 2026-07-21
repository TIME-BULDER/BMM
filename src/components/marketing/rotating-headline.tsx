"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type RotatingHeadlineProps = {
  words: string[];
  /** Durée d'affichage de chaque mot, en ms. */
  interval?: number;
  className?: string;
};

/**
 * Fait défiler une liste d'expressions en les permutant avec un fondu/glissé
 * vertical, dans l'esprit du hero de Spaceship. Respecte
 * `prefers-reduced-motion` (le premier mot reste alors fixe).
 */
export function RotatingHeadline({
  words,
  interval = 2600,
  className,
}: RotatingHeadlineProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (words.length <= 1) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const swap = window.setTimeout(() => setPhase("out"), interval);
    const next = window.setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setPhase("in");
    }, interval + 400);

    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(next);
    };
  }, [index, phase, words.length, interval]);

  // Réserve la largeur du mot le plus long pour éviter les sauts de mise en page.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-grid align-bottom">
      <span aria-hidden className="invisible whitespace-nowrap">
        {longest}
      </span>
      <span
        key={index}
        className={cn(
          "text-gradient col-start-1 row-start-1 whitespace-nowrap",
          phase === "in" ? "animate-word-in" : "animate-word-out",
          className,
        )}
      >
        {words[index]}
      </span>
    </span>
  );
}
