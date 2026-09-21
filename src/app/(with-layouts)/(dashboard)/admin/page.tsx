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
          label: "Cấu hình gợi ý NBA",
          description: "Thiết lập hành động, khung giờ và quy tắc gợi ý.",
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
          label: "Quản lý segment",
          description: "Tạo và quản lý segment dùng chung.",
          href: "/director/admin/segments",
        },
        {
          label: "Cấu hình hồ sơ học sinh",
          description:
            "Quản lý nhu cầu, thẻ và các danh mục dùng chung cho hồ sơ học sinh.",
          href: "/director/admin/student-config",
        },
        {
          label: "Cấu hình điểm tiềm năng",
          description:
            "Quản lý mẫu chấm điểm và quy tắc tính điểm tiềm năng.",
          href: "/director/admin/catalogs",
        },
        {
          label: "Danh mục tuyển sinh",
          description:
            "Quản lý ngành học, địa bàn, trường, năm tuyển sinh và kênh chiến dịch.",
          href: "/director/admin/majors",
        },
        {
          label: "Nhật ký hoạt động",
          description:
            "Xem lịch sử hoạt động của mọi người dùng theo từng nhóm chức năng.",
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
