import type { Metadata } from "next";

import StudentsOverviewDashboard from "@/app/(with-layouts)/(dashboard)/director/students/_components/students-overview-dashboard";

export const metadata: Metadata = {
  title: "Hồ sơ học sinh 360°",
  description:
    "Hồ sơ toàn diện và hành động tuyển sinh tiếp theo cho từng học sinh.",
};

export default function SaleStudentsPage() {
  return <StudentsOverviewDashboard />;
}
