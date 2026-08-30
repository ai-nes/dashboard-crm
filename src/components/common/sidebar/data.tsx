import {
  AlphabetIcon,
  CalendarIcon,
  ChatIcon,
  HomeIcon,
  InvoiceIcon,
  LetterIcon,
  PieChartIcon,
  TaskIcon,
  TableIcon,
  UserGroupIcon,
  Widget4Icon,
  WindowIcon,
} from "./icon";
import type { ReactNode } from "react";

interface NavigationItem {
  title: string;
  url?: string;
  icon?: ReactNode;
  items?: NavigationItem[];
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const NAV_DATA: NavigationSection[] = [
  {
    label: "A · ĐIỀU HÀNH & THỊ TRƯỜNG",
    items: [
      {
        title: "Tổng quan tuyển sinh",
        url: "/",
        icon: <HomeIcon />,
        items: [],
      },
      {
        title: "Bản đồ & trường THPT",
        url: "/director/market-intelligence",
        icon: <PieChartIcon />,
        items: [],
      },
      {
        title: "Khám phá người học",
        url: "/director/demographics",
        icon: <AlphabetIcon />,
        items: [],
      },
      {
        title: "Hiệu suất khu vực",
        url: "/director/regional-performance",
        icon: <PieChartIcon />,
        items: [],
      },
    ],
  },
  {
    label: "B · HÀNH TRÌNH & THỰC THI",
    items: [
      {
        title: "Phễu tuyển sinh",
        url: "/director/admission-funnel",
        icon: <TableIcon />,
        items: [],
      },
      {
        title: "Hành động AI đề xuất",
        url: "/director/ai/next-best-action",
        icon: <Widget4Icon />,
        items: [],
      },
      {
        title: "Hồ sơ học sinh 360°",
        url: "/director/students",
        icon: <UserGroupIcon />,
        items: [],
      },
      {
        title: "SLA & trung tâm rủi ro",
        url: "/director/sla",
        icon: <TaskIcon />,
        items: [],
      },
      {
        title: "Hoạt động trường & thực địa",
        url: "/director/school-field-activity",
        icon: <CalendarIcon />,
        items: [],
      },
    ],
  },
  {
    label: "C · TĂNG TRƯỞNG & DOANH THU",
    items: [
      {
        title: "Phân tích chiến dịch",
        url: "/director/campaign-intelligence",
        icon: <WindowIcon />,
        items: [],
      },
      {
        title: "Doanh thu & dự báo",
        url: "/director/revenue-forecast",
        icon: <InvoiceIcon />,
        items: [],
      },
    ],
  },
  {
    label: "D · AI & QUẢN TRỊ HỆ THỐNG",
    items: [
      {
        title: "Luồng tín hiệu AI",
        url: "/director/ai/command-stream",
        icon: <Widget4Icon />,
        items: [],
      },
      {
        title: "Hỏi đáp tuyển sinh AI",
        url: "/director/ai/ask-admission",
        icon: <ChatIcon />,
        items: [],
      },
      {
        title: "Độ tin cậy & sức khỏe AI",
        url: "/director/ai/trust-model-health",
        icon: <AlphabetIcon />,
        items: [],
      },
      {
        title: "Sức khỏe dữ liệu & nguồn",
        url: "/director/data-health",
        icon: <TableIcon />,
        items: [],
      },
      {
        title: "Cảnh báo & đăng ký nhận tin",
        url: "/director/alerts",
        icon: <LetterIcon />,
        items: [],
      },
    ],
  },
];
