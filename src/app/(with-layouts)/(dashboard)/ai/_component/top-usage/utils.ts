import formatCurrency from "@/utils/format-currency";
import type { TopUsageModelRawItem } from "@/services/api/ai";

import type { TopUsageViewModel } from "./types";

export function toTopUsageViewModel(raw: TopUsageModelRawItem): TopUsageViewModel {
  return {
    id: raw.id,
    modelName: raw.model_name,
    provider: raw.provider,
    requests: raw.requests_count.toLocaleString(),
    cost: formatCurrency(raw.cost_amount),
  };
}
