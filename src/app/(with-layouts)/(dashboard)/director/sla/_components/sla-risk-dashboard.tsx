import { Card } from "@/components/tailgrids/core/card";

import SlaHeader from "./sla-header";
import SlaRiskCases from "./sla-risk-cases";
import SlaRiskReasons from "./sla-risk-reasons";
import SlaStatusOverview from "./sla-status-overview";
import SlaSummary from "./sla-summary";

export default function SlaRiskDashboard() {
  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <SlaHeader />
      <SlaSummary />
      <SlaStatusOverview />
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]" aria-label="Hồ sơ rủi ro và nguyên nhân">
        <SlaRiskCases />
        <SlaRiskReasons />
      </section>
      <Card className="border-warning-500/30 bg-badge-warning-background p-4">
        <p className="text-sm leading-6 text-badge-warning-text">Mốc phản hồi 8 giờ làm việc đang là dữ liệu mô phỏng. Cần chốt theo từng kênh trước khi bật cảnh báo thật.</p>
      </Card>
    </main>
  );
}
