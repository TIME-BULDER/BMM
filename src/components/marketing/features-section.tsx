import { Container } from "@/components/layout/container";
import { features } from "@/components/marketing/content";
import { PulseLine } from "@/components/marketing/pulse-line";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section id="donneurs" className="relative py-24">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="Pourquoi Bitcoin Blood"
            title="La solidarité, rendue simple et fiable."
            description="Un réseau qui relie donneurs et hôpitaux, récompense les gestes qui sauvent et protège vos données."
          />
          <Reveal delay={220}>
            <PulseLine />
          </Reveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={(index % 3) * 90}
              direction={index % 2 === 0 ? "up" : "scale"}
            >
              <Card className="group hover:border-primary/40 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardHeader>
                  <span className="from-primary/15 to-primary/5 text-primary ring-primary/10 flex size-12 items-center justify-center rounded-xl bg-linear-to-br ring-1 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="size-5" />
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
