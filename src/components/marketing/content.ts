import { BellRing, HeartPulse, ShieldCheck, Smartphone } from "lucide-react";

export const features = [
  {
    icon: BellRing,
    title: "Alerté près de chez vous",
    description:
      "Vous n'êtes prévenu que lorsque votre groupe sanguin est vraiment nécessaire, à proximité.",
  },
  {
    icon: ShieldCheck,
    title: "Vos données restent à vous",
    description:
      "Vos informations médicales sont protégées et ne sont partagées qu'avec votre accord.",
  },
  {
    icon: HeartPulse,
    title: "Une carte de confiance",
    description:
      "Votre carte de donneur et l'historique de vos dons ne peuvent pas être falsifiés.",
  },
  {
    icon: Smartphone,
    title: "Récompensé simplement",
    description:
      "Recevez votre récompense directement sur votre Mobile Money, par un simple dépôt, sans rien à installer.",
  },
] as const;

export const steps = [
  {
    title: "Créez votre profil",
    description:
      "Indiquez votre groupe sanguin et votre ville pour rejoindre le réseau de votre région.",
  },
  {
    title: "Recevez votre carte de donneur",
    description:
      "Une carte de confiance est créée pour vous : elle prouve votre identité de donneur en toute sécurité.",
  },
  {
    title: "Répondez aux urgences",
    description:
      "Quand un besoin proche correspond à votre groupe, rendez-vous au centre de don le plus proche.",
  },
  {
    title: "Recevez votre récompense",
    description:
      "Dès votre don confirmé, vous recevez une récompense, sur votre Mobile Money ou en Bitcoin.",
  },
] as const;
