import {
  AlphabetIcon,
  CalendarIcon,
  ChatIcon,
  HomeIcon,
  InvoiceIcon,
  TaskIcon,
  UserGroupIcon,
  Widget4Icon,
} from "./icon";
import { Buildings11, MapMarker5, Target3 } from "@tailgrids/icons";
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
        title: "Việc cần xử lý",
        url: "/director/ai/next-best-action",
        icon: <TaskIcon />,
        items: [],
      },
      {
        title: "Chatbot CRM",
        url: "/crm-chatbot",
        icon: <ChatIcon />,
        items: [],
      },
      {
        title: "Trung tâm AI & dữ liệu",
        url: "/director/ai",
        exact: true,
        icon: <Widget4Icon />,
        items: [],
      },
    ],
  },
  {
    label: "HỌC SINH & TRƯỜNG THPT",
    items: [
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
      {
        title: "Trường THPT 360°",
        url: "/director/market-intelligence",
        icon: <Buildings11 size={18} />,
        items: [],
      },
      {
        title: "Hiệu suất khu vực",
        url: "/director/regional-performance",
        icon: <MapMarker5 size={18} />,
        items: [],
      },
    ],
  },
  {
    label: "MARKETING",
    items: [
      {
        title: "Phễu tuyển sinh",
        url: "/director/admission-funnel",
        icon: <Target3 size={18} />,
        items: [],
      },
      {
        title: "Phân tích xu hướng",
        url: "/director/revenue-forecast",
        icon: <InvoiceIcon />,
        items: [],
      },
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      {
        title: "Hoạt động & chiến dịch",
        url: "/director/activity-campaign",
        icon: <CalendarIcon />,
        items: [],
      },
    ],
  },
  {
    label: "BÁO CÁO",
    items: [],
  },
];
