import { cn } from "@/lib/utils";

/**
 * Illustration vectorielle originale: une goutte de sang au centre d'un
 * réseau de donneurs, traversée d'une ligne de pouls. Themable via les
 * tokens de couleur, donc cohérente en clair comme en sombre.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      role="img"
      aria-label="Réseau de donneurs autour d'une goutte de sang"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <radialGradient id="bb-glow" cx="50%" cy="42%" r="55%">
          <stop
            offset="0%"
            stopColor="var(--color-primary)"
            stopOpacity="0.35"
          />
          <stop
            offset="100%"
            stopColor="var(--color-primary)"
            stopOpacity="0"
          />
        </radialGradient>
        <linearGradient id="bb-drop" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-primary)"
            stopOpacity="0.95"
          />
          <stop
            offset="100%"
            stopColor="var(--color-primary)"
            stopOpacity="0.7"
          />
        </linearGradient>
      </defs>

      <circle cx="240" cy="210" r="200" fill="url(#bb-glow)" />

      <g
        fill="none"
        stroke="var(--color-primary)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      >
        <circle cx="240" cy="210" r="150" strokeDasharray="4 8" />
        <circle cx="240" cy="210" r="110" strokeOpacity="0.2" />
      </g>

      <g stroke="var(--color-primary)" strokeOpacity="0.4" strokeWidth="1.5">
        <line x1="240" y1="210" x2="90" y2="120" />
        <line x1="240" y1="210" x2="400" y2="150" />
        <line x1="240" y1="210" x2="120" y2="330" />
        <line x1="240" y1="210" x2="380" y2="320" />
      </g>

      <g fill="var(--color-primary)" fillOpacity="0.85">
        <circle cx="90" cy="120" r="9" />
        <circle cx="400" cy="150" r="11" />
        <circle cx="120" cy="330" r="8" />
        <circle cx="380" cy="320" r="10" />
      </g>

      <path
        d="M240 96c34 46 60 80 60 116a60 60 0 1 1-120 0c0-36 26-70 60-116z"
        fill="url(#bb-drop)"
      />

      <path
        d="M186 214h22l10-22 16 44 12-26 8 14h32"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
