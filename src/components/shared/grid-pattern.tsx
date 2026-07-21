import { cn } from "@/lib/utils";

/**
 * Trame de points décorative, atténuée vers les bords par un masque radial.
 * Ajoute de la profondeur sans distraire du contenu.
 */
export function GridPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]",
        className,
      )}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="bb-dots"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1.5"
              cy="1.5"
              r="1.5"
              fill="var(--color-foreground)"
              fillOpacity="0.06"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bb-dots)" />
      </svg>
    </div>
  );
}
