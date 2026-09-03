import { InfoCircle } from "@tailgrids/icons";

import type { RecommendedAction } from "../types";
import { friendlyEvidence } from "./evidence";
import { buildRationaleRows } from "./rationale-model";

interface ActionRationaleProps {
  action: RecommendedAction;
}

/**
 * The shared "5 questions" block — Ai · Làm gì · Vì sao bây giờ · Dựa trên dữ
 * liệu nào · Kết quả mong đợi — reused by every card via {@link ActionCardHost}.
 */
export default function ActionRationale({ action }: ActionRationaleProps) {
  const rows = buildRationaleRows(action);
  const evidenceRefs =
    action.evidenceRefIds && action.evidenceRefIds.length > 0
      ? action.evidenceRefIds
      : action.evidence;
  const evidence = friendlyEvidence(evidenceRefs).slice(0, 4);

  if (rows.length === 0 && evidence.length === 0) return null;

  return (
    <section
      className="space-y-4 border-b border-card-border p-5"
      aria-label="Vì sao đề xuất việc này"
    >
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.id}>
            <dt className="text-xs font-medium text-text-tertiary">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm leading-6 text-text-secondary">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {evidence.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-text-tertiary">
            Dựa trên dữ liệu
          </h4>
          <ul className="mt-1.5 space-y-1.5">
            {evidence.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-6 text-text-secondary"
              >
                <InfoCircle
                  size={15}
                  className="mt-1 shrink-0 text-primary-500"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
