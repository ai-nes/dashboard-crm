import type { Metadata } from "next";

import RoleWorkspacePage from "@/components/common/role-workspace/role-workspace-page";

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description: "Không gian làm việc dành cho quản trị viên hệ thống FAIP.",
};

export default function AdminPage() {
  return (
    <RoleWorkspacePage
      code="ADMIN"
      title="Quản trị hệ thống"
      description="Quản lý cấu hình nền tảng, chất lượng dữ liệu và các chính sách hỗ trợ vận hành tuyển sinh."
      links={[
        {
          label: "Cấu hình hành động NBA",
          description:
            "Thiết lập nhóm hành động, khung thời gian và quy tắc đề xuất.",
          href: "/director/admin/nba-actions",
        },
        {
          label: "Sức khỏe dữ liệu",
          description:
            "Kiểm tra nguồn dữ liệu, trạng thái đồng bộ và bản ghi cần xử lý.",
          href: "/director/data-health",
        },
        {
          label: "Trung tâm AI & dữ liệu",
          description:
            "Theo dõi tín hiệu, độ tin cậy mô hình và các cảnh báo hệ thống.",
          href: "/director/ai",
        },
      ]}
    />
  );
}
