/**
 * Préférence de récompense du donneur - « la Récompense Invisible ».
 *
 * Le donneur choisit comment recevoir ses satoshis : soit sur son propre
 * portefeuille Lightning, soit - sans jamais toucher à la crypto - sur son
 * compte Mobile Money, la conversion étant routée à la volée via Izichange.
 *
 * Tant que la persistance backend n'expose pas ces colonnes, la préférence
 * vit côté client (localStorage) : elle est collectée à l'inscription puis
 * ré-affichée dans l'espace donneur et proposée par défaut au versement.
 */

export type RewardMode = "lightning" | "mobile-money";

export type MobileMoneyOperator =
  "mtn" | "moov" | "orange" | "wave" | "celtiis";

export const MOBILE_MONEY_OPERATORS: {
  value: MobileMoneyOperator;
  label: string;
}[] = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "moov", label: "Moov Money" },
  { value: "orange", label: "Orange Money" },
  { value: "wave", label: "Wave" },
  { value: "celtiis", label: "Celtiis Cash" },
];

export function operatorLabel(operator?: MobileMoneyOperator | null): string {
  return (
    MOBILE_MONEY_OPERATORS.find((o) => o.value === operator)?.label ??
    "Mobile Money"
  );
}

export type RewardPreference = {
  mode: RewardMode;
  /** Renseignés uniquement lorsque `mode === "mobile-money"`. */
  operator?: MobileMoneyOperator;
  phone?: string;
};

const KEY_PREFIX = "bmm.reward-preference.";

function keyFor(donorId: string): string {
  return `${KEY_PREFIX}${donorId}`;
}

/** Mémorise la préférence de récompense d'un donneur (no-op côté serveur). */
export function saveRewardPreference(
  donorId: string,
  preference: RewardPreference,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(donorId), JSON.stringify(preference));
  } catch {
    // Stockage indisponible (mode privé, quota) - on ignore silencieusement.
  }
}

/** Relit la préférence de récompense, ou `null` si aucune n'est enregistrée. */
export function loadRewardPreference(donorId: string): RewardPreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(donorId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RewardPreference;
    return parsed.mode ? parsed : null;
  } catch {
    return null;
  }
}
