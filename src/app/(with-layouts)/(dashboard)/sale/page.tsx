import type { Metadata } from "next";

import RoleWorkspacePage from "@/components/common/role-workspace/role-workspace-page";

export const metadata: Metadata = {
  title: "Không gian Sale",
  description: "Không gian làm việc dành cho tư vấn viên Sale.",
};

export default function SalePage() {
  return (
    <RoleWorkspacePage
      code="SALE"
      title="Không gian Sale"
      description="Tập trung vào hồ sơ cần chăm sóc, đề xuất hành động tiếp theo và công việc trong ngày."
      links={[
        {
          label: "Hồ sơ học sinh 360°",
          description:
            "Tra cứu hồ sơ và xem toàn bộ bối cảnh trước khi liên hệ.",
          href: "/director/students",
        },
        {
          label: "Việc cần xử lý",
          description:
            "Ưu tiên các đề xuất hành động theo mức độ khẩn cấp và cơ hội.",
          href: "/director/ai/next-best-action",
        },
        {
          label: "Quản lý task",
          description: "Theo dõi, cập nhật và hoàn thành các task được giao.",
          href: "/director/tasks",
        },
      ]}
    />
  );
}
