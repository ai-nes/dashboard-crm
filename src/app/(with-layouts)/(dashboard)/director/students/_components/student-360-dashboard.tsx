"use client";

import { Card } from "@/components/tailgrids/core/card";
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
import StudentSectionHeading from "./student-section-heading";
import StudentSourceContext from "./student-source-context";

interface Student360DashboardProps {
  studentId?: string;
  initialData?: Student360Data | null;
  data?: Student360Data;
}

export default function Student360Dashboard({ studentId, initialData, data: propData }: Student360DashboardProps) {
  const targetId = studentId || propData?.student.code || propData?.student.name || "nguyen-minh-an";
  const { data: queryData, isError, error } = useStudent360Query(targetId, {
    initialData: initialData ?? propData ?? undefined,
    enabled: Boolean(targetId),
  });

  const data = queryData ?? initialData ?? propData;

  if (isError && !data) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="font-semibold text-base">Không thể tải hồ sơ học sinh từ Frappe CRM</p>
          <p className="mt-1 text-sm">{error?.message || "Lỗi 403 Forbidden hoặc không tìm thấy hồ sơ."}</p>
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
    <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden pb-10">
      {isError && (
        <div className="px-2 pt-4 lg:px-6">
          <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
            <p className="font-semibold text-sm">Cảnh báo: Lỗi khi đồng bộ từ Frappe CRM</p>
            <p className="mt-1 text-xs">{error?.message}</p>
          </Card>
        </div>
      )}
      <div className="px-2 pt-4 lg:px-6"><StudentHeader data={data} /></div>

      <div className="space-y-8 px-2 pt-6 lg:px-6">
        <section id="student-decision" aria-labelledby="student-decision-heading" className="scroll-mt-20">
          <StudentSectionHeading headingId="student-decision-heading" title="Quyết định chăm sóc" />
          <StudentClassificationCockpit data={data} />
        </section>

        <section id="student-context" aria-labelledby="student-context-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading headingId="student-context-heading" title="Thông tin hồ sơ" />
          <StudentDetailsTab data={data} />
          <StudentSourceContext data={data} />
        </section>

        <section id="student-behavior" aria-labelledby="student-behavior-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading headingId="student-behavior-heading" title="Mức độ quan tâm" />
          <StudentChartsSection data={data} />
          <div className="mt-4"><JourneyTimeline data={data} /></div>
        </section>

        <section id="student-family" aria-labelledby="student-family-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading headingId="student-family-heading" title="Gia đình" />
          <StudentFamilyTab data={data} />
        </section>

        <section id="student-records" aria-labelledby="student-records-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading headingId="student-records-heading" title="Hồ sơ ứng tuyển" />
          <div className="space-y-4">
            <StudentDocumentsTab data={data} />
            <StudentNotesTab data={data} />
            <StudentAuditCard data={data} />
          </div>
        </section>
      </div>
    </main>
  );
}
