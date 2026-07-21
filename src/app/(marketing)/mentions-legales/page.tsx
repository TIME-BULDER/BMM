import type { Metadata } from "next";

import { LegalArticle } from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la plateforme Bitcoin Blood.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalArticle title="Mentions légales" updatedAt="5 juillet 2026">
      <h2>Éditeur de la plateforme</h2>
      <p>
        Bitcoin Blood est une plateforme de mise en relation entre donneurs de
        sang et structures de santé. Pour toute demande, un contact est mis à
        disposition via la page de soutien et l'adresse e-mail de l'équipe.
      </p>

      <h2>Hébergement</h2>
      <p>
        La plateforme est hébergée sur une infrastructure d'hébergement web
        professionnelle. Les données de santé font l'objet de mesures de
        protection renforcées, dans un cadre conforme à la réglementation
        applicable.
      </p>

      <h2>Nature du service</h2>
      <p>
        Bitcoin Blood ne se substitue pas aux structures de santé agréées. La
        qualification biologique du sang, les tests de groupe sanguin et les
        décisions médicales relèvent exclusivement des centres de transfusion et
        des professionnels de santé compétents. Le groupe sanguin renseigné par
        un donneur reste déclaratif tant qu'il n'a pas été confirmé par un
        centre agréé.
      </p>

      <h2>Autorités de référence</h2>
      <p>
        L'activité de collecte et de transfusion sanguine au Bénin relève de
        l'Agence Nationale pour la Transfusion Sanguine (ANTS), sous tutelle du
        Ministère de la Santé. Le traitement des données personnelles est
        encadré par l'Autorité de Protection des Données à caractère Personnel
        (APDP) et par le Code du Numérique du Bénin.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments de la plateforme (marque, textes, interfaces)
        est protégé. Toute reproduction non autorisée est interdite.
      </p>
    </LegalArticle>
  );
}
