"use client";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { bloodAvailability } from "@/lib/mock/landing";
import Image from "next/image";
import { cn } from "@/lib/utils";

const STATUS_THEME = {
  critique: {
    label: "Critique",
    color: "text-primary",
    dot: "bg-primary",
    bar: "bg-primary",
  },
  faible: {
    label: "Faible",
    color: "text-amber-500",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  stable: {
    label: "Stable",
    color: "text-emerald-500",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
} as const;

export function AvailabilitySection() {
  return (
    <section id="campagnes" className="relative border-t py-24">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative size-5 shrink-0">
              <Image
                src="/blood-droplet-pure.jpg"
                alt="Goutte de sang"
                fill
                sizes="20px"
                className="rounded-full object-contain"
              />
            </div>
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">
              Niveaux des réserves
            </span>
          </div>
          <SectionHeading
            title="Disponibilité des groupes sanguins"
            description="Suivi en temps réel des stocks nationaux pour orienter les dons de sang volontaires."
          />
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {bloodAvailability.map((item, index) => {
            const theme = STATUS_THEME[item.status];
            return (
              <Reveal key={item.group} delay={index * 40} direction="up">
                <div className="border-border/40 bg-card hover:border-border flex flex-col gap-3 rounded-xl border p-5 transition-all duration-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold tracking-tight">
                      {item.group}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {item.level}%
                    </span>
                  </div>

                  <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        theme.bar,
                      )}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", theme.dot)} />
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase",
                        theme.color,
                      )}
                    >
                      {theme.label}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
