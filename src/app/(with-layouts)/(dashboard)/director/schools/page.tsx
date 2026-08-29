import type { Metadata } from "next";

import SchoolReportDashboard from "./_components/school-report-dashboard";
import { getSchoolReport } from "@/services/api/schools/school-directory";

export const metadata: Metadata = {
  title: "School Intelligence | AI-NES Admission Intelligence",
  description: "Tra cứu và phân tích tiềm năng tuyển sinh tại từng trường THPT.",
};

export default async function SchoolsPage() {
  const report = await getSchoolReport();
  return <SchoolReportDashboard data={report} />;
}
