import { Container } from "@/components/layout/container";
import { RevealImage } from "@/components/marketing/reveal-image";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";

export function SecuritySection() {
  return (
    <section id="securite" className="relative overflow-hidden border-t py-24">
      <div
        aria-hidden
        className="animate-pulse-glow bg-primary/5 pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-96 w-96 rounded-full blur-3xl"
      />
      <Container className="grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:order-last lg:col-span-5">
          <RevealImage
            src="/trust-shield.png"
            alt="Profil sécurisé de donneur sur smartphone"
            ratio="1 / 1"
            className="shadow-primary/10 border shadow-2xl"
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-7">
          <SectionHeading
            eyebrow="Sécurité & Confidentialité"
            title="Une transparence totale et une sécurité absolue"
            description="La vie privée est un droit fondamental, surtout lorsqu'il s'agit de votre santé."
          />
          <Reveal delay={120} direction="up">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Chez Bitcoin Blood, votre carte de donneur et l'historique de vos
              dons sont enregistrés une fois pour toutes. Une fois créés, ils ne
              peuvent plus être modifiés ni falsifiés.
            </p>
          </Reveal>
          <Reveal delay={200} direction="up">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Personne, pas même un gouvernement ou un administrateur, ne peut
              changer votre historique ou se faire passer pour vous. Vos
              informations de santé sont bien protégées, et vous en restez le
              seul maître.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
