"use client";

import { ChevronDown, InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/tailgrids/core/collapsible";
import type {
  AnalysisClaimKind,
  AnalysisRunStage,
} from "@/services/api/analysis-runs";

import AnalysisClaimCard from "./analysis-claim-card";
import { claimKindMeta } from "./analysis-run-meta";

interface AnalysisClaimsViewProps {
  stages: AnalysisRunStage[];
}

const claimOrder: AnalysisClaimKind[] = [
  "recommendation",
  "uncertainty",
  "inference",
  "fact",
];

export default function AnalysisClaimsView({
  stages,
}: AnalysisClaimsViewProps) {
  const claims = stages.flatMap((stage) => stage.claims);

  if (!claims.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-warning-200 bg-badge-warning-background p-4 text-sm text-text-secondary">
        <InfoTriangle
          size={18}
          className="mt-0.5 shrink-0 text-warning-500"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-text-primary">
            Chưa có tín hiệu hiển thị
          </p>
          <p className="mt-1 text-xs leading-5">
            Lần phân tích đã hoàn tất nhưng chưa có nội dung trong phạm vi bạn
            được phép xem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Tín hiệu phân tích" className="space-y-3">
      {claimOrder.map((kind) => {
        const groupClaims = claims.filter((claim) => claim.claimKind === kind);
        if (!groupClaims.length) return null;

        const meta = claimKindMeta[kind];

        return (
          <Collapsible
            key={kind}
            defaultExpanded={kind === "recommendation"}
            className="max-w-none rounded-xl border-card-border bg-card-background data-expanded:pb-0"
          >
            <CollapsibleTrigger className="p-4 text-sm font-semibold text-text-primary sm:p-4">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`size-2 shrink-0 rounded-full ${meta.dotClassName}`}
                  aria-hidden="true"
                />
                <span className="truncate">{meta.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge color={meta.badgeColor} size="sm">
                  {groupClaims.length}
                </Badge>
                <ChevronDown
                  size={16}
                  className="transition-transform duration-200 group-data-expanded:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="border-t border-card-border pt-4">
                {groupClaims.map((claim, index) => (
                  <AnalysisClaimCard
                    key={`${kind}-${index}-${claim.statement.slice(0, 32)}`}
                    claim={claim}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </section>
  );
}
