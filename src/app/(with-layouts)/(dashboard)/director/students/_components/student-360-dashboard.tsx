"use client";

import { Card } from "@/components/tailgrids/core/card";
import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import { useStudent360Query } from "@/hooks/use-students-queries";
import type { Student360Data } from "@/services/api/students/types";

import JourneyTimeline from "./journey-timeline";
import StudentAuditCard from "./student-audit-card";
import StudentChartsSection from "./student-charts-section";
import StudentClassificationCockpit from "./student-classification-cockpit";
import StudentDetailsTab from "./student-details-tab";
import StudentDocumentsTab from "./student-documents-tab";
import StudentFamilyTab from "./student-family-tab";
import StudentHeader from "./student-header";
import StudentNotesTab from "./student-notes-tab";
import StudentSourceContext from "./student-source-context";

interface Student360DashboardProps {
  studentId?: string;
  initialData?: Student360Data | null;
  data?: Student360Data;
}

export default function Student360Dashboard({
  studentId,
  initialData,
  data: propData,
}: Student360DashboardProps) {
  const targetId =
    studentId ||
    propData?.student.code ||
    propData?.student.name ||
    "nguyen-minh-an";
  const {
    data: queryData,
    isError,
    error,
  } = useStudent360Query(targetId, {
    initialData: initialData ?? propData ?? undefined,
    enabled: Boolean(targetId),
  });

  const data = queryData ?? initialData ?? propData;

  if (isError && !data) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="font-semibold text-base">
            Không thể tải hồ sơ học sinh từ Frappe CRM
          </p>
          <p className="mt-1 text-sm">
            {error?.message || "Lỗi 403 Forbidden hoặc không tìm thấy hồ sơ."}
          </p>
        </Card>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <p className="text-text-tertiary">Đang tải hồ sơ học sinh...</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-w-0 max-w-full overflow-x-clip pb-10"
    >
      {isError && (
        <div className="px-2 pt-4 lg:px-6">
          <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
            <p className="font-semibold text-sm">
              Cảnh báo: Lỗi khi đồng bộ từ Frappe CRM
            </p>
            <p className="mt-1 text-xs">{error?.message}</p>
          </Card>
        </div>
      )}
      <div className="px-2 pt-4 lg:px-6">
        <StudentHeader data={data} />
      </div>

      <div className="px-2 pt-4 lg:px-6">
        <DetailTabs
          ariaLabel="Các phần trong hồ sơ học sinh"
          defaultSelectedKey="decision"
          tabs={getStudentTabs(data, targetId)}
        />
      </div>
    </main>
  );
}

function getStudentTabs(
  data: Student360Data,
  analysisTargetId: string,
): DetailTabItem[] {
  return [
    {
      id: "decision",
      label: "Hành động tiếp theo",
      content: (
        <StudentClassificationCockpit
          data={data}
          analysisTargetId={analysisTargetId}
        />
      ),
    },
    {
      id: "profile",
      label: "Thông tin hồ sơ",
      content: (
        <div className="space-y-4">
          <StudentDetailsTab data={data} />
          <StudentSourceContext data={data} />
        </div>
      ),
    },
    {
      id: "engagement",
      label: "Mức độ quan tâm",
      content: (
        <div className="space-y-4">
          <StudentChartsSection data={data} />
          <JourneyTimeline data={data} />
        </div>
      ),
    },
    {
      id: "family",
      label: "Gia đình",
      content: <StudentFamilyTab data={data} />,
    },
    {
      id: "records",
      label: "Hồ sơ ứng tuyển",
      content: <StudentDocumentsTab data={data} />,
    },
    {
      id: "follow-up",
      label: "Ghi chú & nhật ký",
      content: (
        <div className="space-y-4">
          <StudentNotesTab data={data} />
          <StudentAuditCard data={data} />
        </div>
      ),
    },
  ];
}
