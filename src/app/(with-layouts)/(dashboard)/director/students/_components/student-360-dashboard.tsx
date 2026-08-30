"use client";

import type { Student360Data } from "@/services/api/students/types";

import AiInsight from "./ai-insight";
import ApplicationContactCard from "./application-contact-card";
import ApplicationCard from "./application-card";
import JourneyTimeline from "./journey-timeline";
import ReadinessStrip from "./readiness-strip";
import StudentApplicationTab from "./student-application-tab";
import StudentAuditCard from "./student-audit-card";
import StudentChartsSection from "./student-charts-section";
import StudentClassificationCockpit from "./student-classification-cockpit";
import StudentDetailsTab from "./student-details-tab";
import StudentDocumentsTab from "./student-documents-tab";
import StudentEngagementTab from "./student-engagement-tab";
import StudentFamilyTab from "./student-family-tab";
import StudentHeader from "./student-header";
import StudentNotesTab from "./student-notes-tab";
import StudentSectionHeading from "./student-section-heading";
import StudentSectionNavigation from "./student-section-navigation";
import StudentSignalCard from "./student-signal-card";
import StudentSourceContext from "./student-source-context";

interface Student360DashboardProps {
  data: Student360Data;
}

export default function Student360Dashboard({ data }: Student360DashboardProps) {
  return (
    <main id="main-content" className="min-w-0 max-w-full overflow-x-hidden pb-10">
      <div className="px-2 pt-4 lg:px-6"><StudentHeader data={data} /></div>
      <StudentSectionNavigation />

      <div className="space-y-12 px-2 pt-8 lg:px-6">
        <section id="student-decision" aria-labelledby="student-decision-heading" className="scroll-mt-20">
          <StudentSectionHeading
            description="Tập trung vào khả năng nhập học, rào cản và hành động có tác động lớn nhất trong 48 giờ tới."
            headingId="student-decision-heading"
            title="Quyết định cần đưa ra hôm nay"
          />
          <div className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <StudentSignalCard data={data} />
            <AiInsight data={data} />
          </div>
          <StudentClassificationCockpit data={data} />
          <div className="mt-5"><ReadinessStrip data={data} /></div>
        </section>

        <section id="student-analytics" aria-labelledby="student-analytics-heading" className="scroll-mt-20 border-t border-card-border pt-9">
          <StudentSectionHeading
            description="Đọc diễn biến xác suất cùng chất lượng từng kênh để hiểu động lực tăng trưởng, không chỉ nhìn một con số tổng."
            headingId="student-analytics-heading"
            title="Xác suất và hành vi"
          />
          <StudentChartsSection data={data} />
        </section>

        <section id="student-journey" aria-labelledby="student-journey-heading" className="scroll-mt-20 border-t border-card-border pt-9">
          <StudentSectionHeading
            description="Các mốc đã xảy ra, trạng thái ứng tuyển hiện tại và điểm chuyển tiếp cần được kích hoạt tiếp theo."
            headingId="student-journey-heading"
            title="Hành trình đến quyết định"
          />
          <div className="grid min-w-0 items-start gap-5 xl:items-stretch xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <JourneyTimeline data={data} />
            <div className="grid min-w-0 content-start gap-5 xl:flex xl:flex-col">
              <ApplicationCard data={data} />
              <div className="xl:flex-1">
                <ApplicationContactCard data={data} />
              </div>
            </div>
          </div>
        </section>

        <section id="student-profile" aria-labelledby="student-profile-heading" className="scroll-mt-20 border-t border-card-border pt-9">
          <StudentSectionHeading
            description="Thông tin định danh và nền tảng học thuật phục vụ cá nhân hóa nội dung tư vấn."
            headingId="student-profile-heading"
            title="Chân dung học sinh"
          />
          <StudentDetailsTab data={data} />
          <StudentSourceContext data={data} />
          <div className="mt-5"><StudentApplicationTab data={data} /></div>
        </section>

        <section id="student-engagement" aria-labelledby="student-engagement-heading" className="scroll-mt-20 border-t border-card-border pt-9">
          <StudentSectionHeading
            description="Cường độ, chất lượng và ngữ cảnh của các điểm chạm gần đây trên từng kênh."
            headingId="student-engagement-heading"
            title="Tương tác gần đây"
          />
          <StudentEngagementTab data={data} />
        </section>

        <section id="student-family" aria-labelledby="student-family-heading" className="scroll-mt-20 border-t border-card-border pt-9">
          <StudentSectionHeading
            description="Người ảnh hưởng, rào cản tài chính và lịch sử trao đổi liên quan trực tiếp đến quyết định cuối."
            headingId="student-family-heading"
            title="Gia đình và rào cản"
          />
          <StudentFamilyTab data={data} />
        </section>

        <section id="student-records" aria-labelledby="student-records-heading" className="scroll-mt-20 border-t border-card-border pt-9">
          <StudentSectionHeading
            description="Tài liệu, ghi chú nội bộ, nhắc việc và dấu vết kiểm soát được giữ nguyên trên cùng một luồng đọc."
            headingId="student-records-heading"
            title="Tài liệu và lịch sử xử lý"
          />
          <div className="space-y-5">
            <StudentDocumentsTab data={data} />
            <StudentNotesTab data={data} />
            <StudentAuditCard />
          </div>
        </section>
      </div>
    </main>
  );
}
