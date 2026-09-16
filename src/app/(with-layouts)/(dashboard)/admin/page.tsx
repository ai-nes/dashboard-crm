import type { Metadata } from "next";

import AdminOverviewPage from "@/components/common/admin/admin-overview-page";

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description: "Không gian làm việc dành cho quản trị viên hệ thống FAIP.",
};

export default function AdminPage() {
  return (
    <AdminOverviewPage
      links={[
        {
          label: "Quản lý người dùng",
          description:
            "Xem danh sách người dùng CRM, đổi vai trò hoặc gỡ quyền truy cập.",
          href: "/admin/users",
        },
        {
          label: "Cấu hình hành động NBA",
          description:
            "Thiết lập nhóm hành động, khung thời gian và quy tắc đề xuất.",
          href: "/director/admin/nba-actions",
        },
        {
          label: "Quản lý rule",
          description:
            "Tạo, kiểm tra và phát hành các CRM Rule dùng cho quy trình nghiệp vụ.",
          href: "/director/admin/rules-config",
        },
        {
          label: "Quản lý Message Template",
          description:
            "Quản lý các mẫu email dùng chung trong thư viện tạo mẫu.",
          href: "/director/admin/message-templates",
        },
        {
          label: "Quản lý segments",
          description:
            "Tạo và quản lý các nhóm học sinh dùng chung cho toàn bộ đội tuyển sinh.",
          href: "/director/admin/segments",
        },
        {
          label: "Cấu hình học sinh",
          description:
            "Quản lý Need, Tag và các danh mục dùng chung cho hồ sơ học sinh.",
          href: "/director/admin/student-config",
        },
        {
          label: "Quản lý danh mục tuyển sinh",
          description:
            "Quản lý ngành học, tỉnh thành, xã phường, trường và khu vực tuyển sinh.",
          href: "/director/admin/majors",
        },
        {
          label: "Nhật ký hoạt động",
          description:
            "Xem lịch sử hành động của toàn bộ user trong hệ thống, theo module.",
          href: "/director/admin/activity-logs",
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
