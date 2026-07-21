"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const total = Math.max(0, target - Date.now());
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { total, days, hours, minutes, seconds };
}

/** Décompte en temps réel jusqu'au début d'une campagne. */
export function CampaignCountdown({ startsAt }: { startsAt: string }) {
  const target = new Date(startsAt).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.total === 0) {
    return (
      <span className="text-success text-sm font-medium">
        La collecte a commencé
      </span>
    );
  }

  const units: { value: number; label: string }[] = [
    { value: t.days, label: "j" },
    { value: t.hours, label: "h" },
    { value: t.minutes, label: "min" },
    { value: t.seconds, label: "s" },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map((u) => (
        <div
          key={u.label}
          className="bg-muted flex min-w-12 flex-col items-center rounded-lg px-2 py-1.5"
        >
          <span className="text-lg font-semibold tabular-nums">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground text-[10px] uppercase">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
