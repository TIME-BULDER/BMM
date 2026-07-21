import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import dotenv from "dotenv";

// Charge les variables d'environnement locales (.env) pour les tests
dotenv.config();

afterEach(() => {
  cleanup();
});
