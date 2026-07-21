import { cn } from "@/lib/utils";

/**
 * Signature de l'écran d'authentification: un tracé ECG plein cadre qui
 * se dessine en boucle comme sur un moniteur cardiaque, avec une lueur
 * d'accent et un curseur lumineux qui balaie la ligne de base. S'arrête
 * proprement quand l'utilisateur a réduit les animations (globals.css).
 */

// Une battement = motif relatif répété; le tracé reste net (segments droits).
const BEAT =
  "h60 l16 -12 l16 12 h28 l8 6 l10 -74 l10 92 l8 -32 h24 l18 -16 l18 16 h40";
const ECG_PATH = `M0 100 ${BEAT} ${BEAT} ${BEAT} ${BEAT} h176`;

export function HeartbeatMonitor({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      fill="none"
      className={cn("h-24 w-full", className)}
    >
      {/* Ligne de base permanente, très atténuée. */}
      <path
        d={ECG_PATH}
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
      />
      {/* Halo flou sous le tracé animé. */}
      <path
        d={ECG_PATH}
        stroke="var(--color-primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg-sweep"
        style={{ filter: "blur(7px)", opacity: 0.5 }}
      />
      {/* Tracé net animé. */}
      <path
        d={ECG_PATH}
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg-sweep"
      />
    </svg>
  );
}
