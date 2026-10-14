"use client";

import { InfoCircle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import { useAuth } from "@/components/common/auth/auth-provider";
import { getNpsDashboardAccess } from "@/components/common/auth/permissions";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useInteractionNpsPointQuery } from "@/hooks/use-interaction-intelligence-queries";

interface StudentCallQualityScoreProps {
  interactionId: string;
}

export default function StudentCallQualityScore({ interactionId }: StudentCallQualityScoreProps) {
  const { user } = useAuth();
  const access = getNpsDashboardAccess(user);
  const viewerKey = user?.crm_user_id ?? user?.email ?? user?.user ?? "";
  const query = useInteractionNpsPointQuery(
    interactionId,
    access.canRead,
    viewerKey,
  );
  const point = query.data?.point;

  if (!access.canRead) return null;

  return (
    <section
      aria-labelledby={`call-quality-${interactionId}`}
      className="min-w-0 rounded-lg border border-card-border bg-background-gray-secondary/40 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id={`call-quality-${interactionId}`} className="text-sm font-semibold text-text-primary">
            Chất lượng cuộc gọi · NPS
          </h3>
          <p className="mt-1 text-xs text-text-tertiary">Thang điểm 1–10</p>
        </div>
        {point ? (
          <Badge color={point.status === "scored" ? "success" : "warning"} size="sm">
            {point.status === "scored" ? "Đã chấm" : "Tạm dừng chấm"}
          </Badge>
        ) : null}
      </div>

      {query.isPending ? <Skeleton className="mt-4 h-14 w-full rounded-lg" aria-busy="true" /> : null}

      {query.isError ? (
        <div className="mt-3 rounded-lg bg-badge-error-background p-3 text-sm text-error-600" role="alert">
          <p className="flex items-start gap-2">
            <InfoCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Không thể tải điểm chất lượng cuộc gọi.</span>
          </p>
          <Button
            type="button"
            appearance="ghost"
            size="sm"
            className="mt-2 min-h-10 px-0"
            onPress={() => void query.refetch()}
          >
            <RefreshCircle1Clockwise size={16} />
            Thử lại
          </Button>
        </div>
      ) : null}

      {!query.isPending && !query.isError && !point ? (
        <p className="mt-3 text-sm text-text-secondary">Cuộc gọi chưa có điểm chất lượng.</p>
      ) : null}

      {point?.status === "abstained" ? (
        <p className="mt-3 rounded-lg bg-badge-warning-background p-3 text-sm leading-5 text-badge-warning-text">
          Chưa đủ dữ liệu để chấm điểm an toàn.
        </p>
      ) : null}

      {point?.status === "scored" ? (
        <div className="mt-3 flex items-baseline justify-between gap-3 rounded-lg border border-card-border/70 bg-card-background p-3">
          <span className="text-sm text-text-secondary">Điểm chất lượng</span>
          <span className="text-2xl font-semibold tabular-nums text-text-primary">
            {point.total_score?.toFixed(1) ?? "—"}
            <span className="text-sm font-normal text-text-tertiary">/10</span>
          </span>
        </div>
      ) : null}
    </section>
  );
}
