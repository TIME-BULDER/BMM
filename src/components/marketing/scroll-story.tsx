"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Container } from "@/components/layout/container";

export type StoryPanel = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
};

/** Suit la préférence « animations réduites » sans casser le rendu serveur. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Lissage type smoothstep : démarrage et arrivée adoucis. */
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

/**
 * Sections plein écran empilées : le panneau actif est « épinglé » pendant le
 * défilement, puis le suivant se révèle par-dessus en fondu (sticky stacked
 * panels). La progression est lissée (inertie) pour un rendu premium, et
 * pilote l'opacité, le zoom et la parallaxe. Repli statique si l'utilisateur a
 * réduit les animations.
 */
export function ScrollStory({ panels }: { panels: StoryPanel[] }) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0); // de 0 à panels.length - 1
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const target = { value: 0 };
    let current = 0;
    let raf = 0;
    let running = false;

    const computeTarget = () => {
      const rect = el.getBoundingClientRect();
      const distance = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), distance);
      target.value =
        distance > 0 ? (scrolled / distance) * (panels.length - 1) : 0;
    };

    const tick = () => {
      // Inertie : on rapproche doucement la valeur affichée de la cible.
      current += (target.value - current) * 0.12;
      if (Math.abs(target.value - current) < 0.0006) {
        current = target.value;
        setProgress(current);
        running = false;
        return;
      }
      setProgress(current);
      raf = requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      computeTarget();
      ensureLoop();
    };

    computeTarget();
    current = target.value;
    setProgress(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce, panels.length]);

  if (reduce) {
    return (
      <section className="bg-black">
        {panels.map((panel, i) => (
          <div key={panel.title} className="relative h-[80vh] w-full">
            <Image
              src={panel.image}
              alt={panel.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/20" />
            <Container className="relative flex h-full flex-col justify-end pb-20">
              <PanelText panel={panel} />
            </Container>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      style={{ height: `${panels.length * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {panels.map((panel, i) => {
          // Chaque panneau se révèle par-dessus le précédent. On « tient »
          // l'image pleine, puis on enchaîne vite au milieu du segment :
          // le fondu reste court, donc jamais de superposition « boueuse ».
          const seg = progress - (i - 1); // avancée dans le segment entrant
          const cover = i === 0 ? 1 : smooth(clamp01((seg - 0.25) / 0.5));
          // Zoom : l'image se « pose » (1.06 → 1) en devenant active.
          const imgScale = 1.06 - 0.06 * cover;

          // Le texte n'apparaît que lorsque son panneau est nettement actif,
          // et s'efface avant que le suivant n'arrive : pas de texte en double.
          const textOpacity = 1 - smooth(clamp01(Math.abs(progress - i) * 1.8));
          const textShift = Math.max(-40, Math.min(40, (i - progress) * 40));

          return (
            <div
              key={panel.title}
              aria-hidden={Math.round(progress) !== i}
              className="absolute inset-0 will-change-[opacity]"
              style={{ opacity: cover, zIndex: i }}
            >
              <Image
                src={panel.image}
                alt={panel.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover will-change-transform"
                style={{ transform: `scale(${imgScale})` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/15" />
              <Container className="relative flex h-full flex-col justify-end pb-24">
                <div
                  style={{
                    transform: `translate3d(0, ${textShift}px, 0)`,
                    opacity: textOpacity,
                  }}
                >
                  <PanelText panel={panel} />
                </div>
              </Container>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PanelText({ panel }: { panel: StoryPanel }) {
  return (
    <div className="flex max-w-xl flex-col gap-4 text-white">
      <span className="bg-primary/90 w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
        {panel.eyebrow}
      </span>
      <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {panel.title}
      </h2>
      <p className="max-w-md text-lg text-pretty text-white/80">
        {panel.description}
      </p>
    </div>
  );
}
