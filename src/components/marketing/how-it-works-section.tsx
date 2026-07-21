import { Container } from "@/components/layout/container";
import { steps } from "@/components/marketing/content";
import { SectionHeading } from "@/components/marketing/section-heading";
import { RevealImage } from "@/components/marketing/reveal-image";
import { Reveal } from "@/components/shared/reveal";

export function HowItWorksSection() {
  return (
    <section id="fonctionnement" className="bg-secondary/5 border-y py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <SectionHeading
            eyebrow="Comment ça marche"
            title="Quatre étapes simples pour sauver des vies"
            description="De l'inscription à la récompense, voici le parcours simple d'un donneur."
          />

          <ol className="border-primary/20 relative flex flex-col gap-8 border-l pl-4">
            {steps.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                delay={index * 100}
                direction="left"
              >
                <div className="relative flex gap-4 pl-4">
                  <span className="bg-primary text-primary-foreground shadow-primary/20 absolute top-0 -left-10 flex size-8 items-center justify-center rounded-full text-sm font-semibold shadow-md">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-5">
          <RevealImage
            src="/how-it-works.png"
            alt="Scan du code QR d'une donneuse par une infirmière"
            ratio="1 / 1"
            className="shadow-primary/5 shadow-2xl"
          />
        </div>
      </Container>
    </section>
  );
}
