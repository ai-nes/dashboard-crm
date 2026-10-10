import type { LeadAssignmentWorkflowStepSnapshot } from "@/services/api/lead-sale";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Apply only the user's edits to the latest snapshot. Preserve unedited server
// fields, including province mappings added by another operator.
function applyEditedFields(
  previous: unknown,
  draft: unknown,
  latest: unknown,
): unknown {
  if (JSON.stringify(previous) === JSON.stringify(draft)) return latest;
  if (
    Array.isArray(previous) &&
    Array.isArray(draft) &&
    Array.isArray(latest) &&
    latest.every((item) => isRecord(item) && typeof item.key === "string")
  ) {
    return latest.map((item) => {
      const oldItem = previous.find(
        (entry) => isRecord(entry) && entry.key === item.key,
      );
      const editedItem = draft.find(
        (entry) => isRecord(entry) && entry.key === item.key,
      );
      return editedItem ? applyEditedFields(oldItem, editedItem, item) : item;
    });
  }
  if (isRecord(previous) && isRecord(draft) && isRecord(latest)) {
    const merged = { ...latest };
    for (const key of new Set([
      ...Object.keys(previous),
      ...Object.keys(draft),
    ])) {
      if (JSON.stringify(previous[key]) === JSON.stringify(draft[key]))
        continue;
      if (!Object.hasOwn(draft, key)) delete merged[key];
      else
        merged[key] = applyEditedFields(previous[key], draft[key], latest[key]);
    }
    return merged;
  }
  return draft;
}

export function rebaseWorkflowDraft(
  draft: LeadAssignmentWorkflowStepSnapshot,
  previous: LeadAssignmentWorkflowStepSnapshot,
  latest: LeadAssignmentWorkflowStepSnapshot,
): LeadAssignmentWorkflowStepSnapshot {
  return applyEditedFields(
    previous,
    draft,
    latest,
  ) as LeadAssignmentWorkflowStepSnapshot;
}
