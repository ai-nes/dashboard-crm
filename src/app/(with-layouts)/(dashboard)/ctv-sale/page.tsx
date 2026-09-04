import type { Metadata } from "next";

import RoleWorkspacePage from "@/components/common/role-workspace/role-workspace-page";

export const metadata: Metadata = {
  title: "Không gian CTV Sale",
  description: "Không gian làm việc dành cho cộng tác viên Sale.",
};

export default function CtvSalePage() {
  return (
    <RoleWorkspacePage
      code="CTV SALE"
      title="Không gian CTV Sale"
      description="Theo dõi hồ sơ được phân công và các việc cần hoàn tất trong quá trình tư vấn."
      links={[
        {
          label: "Hồ sơ học sinh 360°",
          description:
            "Xem thông tin hồ sơ và lịch sử tương tác trước khi follow-up.",
          href: "/director/students",
        },
        {
          label: "Việc cần xử lý",
          description:
            "Mở danh sách đề xuất hành động cho các hồ sơ đang phụ trách.",
          href: "/director/ai/next-best-action",
        },
        {
          label: "Quản lý task",
          description: "Cập nhật tiến độ và ghi nhận kết quả công việc.",
          href: "/director/tasks",
        },
      ]}
    />
  );
}
