"use client";

import { Calendar, RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import AnalysisDrawer from "@/components/analysis-runs/analysis-drawer";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { useAnalysisRun } from "@/hooks/use-analysis-run";
import type {
  SchoolClassification,
  SchoolIntelligenceData,
} from "@/services/api/schools/types";
import { SCHOOL_CLASSIFICATION_STRATEGIES } from "@/services/api/schools/classification";

import { getSchoolLocalityContext } from "./school-locality-data";

interface SchoolActionPlanProps {
  data: SchoolIntelligenceData;
}

const groupTone: Record<
  SchoolClassification,
  {
    badge: "success" | "primary" | "warning" | "gray";
    surface: string;
    label: string;
    title: string;
    detail: string;
  }
> = {
  "Trọng điểm": {
    badge: "success",
    surface: "bg-badge-success-background",
    label: "Trọng điểm",
    title: SCHOOL_CLASSIFICATION_STRATEGIES["Trọng điểm"].actionTitle,
    detail: SCHOOL_CLASSIFICATION_STRATEGIES["Trọng điểm"].actionDetail,
  },
  "Mở rộng": {
    badge: "primary",
    surface: "bg-badge-primary-background",
    label: "Mở rộng",
    title: SCHOOL_CLASSIFICATION_STRATEGIES["Mở rộng"].actionTitle,
    detail: SCHOOL_CLASSIFICATION_STRATEGIES["Mở rộng"].actionDetail,
  },
  "Duy trì": {
    badge: "warning",
    surface: "bg-badge-warning-background",
    label: "Duy trì",
    title: SCHOOL_CLASSIFICATION_STRATEGIES["Duy trì"].actionTitle,
    detail: SCHOOL_CLASSIFICATION_STRATEGIES["Duy trì"].actionDetail,
  },
  "Sàng lọc": {
    badge: "gray",
    surface: "bg-badge-neutral-background",
    label: "Sàng lọc",
    title: SCHOOL_CLASSIFICATION_STRATEGIES["Sàng lọc"].actionTitle,
    detail: SCHOOL_CLASSIFICATION_STRATEGIES["Sàng lọc"].actionDetail,
  },
};

export default function SchoolActionPlan({ data }: SchoolActionPlanProps) {
  const { classification, relationship, geography } = data;
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const { run, request, requestMutation, runQuery } = useAnalysisRun(
    "school",
    data.school.id,
  );
  const isAnalysisActive =
    run?.status === "queued" || run?.status === "running";
  const analysisError = requestMutation.error ?? runQuery.error;
  const handleAnalysis = () => {
    if (run && !isAnalysisActive) {
      setIsAnalysisDrawerOpen(true);
      return;
    }
    if (!data.school.id || requestMutation.isPending || isAnalysisActive)
      return;
    request({ kind: "school", highSchool: data.school.id });
  };
  const analysisButtonLabel = requestMutation.isPending
    ? "Đang gửi"
    : isAnalysisActive
      ? "Đang phân tích"
      : run
        ? "Xem phân tích"
        : "Phân tích AI";
  const locality = getSchoolLocalityContext(
    data.school,
    data.locality?.latitude !== null &&
      data.locality?.latitude !== undefined &&
      data.locality?.longitude !== null &&
      data.locality?.longitude !== undefined
      ? [data.locality.latitude, data.locality.longitude]
      : undefined,
    data.locality,
  );
  const tone = groupTone[classification.group];
  const hasContact = Boolean(
    relationship.contact &&
    !["-", "Chưa có đầu mối chính"].includes(relationship.contact),
  );
  const availableStudents =
    data.availableStudents > 0
      ? `${data.availableStudents.toLocaleString("vi-VN")} HS`
      : "-";

  const steps = hasContact
    ? [
        { title: "Chốt lịch làm việc", detail: relationship.nextTouch },
        {
          title: "Tổ chức hoạt động",
          detail: `${availableStudents} có thể tiếp cận`,
        },
        { title: "Theo dõi hồ sơ", detail: "Kiểm tra số hồ sơ mới" },
      ]
    : [
        {
          title: "Tìm người phụ trách",
          detail: "Liên hệ ban giám hiệu hoặc giáo viên hướng nghiệp",
        },
        {
          title: "Thử hoạt động nhỏ",
          detail: "Career Talk hoặc tư vấn nhóm học sinh",
        },
        {
          title: "Đánh giá lại sau 30 ngày",
          detail: "So sánh số người tiếp cận và số hồ sơ",
        },
      ];

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden p-0">
      <CardHeader className="px-5 pt-5 pb-0 lg:px-6 lg:pt-6">
        <CardTitle>Hành động tiếp theo</CardTitle>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            appearance="outline"
            isDisabled={
              !data.school.id ||
              requestMutation.isPending ||
              Boolean(isAnalysisActive)
            }
            onPress={handleAnalysis}
            size="xs"
          >
            {isAnalysisActive || run ? (
              <RefreshCircle1Clockwise
                className={
                  isAnalysisActive ? "motion-safe:animate-spin" : undefined
                }
                size={14}
                aria-hidden="true"
              />
            ) : (
              <Sparkle size={14} aria-hidden="true" />
            )}
            {analysisButtonLabel}
          </Button>
          <Badge color={tone.badge}>{tone.label}</Badge>
        </div>
      </CardHeader>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-5 lg:px-6 lg:pt-6 lg:pb-6">
        {analysisError && !isAnalysisActive && (
          <p className="mb-3 text-xs text-error-600" role="alert">
            Chưa thể hoàn tất phân tích. Bạn có thể thử lại.
          </p>
        )}
        <div>
          <h3 className="max-w-xl text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {tone.title}
          </h3>
          <p
            className="mt-3 max-w-xl text-sm leading-6 text-text-secondary"
            title={`${tone.detail} ${availableStudents} có thể tiếp cận · ${locality.distanceKm} km · ${locality.travelTime}.`}
          >
            {tone.detail}{" "}
            <strong className="font-semibold text-text-primary">
              {availableStudents} có thể tiếp cận
            </strong>{" "}
            · {locality.distanceKm} km
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-card-border py-4 sm:grid-cols-3">
          <InfoItem label="Mức độ hợp tác" value={relationship.level} />
          <InfoItem
            label="Mức độ cạnh tranh"
            value={geography.competitionDensity}
          />
          <InfoItem label="Người phụ trách" value={relationship.contact} />
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-text-primary">
            3 bước tiếp theo
          </h3>
          <ol className="mt-2 grid gap-2 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex min-w-0 items-start gap-2">
                <span className={stepTone(index)}>{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {step.title}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 text-xs leading-4 text-text-secondary"
                    title={step.detail}
                  >
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Button
            onPress={() =>
              toast.success(
                "Đã tạo lịch làm việc cho " + data.school.name + ".",
              )
            }
          >
            <Calendar size={16} />
            Đặt lịch
          </Button>
        </div>
      </div>
      {run && (
        <AnalysisDrawer
          isOpen={isAnalysisDrawerOpen}
          kind="school"
          onOpenChange={setIsAnalysisDrawerOpen}
          run={run}
          targetId={data.school.id}
          title="Phân tích School 360"
        />
      )}
    </Card>
  );
}

function stepTone(index: number) {
  if (index === 0)
    return "flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text";
  if (index === 1)
    return "flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-warning-background text-xs font-semibold text-badge-warning-text";
  return "flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-success-background text-xs font-semibold text-badge-success-text";
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p
        className="mt-1 truncate text-sm font-semibold text-text-primary"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
