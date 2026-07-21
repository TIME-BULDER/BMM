"use client";

import { useCallback, useState } from "react";

export type Coords = { latitude: number; longitude: number };
export type GeoStatus = "idle" | "loading" | "ready" | "error";

/**
 * Capture la position du navigateur. Utilisé par les écrans qui ciblent
 * les donneurs à proximité (urgences, recherche, inscription).
 */
export function useGeolocation(initial?: Coords) {
  const [coords, setCoords] = useState<Coords | null>(initial ?? null);
  const [status, setStatus] = useState<GeoStatus>(initial ? "ready" : "idle");

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
        setStatus("ready");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  return { coords, status, request, setCoords };
}
