"use client";

import type { Student360Data } from "@/services/api/students/types";

import ApplicationCard from "./application-card";
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
import StudentSectionNavigation from "./student-section-navigation";
import StudentSourceContext from "./student-source-context";

interface Student360DashboardProps {
  data: Student360Data;
}

export default function Student360Dashboard({ data }: Student360DashboardProps) {
  return (
    <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden pb-10">
      <div className="px-2 pt-4 lg:px-6"><StudentHeader data={data} /></div>
      <StudentSectionNavigation />

      <div className="space-y-8 px-2 pt-6 lg:px-6">
        <section id="student-decision" aria-labelledby="student-decision-heading" className="scroll-mt-20">
          <StudentSectionHeading
            description="Một màn hình để quyết định nên ưu tiên ai, cần tháo gỡ gì và hành động nào có tác động lớn nhất trong 48 giờ tới."
            headingId="student-decision-heading"
            title="Quyết định cần đưa ra hôm nay"
          />
          <StudentClassificationCockpit data={data} />
        </section>

        <section id="student-context" aria-labelledby="student-context-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading
            description="Thông tin nền để cá nhân hóa tư vấn: học sinh là ai, đến từ đâu và đang được phân tầng thế nào."
            headingId="student-context-heading"
            title="Chân dung & nguồn tiếp cận"
          />
          <StudentDetailsTab data={data} />
          <StudentSourceContext data={data} />
        </section>

        <section id="student-behavior" aria-labelledby="student-behavior-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading
            description="Đọc diễn biến xác suất, chất lượng kênh và các điểm chạm đã thực sự xảy ra trong hành trình."
            headingId="student-behavior-heading"
            title="Hành vi & hành trình"
          />
          <StudentChartsSection data={data} />
          <div className="mt-4"><JourneyTimeline data={data} /></div>
        </section>

        <section id="student-family" aria-labelledby="student-family-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading
            description="Phụ huynh là người đồng quyết định trong nhiều trường hợp; tập trung vào vai trò, băn khoăn và cách tiếp cận phù hợp."
            headingId="student-family-heading"
            title="Gia đình & rào cản"
          />
          <StudentFamilyTab data={data} />
        </section>

        <section id="student-records" aria-labelledby="student-records-heading" className="scroll-mt-20 border-t border-card-border pt-7">
          <StudentSectionHeading
            description="Nhóm thông tin vận hành để hoàn tất hồ sơ, tiếp nối ghi chú và kiểm tra dấu vết xử lý."
            headingId="student-records-heading"
            title="Hồ sơ & lịch sử xử lý"
          />
          <div className="space-y-4">
            <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
              <ApplicationCard data={data} />
              <StudentDocumentsTab data={data} />
            </div>
            <StudentNotesTab data={data} />
            <StudentAuditCard />
          </div>
        </section>
      </div>
    </main>
  );
}
