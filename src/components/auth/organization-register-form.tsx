"use client";

import { AlertCircle, Building2, Mail, MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { useRegisterOrganization } from "@/lib/api/hooks";
import type { OrganizationType } from "@/lib/api/resources";

type Coords = { latitude: number; longitude: number };

export function OrganizationRegisterForm() {
  const router = useRouter();
  const register = useRegisterOrganization();
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
        setGeoState("idle");
      },
      () => setGeoState("error"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!coords) {
      setError("Veuillez renseigner la localisation de votre structure.");
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      await register.mutateAsync({
        name: String(form.get("name")),
        type: String(form.get("type")) as OrganizationType,
        email: String(form.get("email")),
        contactEmail: String(form.get("contactEmail")),
        city: String(form.get("city")),
        password: String(form.get("password")),
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <AuthField
        label="Nom de la structure"
        icon={Building2}
        name="name"
        required
        placeholder="CNHU-HKM de Cotonou"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            name="type"
            defaultValue="hospital"
            className="h-11"
          >
            <SelectItem value="hospital">Hôpital</SelectItem>
            <SelectItem value="ngo">ONG</SelectItem>
            <SelectItem value="blood_center">Centre de collecte</SelectItem>
          </Select>
        </div>
        <AuthField
          label="Ville"
          icon={MapPin}
          name="city"
          autoComplete="address-level2"
          required
          placeholder="Cotonou"
        />
      </div>

      <AuthField
        label="Email de connexion"
        icon={Mail}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="admin@hopital.bj"
      />
      <AuthField
        label="Email de contact public"
        icon={Mail}
        name="contactEmail"
        type="email"
        required
        placeholder="contact@hopital.bj"
      />
      <PasswordField
        name="password"
        autoComplete="new-password"
        required
        placeholder="8 caractères minimum"
      />

      <div className="space-y-2">
        <Label>Localisation</Label>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-start"
          onClick={captureLocation}
          disabled={geoState === "loading"}
        >
          <Navigation className="size-4" />
          {coords
            ? `Position captée : ${coords.latitude}, ${coords.longitude}`
            : geoState === "loading"
              ? "Localisation en cours…"
              : "Utiliser ma position actuelle"}
        </Button>
        {geoState === "error" ? (
          <p className="text-muted-foreground text-xs">
            Localisation indisponible. Autorisez l'accès à votre position pour
            cibler les donneurs à proximité.
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={register.isPending}
      >
        {register.isPending ? "Création…" : "Créer le compte structure"}
      </Button>
    </form>
  );
}
