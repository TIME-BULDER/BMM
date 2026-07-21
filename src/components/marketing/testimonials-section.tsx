import { Quote } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { GridPattern } from "@/components/shared/grid-pattern";
import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/lib/mock/landing";

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <GridPattern />
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Témoignages"
          title="Ils sauvent des vies avec Bitcoin Blood"
          description="Donneurs, soignants et organisateurs racontent l'impact sur le terrain."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.name}
              delay={index * 110}
              direction={index === 1 ? "up" : index === 0 ? "right" : "left"}
            >
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  <Quote className="text-primary size-6" />
                  <p className="flex-1 text-pretty">{item.quote}</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="ring-primary/15 size-10 rounded-full object-cover ring-2"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {item.role}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
