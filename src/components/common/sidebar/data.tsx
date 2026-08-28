import {
  AlphabetIcon,
  HomeIcon,
  PieChartIcon,
  TableIcon,
  UserIcon,
  Widget4Icon,
  WindowIcon
} from "./icon";

export const NAV_DATA = [
  {
    label: "KHU VỰC GIÁM ĐỐC",
    items: [
      {
        title: "Trung tâm điều hành",
        icon: <HomeIcon />,
        items: [
          {
            title: "Tổng quan tuyển sinh",
            url: "/",
          },
          {
            title: "Báo cáo điều hành",
            url: "/director/reports",
          },
        ],
      },
      {
        title: "Vận hành tuyển sinh",
        icon: <UserIcon />,
        items: [
          {
            title: "Phễu hồ sơ",
            url: "/director/students",
          },
          {
            title: "Rà soát tiếp nhận",
            url: "/director/intake-review",
          },
          {
            title: "Hàng đợi hồ sơ",
            url: "/director/student-pool",
          },
          {
            title: "Yêu cầu phân công",
            url: "/director/routing-requests",
          },
          {
            title: "Theo dõi SLA",
            url: "/director/sla",
          },
        ],
      },
      {
        title: "Nhập học",
        icon: <TableIcon />,
        items: [
          {
            title: "Hồ sơ xét tuyển & trúng tuyển",
            url: "/director/enrollment/pipeline",
          },
          {
            title: "Hàng đợi chuyển đổi",
            url: "/director/enrollment/conversion",
          },
          {
            title: "Đối soát chuyển đổi",
            url: "/director/enrollment/reconciliation",
          },
        ],
      },
    ],
  },
  {
    label: "PHÂN TÍCH & TĂNG TRƯỞNG",
    items: [
      {
        title: "Tiếp thị & phân bổ",
        icon: <PieChartIcon />,
        items: [
          {
            title: "Chiến dịch",
            url: "/director/marketing/campaigns",
          },
          {
            title: "Chi phí & hiệu quả",
            url: "/director/marketing/roi",
          },
          {
            title: "Sự kiện & tham gia",
            url: "/director/marketing/events",
          },
          {
            title: "Điểm chạm & phân bổ",
            url: "/director/marketing/attribution",
          },
        ],
      },
      {
        title: "Phân tích AI",
        icon: <Widget4Icon />,
        items: [
          {
            title: "Phân tích hồ sơ",
            url: "/director/ai/lead-insights",
          },
          {
            title: "Chấm điểm & tín hiệu",
            url: "/director/ai/scoring",
          },
          {
            title: "Cảnh báo rủi ro",
            url: "/director/ai/risk-flags",
          },
          {
            title: "Đề xuất hành động",
            url: "/director/ai/recommendations",
          },
        ],
      },
      {
        title: "Tương tác & công việc",
        icon: <AlphabetIcon />,
        items: [
          {
            title: "Tương tác & kết quả",
            url: "/director/interactions",
          },
          {
            title: "Công việc tư vấn",
            url: "/director/tasks",
          },
          {
            title: "Dòng thời gian",
            url: "/director/activity",
          },
        ],
      },
    ],
  },
  {
    label: "CẤU HÌNH HỆ THỐNG",
    items: [
      {
        title: "Tổ chức & học thuật",
        icon: <WindowIcon />,
        items: [
          {
            title: "Cơ sở đào tạo",
            url: "/director/organization/campuses",
          },
          {
            title: "Đội ngũ & nhân sự",
            url: "/director/organization/teams",
          },
          {
            title: "Niên khóa tuyển sinh",
            url: "/director/academic/admission-years",
          },
          {
            title: "Ngành & chương trình",
            url: "/director/academic/programs",
          },
          {
            title: "Trường THPT & khu vực",
            url: "/director/academic/schools",
          },
          {
            title: "Học phí, học bổng & chỉ tiêu",
            url: "/director/academic/policies",
          },
        ],
      },
      {
        title: "Quản trị & kiểm soát",
        icon: <PieChartIcon />,
        items: [
          {
            title: "Trung tâm phê duyệt",
            url: "/director/governance/approvals",
          },
          {
            title: "Thay đổi danh mục",
            url: "/director/governance/master-data",
          },
          {
            title: "Nhật ký kiểm toán",
            url: "/director/governance/audit",
          },
          {
            title: "Chất lượng dữ liệu",
            url: "/director/governance/data-quality",
          },
        ],
      },
      {
        title: "Tài khoản cá nhân",
        url: "/profile",
        icon: <UserIcon />,
        items: [],
      },
    ],
  },
];
