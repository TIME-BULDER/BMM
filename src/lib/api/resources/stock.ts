import { httpClient } from "@/lib/api/http-client";

import type { StockItem } from "./types";

export const stockApi = {
  /** Stock de la structure connectée. */
  list: () => httpClient.get<StockItem[]>("/stock"),
};
