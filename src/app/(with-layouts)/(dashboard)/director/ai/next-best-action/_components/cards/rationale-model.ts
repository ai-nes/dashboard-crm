import type { RecommendedAction } from "../types";
import { scrubCopy } from "./sanitize";

export interface RationaleRow {
  /** Stable key + the end-user question this row answers. */
  id: "whyNow" | "approach" | "outcome";
  label: string;
  value: string;
}

/**
 * The "why" behind the recommendation, in reading order:
 * tại sao bây giờ → cách tiếp cận → kết quả mong đợi.
 * Every row is optional and dropped when its source value is missing — the
 * card title already states *what* the action is and the assignment block
 * already names *who*, so neither is repeated here.
 */
export function buildRationaleRows(action: RecommendedAction): RationaleRow[] {
  const candidates: Array<RationaleRow | null> = [
    action.whyNow
      ? { id: "whyNow", label: "Vì sao nên làm bây giờ", value: action.whyNow }
      : null,
    action.approach
      ? { id: "approach", label: "Cách tiếp cận", value: action.approach }
      : null,
    action.expectedOutcome
      ? { id: "outcome", label: "Kết quả mong đợi", value: action.expectedOutcome }
      : null,
  ];

  return candidates
    .filter((row): row is RationaleRow => row !== null && row.value.trim() !== "")
    .map((row) => ({ ...row, value: scrubCopy(row.value) }));
}
