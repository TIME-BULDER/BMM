export const primaryNav = [
  { label: "Donneurs", href: "#donneurs" },
  { label: "Fonctionnement", href: "#fonctionnement" },
  { label: "Campagnes", href: "/campagnes" },
  { label: "Impact", href: "#impact" },
] as const;

export const footerNav = [
  {
    title: "Plateforme",
    links: [
      { label: "Devenir donneur", href: "#donneurs" },
      { label: "Lancer une alerte", href: "#fonctionnement" },
      { label: "Campagnes", href: "#campagnes" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Compatibilité sanguine", href: "#fonctionnement" },
      { label: "Cartes vérifiables", href: "#fonctionnement" },
      { label: "Preuves Bitcoin", href: "#impact" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Notre mission", href: "#impact" },
      { label: "Sécurité", href: "#impact" },
      { label: "Contact", href: "#impact" },
    ],
  },
] as const;
