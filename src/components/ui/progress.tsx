import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ProgressProps = ComponentProps<"div"> & {
  value: number;
  indicatorClassName?: string;
};

export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "bg-secondary relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-primary h-full rounded-full transition-all",
          indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
