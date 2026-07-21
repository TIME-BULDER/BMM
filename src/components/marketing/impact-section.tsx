import { Container } from "@/components/layout/container";
import { RevealImage } from "@/components/marketing/reveal-image";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";

const impactPoints = [
  "Une mobilisation déclenchée en moins d'une minute.",
  "Des donneurs compatibles localisés à proximité du besoin.",
  "Un suivi clair, du don jusqu'à la transfusion.",
] as const;

export function ImpactSection() {
  return (
    <section className="bg-secondary/30 border-y py-24">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Sur le terrain"
            title="Un geste simple, un impact qui sauve"
            description="Derrière chaque alerte, il y a des soignants, des donneurs et des familles. Bitcoin Blood réduit le temps entre le besoin et le don."
          />
          <ul className="flex flex-col gap-4">
            {impactPoints.map((point, index) => (
              <Reveal as="li" key={point} delay={index * 90} direction="left">
                <span className="flex items-start gap-3">
                  <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />
                  <span className="text-pretty">{point}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RevealImage
            ratio="3 / 4"
            className="row-span-2"
            src="https://images.unsplash.com/photo-1615461065929-4f8ffed6ca40?w=800&q=70&auto=format&fit=crop"
            alt="Don du sang en cours dans un centre de collecte"
            sizes="(min-width: 1024px) 20vw, 45vw"
          />
          <RevealImage
            ratio="4 / 3"
            delay={120}
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&q=70&auto=format&fit=crop"
            alt="Équipe médicale au-dessus d'un patient au bloc"
            sizes="(min-width: 1024px) 20vw, 45vw"
          />
          <RevealImage
            ratio="4 / 3"
            delay={220}
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&q=70&auto=format&fit=crop"
            alt="Deux mains qui se serrent en signe de soutien"
            sizes="(min-width: 1024px) 20vw, 45vw"
          />
        </div>
      </Container>
    </section>
  );
}
