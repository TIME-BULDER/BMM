import type { Metadata } from "next";

import { LegalArticle } from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation de la plateforme Bitcoin Blood.",
};

export default function ConditionsPage() {
  return (
    <LegalArticle title="Conditions d'utilisation" updatedAt="5 juillet 2026">
      <p>
        En utilisant Bitcoin Blood, vous acceptez les conditions ci-dessous.
        Elles définissent le rôle de chacun et les règles de bon usage.
      </p>

      <h2>Objet du service</h2>
      <p>
        Bitcoin Blood met en relation des donneurs volontaires et des structures
        de santé, facilite les alertes en cas de besoin et permet de récompenser
        les dons. La plateforme ne réalise aucun acte médical.
      </p>

      <h2>Engagements du donneur</h2>
      <ul>
        <li>Fournir des informations exactes.</li>
        <li>
          Comprendre que son groupe sanguin reste à confirmer par un centre
          agréé avant tout don effectif.
        </li>
        <li>Garder sa clé personnelle en sécurité.</li>
      </ul>

      <h2>Engagements des structures</h2>
      <ul>
        <li>
          Être une structure de santé légitime, validée par la plateforme.
        </li>
        <li>
          N'utiliser les données des donneurs que pour la mobilisation et le
          suivi des dons.
        </li>
        <li>Respecter les protocoles nationaux de transfusion.</li>
      </ul>

      <h2>Récompenses</h2>
      <p>
        Les récompenses versées aux donneurs sont un encouragement au don
        volontaire. Une même personne ne peut être récompensée qu'une fois par
        période définie, afin de prévenir tout abus.
      </p>

      <h2>Responsabilité</h2>
      <p>
        La sécurité transfusionnelle relève des centres de santé agréés. Bitcoin
        Blood ne saurait être tenu responsable des décisions médicales, qui
        restent du ressort des professionnels de santé.
      </p>

      <h2>Évolution des conditions</h2>
      <p>
        Ces conditions peuvent évoluer. Les utilisateurs sont informés des
        changements importants.
      </p>
    </LegalArticle>
  );
}
