import { cn } from "@/lib/utils";

/**
 * Ligne de pouls (ECG) qui se trace en boucle. Purement décorative,
 * elle reprend la couleur d'accent et s'arrête si l'utilisateur a réduit
 * les animations (géré dans globals.css).
 */
export function PulseLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 260 40"
      fill="none"
      className={cn("h-8 w-full max-w-xs", className)}
    >
      <path
        d="M0 20 H70 l8 -14 l10 28 l9 -22 l7 8 H150 l8 -10 l10 20 l8 -8 H260"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse-draw"
      />
    </svg>
  );
}
