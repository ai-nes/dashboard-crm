"use client";

import type { Student360Data } from "@/services/api/students/types";

import AiInsight from "./ai-insight";
import ApplicationCard from "./application-card";
import JourneyTimeline from "./journey-timeline";
import ReadinessStrip from "./readiness-strip";
import StudentApplicationTab from "./student-application-tab";
import StudentAuditCard from "./student-audit-card";
import StudentChartsSection from "./student-charts-section";
import StudentDetailsTab from "./student-details-tab";
import StudentDetailCard from "./student-detail-card";
import StudentDocumentsTab from "./student-documents-tab";
import StudentEngagementTab from "./student-engagement-tab";
import StudentFamilyTab from "./student-family-tab";
import StudentHeader from "./student-header";
import StudentNotesTab from "./student-notes-tab";
import StudentSignalCard from "./student-signal-card";

interface Student360DashboardProps {
  data: Student360Data;
}

export default function Student360Dashboard({ data }: Student360DashboardProps) {
  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <StudentHeader data={data} />
      <ReadinessStrip data={data} />

      <section aria-label="Tổng quan quyết định" className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <StudentSignalCard data={data} />
        <AiInsight data={data} />
      </section>

      <StudentChartsSection data={data} />

      <section aria-label="Hành trình và hồ sơ cơ bản" className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <JourneyTimeline data={data} />
        <div className="grid min-w-0 content-start gap-5">
          <StudentDetailCard data={data} />
          <ApplicationCard data={data} />
        </div>
      </section>

      <section aria-label="Thông tin chi tiết học sinh">
        <StudentDetailsTab data={data} />
      </section>

      <section aria-label="Nguyện vọng và hồ sơ ứng tuyển">
        <StudentApplicationTab data={data} />
      </section>

      <section aria-label="Tương tác gần đây">
        <StudentEngagementTab data={data} />
      </section>

      <section aria-label="Gia đình và quyết định">
        <StudentFamilyTab data={data} />
      </section>

      <section aria-label="Tài liệu và ghi chú" className="space-y-5">
        <StudentDocumentsTab data={data} />
        <StudentNotesTab data={data} />
      </section>

      <StudentAuditCard />
    </main>
  );
}
