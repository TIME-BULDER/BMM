import Image from "next/image";
import Link from "next/link";

import { HeartbeatMonitor } from "@/components/auth/heartbeat-monitor";
import { Logo } from "@/components/shared/logo";

const readouts = [
  { value: "12 480", label: "donneurs" },
  { value: "54", label: "pays" },
  { value: "47 s", label: "pour alerter" },
];

/**
 * Volet de marque de l'authentification, pensé comme un moniteur de signes
 * vitaux: surface clinique sombre (constante, hors thème), relevés en
 * caractères mono et tracé ECG vivant comme signature.
 */
export function AuthBrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[oklch(0.17_0.025_264)] p-10 text-white lg:flex xl:p-14">
      {/* Image d'ambiance très atténuée, assombrie pour rester en retrait. */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=1400&q=60&auto=format&fit=crop"
          alt=""
          fill
          sizes="50vw"
          priority
          className="[mask-image:linear-gradient(to_bottom,black_10%,transparent_95%)] object-cover opacity-[0.32]"
        />
        <div className="absolute inset-0 bg-[oklch(0.17_0.025_264)]/55" />
      </div>

      {/* Lueur d'accent diffuse + trame d'instrument. */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 size-96 rounded-full bg-[var(--color-primary)] opacity-20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Volet toujours sombre: on force le contexte `.dark` pour que le texte
          du logo reste clair quel que soit le thème global. */}
      <Link href="/" className="dark relative flex items-center">
        <Logo />
      </Link>

      <div className="relative space-y-8">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--color-primary)]" />
          </span>
          Réseau panafricain du don · en direct
        </span>

        <h2 className="max-w-md text-4xl leading-[1.05] font-semibold tracking-tight text-balance xl:text-5xl">
          Chaque battement compte.
        </h2>

        <p className="max-w-sm text-sm leading-relaxed text-white/60">
          Le réseau qui relie donneurs et urgences à travers le continent - et
          ancre chaque don sur Bitcoin pour des preuves inaltérables.
        </p>

        {/* Signature ECG */}
        <div className="relative">
          <HeartbeatMonitor />
          <span
            aria-hidden
            className="animate-ecg-cursor absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-[var(--color-primary)] shadow-[0_0_16px_4px_var(--color-primary)]"
          />
        </div>
      </div>

      <dl className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
        {readouts.map((item) => (
          <div key={item.label} className="space-y-1">
            <dt className="font-mono text-2xl font-semibold tracking-tight">
              {item.value}
            </dt>
            <dd className="text-xs text-white/50">{item.label}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
