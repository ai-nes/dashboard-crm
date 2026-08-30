import type { Metadata } from "next";

import AdmissionFunnelDashboard from "./_components/admission-funnel-dashboard";

export const metadata: Metadata = {
  title: "Phễu tuyển sinh",
  description: "Theo dõi số hồ sơ và tỷ lệ chuyển đổi qua từng bước tuyển sinh.",
};

export default function AdmissionFunnelPage() {
  return <AdmissionFunnelDashboard />;
}
