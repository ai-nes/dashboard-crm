"use client";

import { useMemo } from "react";

import { Card } from "@/components/tailgrids/core/card";
import type { DirectorNextBestActionData } from "@/services/api/director-next-best-action";

import ActionControlPolicy, {
  type ActionControlPolicyRow,
} from "./action-control-policy";
import ActionOutcomeChart from "./action-outcome-chart";
import SlaRiskCases from "../../../sla/_components/sla-risk-cases";
import SlaRiskReasons from "../../../sla/_components/sla-risk-reasons";
import type {
  SlaRiskCase,
  SlaRiskReason,
} from "../../../sla/_components/types";

interface DirectorOperationalOverviewProps {
  data?: DirectorNextBestActionData;
  isLoading: boolean;
  isError: boolean;
}

export default function DirectorOperationalOverview({
  data,
  isLoading,
  isError,
}: DirectorOperationalOverviewProps) {
  const snapshot = useMemo(
    () => (data ? adaptOperationalSnapshot(data) : null),
    [data],
  );

  return (
    <section className="space-y-4" aria-label="Dữ liệu vận hành hồ sơ">
      {isLoading && <OperationalOverviewSkeleton />}

      {!isLoading && isError && (
        <Card className="p-5" role="status">
          <p className="text-sm font-medium text-text-primary">
            Chưa có dữ liệu vận hành
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Phần theo dõi hồ sơ đã tiếp nhận chưa thể đồng bộ ở thời điểm này.
          </p>
        </Card>
      )}

      {!isLoading && !isError && snapshot && (
        <>
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
            <SlaRiskCases riskCases={snapshot.riskCases} />
            <SlaRiskReasons riskReasons={snapshot.riskReasons} />
          </div>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
            <ActionOutcomeChart outcomes={snapshot.outcomes} />
            <ActionControlPolicy policyRows={snapshot.policyRows} />
          </div>
        </>
      )}
    </section>
  );
}

function adaptOperationalSnapshot(data: DirectorNextBestActionData) {
  return {
    riskCases: data.sla.riskCases.map(
      (riskCase) =>
        ({
          studentId: riskCase.studentId,
          name: riskCase.name,
          school: riskCase.school,
          probability: riskCase.probability,
          silentFor: riskCase.silentFor,
          owner: riskCase.owner,
          priority: riskCase.priority === "high" ? "Cao" : "Theo dõi",
          href: riskCase.href,
        }) as SlaRiskCase,
    ),
    riskReasons: data.sla.riskReasons.map(
      (reason) =>
        ({
          label: reason.label,
          percentage: reason.percentage,
          detail: reason.detail,
        }) as SlaRiskReason,
    ),
    outcomes: data.outcomes.rows.map((row) => ({
      label: row.label,
      submitted: row.submitted,
      accepted: row.accepted,
      executed: row.executed,
      progressed: row.progressed,
      transitionRate: row.transitionRate,
    })),
    policyRows: data.controlPolicy.rows.map(
      (row) =>
        ({
          label: row.label,
          color:
            row.level === "automatic"
              ? "success"
              : row.level === "approval"
                ? "error"
                : "primary",
          detail: row.detail,
          action:
            row.execution === "system"
              ? "Hệ thống cập nhật"
              : row.execution === "business-rule"
                ? "Kiểm tra theo quy tắc"
                : "Người phụ trách xác nhận",
        }) as ActionControlPolicyRow,
    ),
  };
}

function OperationalOverviewSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2" role="status" aria-live="polite">
      {[1, 2, 3, 4].map((item) => (
        <Card key={item} className="min-h-32 animate-pulse-custom p-5">
          <div className="h-4 w-32 rounded-full bg-skeleton-gradient-50" />
          <div className="mt-5 h-8 w-16 rounded-full bg-skeleton-gradient-50" />
        </Card>
      ))}
      <span className="sr-only">Đang tải dữ liệu vận hành</span>
    </div>
  );
}
