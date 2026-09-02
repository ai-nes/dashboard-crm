import { ClockThree, MapMarker5, Target3, TrendUp2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import { getSchoolLocalityContext } from "./school-locality-data";

interface SchoolDecisionBriefProps {
  data: SchoolIntelligenceData;
}

type DecisionTone = "success" | "primary" | "warning" | "gray";

interface DecisionState {
  issue: string;
  issueDetail: string;
  action: string;
  actionDetail: string;
  tone: DecisionTone;
}

export default function SchoolDecisionBrief({
  data,
}: SchoolDecisionBriefProps) {
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
  const decision = getDecisionState(data, locality.distanceKm);
  const availableStudents =
    data.availableStudents > 0
      ? `${data.availableStudents.toLocaleString("vi-VN")} HS có thể tiếp cận`
      : "Cần cập nhật tệp học sinh";

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Tóm tắt điều hành"
    >
      <BriefItem
        icon={<MapMarker5 size={16} />}
        label="Địa bàn"
        value={`${data.school.district}, ${data.school.province}`}
        detail={`${locality.distanceKm} km đến campus · ${locality.travelTime}`}
      />
      <BriefItem
        icon={<TrendUp2 size={16} />}
        label="Cơ hội tuyển sinh"
        value={availableStudents}
        detail={`Tiềm năng ${data.potentialScore}/100 · ${data.geography.cluster}`}
        tone="success"
      />
      <BriefItem
        icon={<Target3 size={16} />}
        label="Tình trạng cần xử lý"
        value={decision.issue}
        detail={`Quan hệ: ${data.relationship.level} · Cạnh tranh: ${data.geography.competitionDensity}`}
        tone={decision.tone}
      />
      <BriefItem
        icon={<ClockThree size={16} />}
        label="Việc cần làm ngay"
        value={decision.action}
        detail={decision.actionDetail}
        tone={decision.tone}
        emphasized
      />
    </section>
  );
}

function BriefItem({
  icon,
  label,
  value,
  detail,
  tone,
  emphasized = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: DecisionTone;
  emphasized?: boolean;
}) {
  const accentClass =
    tone === "warning"
      ? "bg-badge-warning-background text-badge-warning-text"
      : tone === "success"
        ? "bg-badge-success-background text-badge-success-text"
        : tone === "primary"
          ? "bg-badge-primary-background text-badge-primary-text"
          : "bg-badge-neutral-background text-badge-neutral-text";

  return (
    <div
      className={
        "min-w-0 rounded-xl border border-card-border p-3 " +
        (emphasized ? "bg-background-soft-50" : "bg-card-background")
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={
            "flex size-7 shrink-0 items-center justify-center rounded-lg " +
            accentClass
          }
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="truncate text-xs text-text-tertiary">{label}</p>
        {emphasized && (
          <Badge className="ml-auto shrink-0" color={tone}>
            Ngay
          </Badge>
        )}
      </div>
      <p
        className="mt-2 truncate text-sm font-semibold leading-5 text-text-primary"
        title={value}
      >
        {value}
      </p>
      <p
        className="mt-1 truncate text-xs leading-5 text-text-secondary"
        title={detail}
      >
        {detail}
      </p>
    </div>
  );
}

function getDecisionState(
  data: SchoolIntelligenceData,
  distanceKm: number,
): DecisionState {
  const noContact =
    !data.relationship.contact ||
    ["-", "Chưa có đầu mối chính"].includes(data.relationship.contact);

  if (noContact || data.relationship.level === "Chưa tiếp xúc") {
    return {
      issue: "Chưa có đầu mối làm việc",
      issueDetail: "Quan hệ với trường chưa được thiết lập rõ ràng.",
      action: "Xác định người phụ trách",
      actionDetail: "Liên hệ ban giám hiệu hoặc giáo viên hướng nghiệp",
      tone: "warning",
    };
  }

  if (["Đã tiếp xúc", "Có đầu mối"].includes(data.relationship.level)) {
    return {
      issue: "Quan hệ chưa đủ bền",
      issueDetail: `Đã có đầu mối ${data.relationship.contact}; cần tạo nhịp làm việc định kỳ.`,
      action: "Chốt lịch làm việc với đầu mối",
      actionDetail:
        data.relationship.nextTouch || "Xác nhận thời gian gặp trong tuần này",
      tone: "primary",
    };
  }

  if (data.geography.competitionDensity === "Cao") {
    return {
      issue: "Cạnh tranh tuyển sinh cao",
      issueDetail:
        "Cần hiện diện đều để giữ lợi thế với học sinh và phụ huynh.",
      action: "Tăng một hoạt động tại trường",
      actionDetail: "Ưu tiên Career Talk hoặc tư vấn nhóm khối 12",
      tone: "warning",
    };
  }

  if (distanceKm >= 70) {
    return {
      issue: "Khoảng cách đến campus xa",
      issueDetail: `Di chuyển mất ${data.geography.travelTime}; học sinh cần thêm lý do để đi trải nghiệm.`,
      action: "Chốt campus tour theo nhóm",
      actionDetail: "Kết hợp tư vấn online và thông tin học bổng, lưu trú",
      tone: "primary",
    };
  }

  return {
    issue: "Cần duy trì đà hợp tác",
    issueDetail: `Mức hợp tác hiện tại: ${data.relationship.level.toLocaleLowerCase("vi-VN")}.`,
    action: "Giữ quan hệ, tăng hoạt động",
    actionDetail:
      data.relationship.nextTouch || "Chốt hoạt động tiếp theo với trường",
    tone: "success",
  };
}
