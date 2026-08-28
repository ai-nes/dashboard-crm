import {
  HomeIcon,
  PieChartIcon,
  TableIcon,
  UserIcon,
  Widget4Icon,
  WindowIcon,
} from "./icon";

export const NAV_DATA = [
  {
    label: "TRUNG TÂM ĐIỀU HÀNH",
    items: [
      {
        title: "Tổng quan tuyển sinh",
        url: "/",
        icon: <HomeIcon />,
        items: [],
      },
      {
        title: "Doanh thu & dự báo",
        url: "/director/revenue-forecast",
        icon: <TableIcon />,
        items: [],
      },
    ],
  },
  {
    label: "THỊ TRƯỜNG & TĂNG TRƯỞNG",
    items: [
      {
        title: "Thị trường tuyển sinh",
        icon: <PieChartIcon />,
        items: [
          {
            title: "Bản đồ thị trường",
            url: "/director/market-intelligence",
          },
          {
            title: "Hiệu suất khu vực",
            url: "/director/regional-performance",
          },
          {
            title: "Khám phá người học",
            url: "/director/demographics",
          },
        ],
      },
      {
        title: "Hiệu quả chiến dịch",
        url: "/director/campaign-intelligence",
        icon: <WindowIcon />,
        items: [],
      },
    ],
  },
  {
    label: "HÀNH TRÌNH TUYỂN SINH",
    items: [
      {
        title: "Hồ sơ & phễu tuyển sinh",
        icon: <UserIcon />,
        items: [
          {
            title: "Phễu tuyển sinh",
            url: "/director/sales-pipeline",
          },
          {
            title: "Phân tích trường THPT",
            url: "/director/schools",
          },
          {
            title: "Hồ sơ học sinh 360°",
            url: "/director/students",
          },
        ],
      },
    ],
  },
  {
    label: "TRÍ TUỆ & HÀNH ĐỘNG",
    items: [
      {
        title: "Hành động AI đề xuất",
        url: "/director/ai/next-best-action",
        icon: <Widget4Icon />,
        items: [],
      },
    ],
  },
];
