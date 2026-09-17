import type { Metadata } from "next";

import ActivityLogsPage from "@/components/activity-log/activity-logs-page";

export const metadata: Metadata = {
  title: "Nhật ký hoạt động",
  description: "Theo dõi hoạt động của mọi người dùng trong hệ thống.",
};

export default function DirectorAdminActivityLogsPage() {
  return <ActivityLogsPage />;
}
