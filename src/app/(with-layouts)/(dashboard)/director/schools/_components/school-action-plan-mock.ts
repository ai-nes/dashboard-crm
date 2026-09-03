import type { AnalysisReport } from "@/services/api/analysis-runs";
import type {
  SchoolActivity,
  SchoolIntelligenceData,
} from "@/services/api/schools/types";

export interface SchoolActionPlanMock {
  data: SchoolIntelligenceData;
  report: AnalysisReport;
}

/**
 * Temporary presentation data for the School 360 action-plan cockpit.
 * Keep this object isolated so the UI can switch back to API data later.
 */
export function buildSchoolActionPlanMock(
  source: SchoolIntelligenceData,
): SchoolActionPlanMock {
  const schoolName = source.school.name;
  const relationship: SchoolIntelligenceData["relationship"] = {
    level: "Hợp tác thường xuyên",
    score: 80,
    contact: "Nguyễn Văn A",
    contactRole: "Ban giám hiệu",
    lastTouch: "01/08/2026",
    nextTouch: "09/09/2026",
    source: "CRM School Stakeholder",
  };
  const classification = {
    group: "Trọng điểm" as const,
    isKeyAccount: true,
    label: "Trường ưu tiên phát triển quan hệ",
    action:
      "Xác nhận lịch Career Talk và gửi bộ tài liệu hướng nghiệp cho trường.",
  };
  const activities = buildActivities();
  const data: SchoolIntelligenceData = {
    ...source,
    potentialScore: 80,
    dataFreshness: "2026-09-02T17:54:06+07:00",
    relationship,
    relationshipResponse,
    classification,
    classificationResponse: classification,
    activities,
    activitiesResponse: activities.map((activity) => ({
      activityType: activity.title,
      occurredAt: activity.status === "completed" ? activity.date : null,
      scheduledAt: activity.status === "scheduled" ? activity.date : null,
      status: activity.status,
      outcome: activity.outcome ?? null,
      attendance: null,
    })),
    dataSources: {
      ...source.dataSources,
      directory: "CRM High School",
      relationship: "CRM School Stakeholder",
    },
    dataAvailability: {
      status: "available",
      sections: {
        ...source.dataAvailability?.sections,
        identity: "available",
        relationship: "available",
        activities: "available",
      },
      fields: {
        ...source.dataAvailability?.fields,
        potentialScore: "available",
      },
    },
  };

  return {
    data,
    report: {
      title: `Ưu tiên phát triển quan hệ với ${schoolName}`,
      summary: `Trường ${schoolName} đang có nền tảng hợp tác tốt với điểm quan hệ 80/100. Đây là thời điểm phù hợp để chốt hoạt động hướng nghiệp tiếp theo và mở rộng tiếp cận học sinh khối 12.`,
      risks: [
        {
          kind: "risk",
          headline: "Chưa chốt lịch hoạt động tuyển sinh tháng tới",
          detail:
            "Lịch Career Talk đang ở trạng thái chờ xác nhận, có thể làm gián đoạn nhịp tiếp cận học sinh khối 12.",
          confidence: 0.84,
          provenanceIds: ["CRM School Activity"],
        },
        {
          kind: "risk",
          headline: "Thông tin nhu cầu tuyển sinh của trường chưa đầy đủ",
          detail:
            "Chưa có cập nhật mới về quy mô học sinh và nhóm ngành được quan tâm trong kỳ tuyển sinh hiện tại.",
          confidence: 0.72,
          provenanceIds: ["CRM High School"],
        },
      ],
      recommendations: [
        {
          kind: "recommendation",
          headline: "Xác nhận lịch Career Talk với Ban giám hiệu",
          detail:
            "Gửi lại đề xuất lịch và bộ tài liệu hướng nghiệp trước lần liên hệ tiếp theo ngày 09/09/2026.",
          confidence: 0.91,
          provenanceIds: ["CRM School Stakeholder", "CRM School Activity"],
        },
        {
          kind: "opportunity",
          headline: "Mở rộng tiếp cận học sinh khối 12",
          detail:
            "Quan hệ hợp tác thường xuyên và hoạt động tư vấn đã hoàn thành tạo nền tảng để triển khai thêm một điểm chạm cho khối 12.",
          confidence: 0.78,
          provenanceIds: ["CRM School Stakeholder"],
        },
      ],
      missingEvidence: [],
    },
  };
}

const relationshipResponse: NonNullable<
  SchoolIntelligenceData["relationshipResponse"]
> = {
  level: "Hợp tác thường xuyên",
  score: 80,
  contact: "Nguyễn Văn A",
  contactRole: "Ban giám hiệu",
  lastTouch: "01/08/2026",
  nextTouch: "09/09/2026",
};

function buildActivities(): SchoolActivity[] {
  return [
    {
      id: "school-action-plan-career-talk",
      type: "Career Talk",
      title: "Career Talk",
      date: "12/09/2026 · 08:00",
      owner: "Tư vấn tuyển sinh",
      status: "scheduled",
    },
    {
      id: "school-action-plan-orientation",
      type: "Tư vấn",
      title: "Tư vấn hướng nghiệp",
      date: "20/08/2026 · 08:00",
      owner: "Tư vấn tuyển sinh",
      status: "completed",
      outcome: "Positive · 120 học sinh tham dự",
    },
    {
      id: "school-action-plan-principal",
      type: "Gặp phụ huynh",
      title: "Gặp Ban giám hiệu",
      date: "01/08/2026 · 14:00",
      owner: "Tư vấn tuyển sinh",
      status: "completed",
      outcome: "Đã thống nhất đầu mối phối hợp",
    },
  ];
}
