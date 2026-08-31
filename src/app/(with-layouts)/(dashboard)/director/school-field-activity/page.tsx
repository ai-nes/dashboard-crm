import type { Metadata } from "next";

import SchoolFieldActivityDashboard from "./_components/school-field-activity-dashboard";

export const metadata: Metadata = {
  title: "Hoạt động trường & thực địa",
  description: "Theo dõi hoạt động đã triển khai, kết quả thu được và chất lượng dữ liệu thực địa.",
};

export default function SchoolFieldActivityPage() {
  return <SchoolFieldActivityDashboard />;
}
