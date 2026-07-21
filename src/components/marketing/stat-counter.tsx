"use client";

import { useCountUp } from "@/hooks/use-count-up";

type StatCounterProps = {
  value: number;
  suffix?: string;
  label: string;
};

export function StatCounter({ value, suffix = "", label }: StatCounterProps) {
  const { ref, value: animated } = useCountUp(value);

  return (
    <div className="flex flex-col gap-1">
      <span
        ref={ref}
        className="text-primary text-3xl font-semibold tabular-nums sm:text-4xl"
      >
        {animated.toLocaleString("fr-FR")}
        {suffix}
      </span>
      <span className="text-muted-foreground text-sm">{label}</span>
    </div>
  );
}
