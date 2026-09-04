import type { Metadata } from "next";

import RoleWorkspacePage from "@/components/common/role-workspace/role-workspace-page";

export const metadata: Metadata = {
  title: "Không gian Lead Sale",
  description: "Không gian làm việc dành cho trưởng nhóm Sale.",
};

export default function LeadSalePage() {
  return (
    <RoleWorkspacePage
      code="LEAD SALE"
      title="Không gian Lead Sale"
      description="Theo dõi hiệu suất khu vực, phân bổ nguồn lực và hỗ trợ đội ngũ Sale theo ưu tiên."
      links={[
        {
          label: "Hiệu suất khu vực",
          description:
            "Theo dõi kết quả tuyển sinh và tải xử lý theo từng địa bàn.",
          href: "/director/regional-performance",
        },
        {
          label: "Hồ sơ học sinh 360°",
          description:
            "Kiểm tra các hồ sơ quan trọng và tình trạng chăm sóc của đội ngũ.",
          href: "/director/students",
        },
        {
          label: "Quản lý task",
          description:
            "Theo dõi task của nhóm và mở nhanh hồ sơ liên quan.",
          href: "/director/tasks",
        },
      ]}
    />
  );
}
