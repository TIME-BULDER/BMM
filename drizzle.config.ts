import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { serverEnv } from "./src/lib/env/server";

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
