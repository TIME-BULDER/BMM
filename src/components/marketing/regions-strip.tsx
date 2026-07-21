import { MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { partnerRegions } from "@/lib/mock/landing";

export function RegionsStrip() {
  const items = [...partnerRegions, ...partnerRegions];

  return (
    <section className="bg-secondary/30 border-y py-8">
      <Container className="flex flex-col items-center gap-6">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Déployé progressivement à travers le continent
        </span>
        <div className="group relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="animate-marquee group-hover:paused flex w-max items-center gap-10">
            {items.map((region, index) => (
              <li
                key={`${region}-${index}`}
                className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm font-medium"
              >
                <MapPin className="text-primary size-3.5" />
                {region}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
