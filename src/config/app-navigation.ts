import {
  ArrowLeftRight,
  Bell,
  Building2,
  CalendarHeart,
  IdCard,
  LayoutDashboard,
  Search,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type AppRole = "super_admin" | "org_admin" | "donor";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Badge optionnel (ex: nombre d'alertes ouvertes). */
  badge?: string;
};

export type AppNavGroup = {
  title: string;
  items: AppNavItem[];
};

export const appNav: AppNavGroup[] = [
  {
    title: "Pilotage",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { label: "Alertes", href: "/alerts", icon: Bell },
    ],
  },
  {
    title: "Donneurs",
    items: [
      { label: "Annuaire", href: "/donors", icon: Users },
      { label: "Recherche compatible", href: "/search", icon: Search },
    ],
  },
  {
    title: "Mobilisation",
    items: [
      { label: "Campagnes", href: "/campaigns", icon: CalendarHeart },
      { label: "Récompenses", href: "/cards", icon: Zap },
    ],
  },
  {
    title: "Réseau",
    items: [{ label: "Réseau & stock", href: "/reseau", icon: ArrowLeftRight }],
  },
];

/**
 * Menu réservé au super-administrateur : supervision de l'ensemble du réseau,
 * en plus de ce que voit une structure.
 */
export const adminNav: AppNavGroup[] = [
  {
    title: "Administration",
    items: [
      { label: "Organisations", href: "/organisations", icon: Building2 },
      { label: "Demandes de cartes", href: "/demandes-cartes", icon: IdCard },
    ],
  },
];

/** Renvoie le menu adapté au rôle : l'admin voit tout, plus l'administration. */
export function navForRole(role: AppRole | undefined): AppNavGroup[] {
  return role === "super_admin" ? [...appNav, ...adminNav] : appNav;
}
