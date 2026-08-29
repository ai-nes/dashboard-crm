import type { Metadata } from "next";

import StudentsOverviewDashboard from "./_components/students-overview-dashboard";

export const metadata: Metadata = {
  title: "Student 360° | AI-NES Admission Intelligence",
  description: "Hồ sơ toàn diện và hành động tuyển sinh tiếp theo cho từng học sinh.",
};

export default async function StudentsPage() {
  return <StudentsOverviewDashboard />;
}
