import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Cảnh báo & đăng ký nhận tin",
  description: "Cấu hình ngưỡng cảnh báo, kênh nhận và báo cáo định kỳ.",
};

export default function AlertsSubscriptionsPage() {
  return (
    <DirectorWorkspacePage
      code="M-18"
      title="Cảnh báo và lịch nhận tin"
      description="Gửi tín hiệu quan trọng đến đúng người theo ngưỡng cảnh báo, kênh nhận và lịch báo cáo."
      metrics={[]}
      sections={[]}
      notice="Chỉ kết nối kênh gửi thực tế sau khi chốt phân quyền theo vai trò và chính sách nhận thông báo."
    />
  );
}
