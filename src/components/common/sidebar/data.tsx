import {
  AlphabetIcon,
  CalendarIcon,
  ChatIcon,
  HomeIcon,
  InvoiceIcon,
  PieChartIcon,
  TableIcon,
  UserGroupIcon,
  Widget4Icon,
  WindowIcon,
} from "./icon";
import type { ReactNode } from "react";

interface NavigationItem {
  title: string;
  url?: string;
  exact?: boolean;
  icon?: ReactNode;
  items?: NavigationItem[];
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const NAV_DATA: NavigationSection[] = [
  {
    label: "TỔNG QUAN",
    items: [
      {
        title: "Tổng quan tuyển sinh",
        url: "/",
        icon: <HomeIcon />,
        items: [],
      },
      {
        title: "Chatbot CRM",
        url: "/crm-chatbot",
        icon: <ChatIcon />,
        items: [],
      },
    ],
  },
  {
    label: "THỊ TRƯỜNG & NGƯỜI HỌC",
    items: [
      {
        title: "Trường THPT 360°",
        url: "/director/market-intelligence",
        icon: <PieChartIcon />,
        items: [],
      },
      {
        title: "Hiệu suất khu vực",
        url: "/director/regional-performance",
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
        title: "Hồ sơ học sinh 360°",
        url: "/director/students",
        icon: <UserGroupIcon />,
        items: [],
      },
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      {
        title: "Phễu tuyển sinh",
        url: "/director/admission-funnel",
        icon: <TableIcon />,
        items: [],
      },
      {
        title: "Việc cần xử lý",
        url: "/director/ai/next-best-action",
        icon: <Widget4Icon />,
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
    label: "TĂNG TRƯỞNG & DOANH THU",
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
    label: "AI, DỮ LIỆU & THIẾT LẬP",
    items: [
      {
        title: "Trung tâm AI & dữ liệu",
        url: "/director/ai",
        exact: true,
        icon: <Widget4Icon />,
        items: [],
      },
    ],
  },
];
