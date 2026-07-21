import type { Metadata } from "next";

import { LegalArticle } from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Bitcoin Blood protège vos données personnelles et de santé.",
};

export default function ConfidentialitePage() {
  return (
    <LegalArticle
      title="Politique de confidentialité"
      updatedAt="5 juillet 2026"
    >
      <p>
        La protection de vos données, en particulier vos données de santé, est
        une priorité. Cette page explique quelles informations nous recueillons,
        pourquoi, et quels sont vos droits.
      </p>

      <h2>Données que nous recueillons</h2>
      <ul>
        <li>Votre identité : nom, prénom, âge, ville.</li>
        <li>Vos coordonnées : téléphone, e-mail.</li>
        <li>
          Votre groupe sanguin (facultatif tant qu'il n'est pas confirmé par un
          centre) et l'historique de vos dons.
        </li>
        <li>
          Votre position approximative, pour ne vous alerter qu'à proximité.
        </li>
      </ul>

      <h2>Pourquoi nous les utilisons</h2>
      <ul>
        <li>
          Vous mettre en relation avec les centres en cas de besoin proche.
        </li>
        <li>Vérifier l'authenticité de votre carte de donneur.</li>
        <li>Vous verser vos récompenses.</li>
      </ul>
      <p>
        Vos données de santé ne sont jamais exposées lors d'une vérification de
        carte : seule l'authenticité et le groupe sanguin nécessaire sont
        confirmés, sans révéler vos informations privées.
      </p>

      <h2>Consentement</h2>
      <p>
        Nous recueillons votre consentement explicite à l'inscription. Vous
        pouvez le retirer à tout moment en demandant la suppression de votre
        compte.
      </p>

      <h2>Vos droits</h2>
      <ul>
        <li>Accéder à vos données et en obtenir une copie.</li>
        <li>Les corriger si elles sont inexactes.</li>
        <li>Demander leur suppression.</li>
      </ul>

      <h2>Cadre réglementaire</h2>
      <p>
        Le traitement de vos données respecte le cadre applicable en Afrique de
        l'Ouest : au Bénin, le Code du Numérique et le contrôle de l'Autorité de
        Protection des Données à caractère Personnel (APDP) ; à l'échelle
        régionale et continentale, l'Acte additionnel de la CEDEAO sur la
        protection des données et la Convention de Malabo de l'Union Africaine.
      </p>

      <h2>Conservation et sécurité</h2>
      <p>
        Vos données sont conservées le temps nécessaire à la fourniture du
        service et protégées par des mesures de sécurité adaptées. Votre clé
        personnelle n'est jamais stockée sur nos serveurs : elle reste sur votre
        appareil.
      </p>
    </LegalArticle>
  );
}
