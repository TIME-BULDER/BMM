import { ArrowRight, BellRing, Droplet, HeartPulse } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RevealImage } from "@/components/marketing/reveal-image";
import { StatCounter } from "@/components/marketing/stat-counter";
import { GridPattern } from "@/components/shared/grid-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { landingStats } from "@/lib/mock/landing";

function FloatingCard({
  className,
  icon,
  title,
  subtitle,
  delay,
}: {
  className: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay: string;
}) {
  return (
    <div
      className={`animate-float bg-card/90 absolute flex items-center gap-2 rounded-xl border px-3 py-2 shadow-lg backdrop-blur ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-semibold">{title}</span>
        <span className="text-muted-foreground text-[11px]">{subtitle}</span>
      </span>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <GridPattern />
      <div
        aria-hidden
        className="animate-pulse-glow bg-primary/15 pointer-events-none absolute -top-40 left-1/2 -z-10 h-140 w-140 -translate-x-1/2 rounded-full blur-3xl"
      />
      <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="primary" className="animate-rise-in">
            <Droplet className="size-3.5" />
            Plateforme panafricaine de don de sang
          </Badge>

          <h1
            className="animate-rise-in text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            Votre sang sauve des vies,{" "}
            <span className="text-primary block sm:inline">
              Bitcoin sécurise votre engagement.
            </span>
          </h1>

          <p
            className="animate-rise-in text-muted-foreground max-w-xl text-lg text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            Rejoignez le premier réseau panafricain de donneurs de sang
            volontaires et recevez des récompenses pour votre geste de
            solidarité.
          </p>

          <div
            className="animate-rise-in flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Button size="lg" className="group" asChild>
              <Link href="/donate">
                Devenir donneur maintenant
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#fonctionnement">Découvrir le fonctionnement</Link>
            </Button>
          </div>
        </div>

        <div
          className="animate-rise-in relative mx-auto w-full max-w-md"
          style={{ animationDelay: "200ms" }}
        >
          <RevealImage
            priority
            ratio="1 / 1"
            delay={120}
            src="/hero-background.png"
            alt="Un centre de don de sang moderne avec une infirmière en Afrique"
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="shadow-primary/10 shadow-2xl"
          />
          <FloatingCard
            className="top-6 -left-2 sm:left-6"
            icon={<BellRing className="size-4" />}
            title="Alerte envoyée"
            subtitle="O- recherché, 2 km"
            delay="0.6s"
          />
          <FloatingCard
            className="-right-1 bottom-10 sm:right-4"
            icon={<HeartPulse className="size-4" />}
            title="Donneur trouvé"
            subtitle="Compatible, disponible"
            delay="1.4s"
          />
        </div>
      </Container>

      <Container className="grid grid-cols-2 gap-8 border-t py-10 lg:grid-cols-4">
        {landingStats.map((stat) => (
          <StatCounter
            key={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
          />
        ))}
      </Container>
    </section>
  );
}
