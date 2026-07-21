import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="relative flex shrink-0 items-center justify-center">
        <svg
          className="size-9 drop-shadow-[0_2px_8px_rgba(217,35,50,0.25)] filter transition-transform duration-300 hover:scale-105"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="dropletGrad"
              x1="32"
              y1="4"
              x2="32"
              y2="60"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ff5252" />
              <stop offset="60%" stopColor="#d92332" />
              <stop offset="100%" stopColor="#900b14" />
            </linearGradient>
          </defs>
          {/* Main Droplet - Rescaled from Y=72 to Y=60 to prevent Y-axis crop */}
          <path
            d="M32 4C32 4 8 28 8 44C8 54 18.75 60 32 60C45.25 60 56 54 56 44C56 28 32 4 32 4Z"
            fill="url(#dropletGrad)"
          />
          {/* Crescent highlight - Adjusted to fit Y=60 max height */}
          <path
            d="M15 42C15 48 19 52 25 53"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Bitcoin symbol - Repositioned and resized for the scaled droplet */}
          <text
            x="32.5"
            y="47.5"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
            fontSize="20"
            fill="white"
            textAnchor="middle"
            transform="rotate(-12 32.5 42)"
          >
            ₿
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline text-[20px] font-semibold tracking-tight">
            <span className="text-foreground font-sans transition-colors duration-300">
              Bitcoin
            </span>
            <span className="text-primary font-sans font-bold">Blood</span>
          </div>
          <span className="text-muted-foreground/90 mt-1 text-[7.5px] font-semibold tracking-[0.22em] uppercase">
            Connect <span className="text-primary">•</span> Donate{" "}
            <span className="text-primary">•</span> Save Lives
          </span>
        </div>
      )}
    </div>
  );
}
