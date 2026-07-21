"use client";

import Image from "next/image";
import { useInView } from "@/hooks/use-in-view";
import type { BloodTypeAvailability } from "@/lib/mock/landing";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BloodTypeAvailability["status"], string> = {
  critique: "bg-primary",
  faible: "bg-amber-500",
  stable: "bg-emerald-500",
};

const STATUS_LABELS: Record<BloodTypeAvailability["status"], string> = {
  critique: "Critique",
  faible: "Faible",
  stable: "Stable",
};

export function AvailabilityBar({
  group,
  level,
  status,
}: BloodTypeAvailability) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative size-5">
            <Image
              src="/blood-droplet-pure.jpg"
              alt="Goutte de sang"
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold">{group}</span>
        </div>
        <span className="text-muted-foreground text-xs">
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="bg-secondary h-2 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-1000 ease-out",
            STATUS_STYLES[status],
          )}
          style={{ width: inView ? `${level}%` : "0%" }}
        />
      </div>
    </div>
  );
}
