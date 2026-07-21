"use client";

import {
  AlertCircle,
  BadgeCheck,
  Check,
  Eye,
  Megaphone,
  Phone,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

import { DonorRegistrationForm } from "@/components/donate/donor-registration-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Select, SelectItem } from "@/components/ui/select";
import {
  useAddDonorActivity,
  useDonors,
  useValidateDonor,
} from "@/lib/api/hooks";
import { BLOOD_TYPES } from "@/lib/api/resources";

function initialsOf(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "DN";
}

export function DonorsExplorer() {
  const { data: donors, isLoading, isError, error } = useDonors();
  const validateDonor = useValidateDonor();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("tous");
  const [registerOpen, setRegisterOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (donors ?? []).filter((d) => {
      const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
      const matchesQuery =
        !q || fullName.includes(q) || d.city.toLowerCase().includes(q);
      const matchesGroup = group === "tous" || d.bloodType === group;
      return matchesQuery && matchesGroup;
    });
  }, [donors, query, group]);

  const { pageItems, page, setPage, totalPages, total } =
    usePagination(results);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setRegisterOpen(true)}>
          <UserPlus className="size-4" />
          Inscrire un donneur
        </Button>
      </div>

      <Dialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Inscrire un donneur"
        description="Enregistrez un donneur depuis votre structure. Vous restez connecté ; une clé privée à lui remettre sera générée."
        className="max-w-xl"
      >
        <Suspense fallback={null}>
          <DonorRegistrationForm variant="admin" />
        </Suspense>
      </Dialog>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un nom, une ville…"
              className="pl-9"
            />
          </div>
          <Select
            value={group}
            onValueChange={setGroup}
            className="sm:w-40"
            aria-label="Groupe sanguin"
          >
            <SelectItem value="tous">Tous les groupes</SelectItem>
            {BLOOD_TYPES.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Chargement de l'annuaire…
        </p>
      ) : isError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-lg border px-4 py-8 text-sm">
          <AlertCircle className="size-4" />
          {error instanceof Error ? error.message : "Chargement impossible."}
        </p>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="text-muted-foreground size-8" />
            <p className="font-medium">Aucun donneur validé</p>
            <p className="text-muted-foreground text-sm">
              Les donneurs apparaissent ici après validation d'un premier don.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {results.length} donneur{results.length > 1 ? "s" : ""} validé
            {results.length > 1 ? "s" : ""}
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((donor) => (
              <Card key={donor.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <Avatar
                      initials={initialsOf(donor.firstName, donor.lastName)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-medium">
                          {donor.firstName} {donor.lastName}
                        </p>
                        {donor.validated ? (
                          <BadgeCheck className="text-primary size-4 shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-muted-foreground truncate text-sm">
                        {donor.city} · {donor.age} ans
                      </p>
                    </div>
                    <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-semibold">
                      {donor.bloodType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={donor.available ? "success" : "neutral"}>
                      {donor.available ? "Disponible" : "Indisponible"}
                    </Badge>
                    <Badge variant={donor.validated ? "primary" : "warning"}>
                      {donor.validated ? "Validé" : "À valider"}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/donors/${donor.id}`}>
                        <Eye className="size-4" />
                        Fiche
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a href={`tel:${donor.phoneNumber.replace(/\s/g, "")}`}>
                        <Phone className="size-4" />
                        Contacter
                      </a>
                    </Button>
                    {!donor.validated ? (
                      <Button
                        size="sm"
                        onClick={() => validateDonor.mutate(donor.id)}
                        disabled={validateDonor.isPending}
                      >
                        <Check className="size-4" />
                        Valider
                      </Button>
                    ) : null}
                  </div>

                  <DonorActivityAction donorId={donor.id} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

/**
 * Enregistre une activité au mérite pour un donneur (participation à une
 * séance de sensibilisation ou parrainage), via POST /donors/[id]/activities.
 */
function DonorActivityAction({ donorId }: { donorId: string }) {
  const addActivity = useAddDonorActivity();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  function add(activityType: "awareness_session" | "referral", label: string) {
    addActivity.mutate(
      { id: donorId, activityType },
      {
        onSuccess: () => {
          setDone(label);
          setOpen(false);
          setTimeout(() => setDone(null), 2500);
        },
      },
    );
  }

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="size-3.5" />
        {done} enregistrée
      </p>
    );
  }

  // Seule la participation à une séance de sensibilisation est attestée
  // manuellement par la structure. Les dons et les parrainages sont, eux,
  // enregistrés automatiquement.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
      >
        <Plus className="size-3.5" />
        Attester une sensibilisation
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        onClick={() => add("awareness_session", "Sensibilisation")}
        disabled={addActivity.isPending}
      >
        <Megaphone className="size-4" />
        Confirmer la participation
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
        disabled={addActivity.isPending}
      >
        Annuler
      </Button>
    </div>
  );
}
