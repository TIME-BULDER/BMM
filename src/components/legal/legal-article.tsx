import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

/**
 * Mise en page commune des pages légales : titre, date de mise à jour et
 * colonne de lecture confortable pour un texte long.
 */
export function LegalArticle({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-16 sm:py-24">
      <article className="mx-auto max-w-3xl">
        <header className="mb-10 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Dernière mise à jour : {updatedAt}
          </p>
        </header>
        <div className="[&_a]:text-primary [&_p]:text-muted-foreground [&_ul_*]:text-muted-foreground space-y-6 leading-relaxed [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </Container>
  );
}
