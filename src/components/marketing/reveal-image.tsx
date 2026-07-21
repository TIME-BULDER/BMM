"use client";

import Image from "next/image";
import { useState } from "react";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealImageProps = {
  src: string;
  alt: string;
  /** Ratio CSS appliqué au cadre, ex. "4 / 3". */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  /** Délai avant la révélation, en ms. */
  delay?: number;
  priority?: boolean;
  sizes?: string;
};

/**
 * Image qui se révèle au défilement avec un fondu, un léger zoom et un
 * dé-flou - la même grammaire d'animation que les visuels de Spaceship.
 * S'appuie sur next/image pour l'optimisation et le lazy-loading.
 */
export function RevealImage({
  src,
  alt,
  ratio = "4 / 3",
  className,
  imgClassName,
  delay = 0,
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 90vw",
}: RevealImageProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const shown = inView && loaded;

  return (
    <div
      ref={ref}
      style={{ aspectRatio: ratio }}
      className={cn(
        "bg-muted relative overflow-hidden rounded-2xl border shadow-lg",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        data-shown={shown}
        style={{ transitionDelay: `${delay}ms` }}
        className={cn("img-reveal object-cover", imgClassName)}
      />
    </div>
  );
}
