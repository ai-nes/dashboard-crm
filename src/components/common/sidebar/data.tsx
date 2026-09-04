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
import type { CrmRole } from "../auth/rbac";
import { getRolesForRoute } from "../auth/rbac";

export interface NavigationItem {
  title: string;
  url?: string;
  exact?: boolean;
  icon?: ReactNode;
  roles: readonly CrmRole[];
  items?: NavigationItem[];
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

function navItem(
  item: Omit<NavigationItem, "roles"> & { url: string },
): NavigationItem {
  return { ...item, roles: getRolesForRoute(item.url) };
}

export const NAV_DATA: NavigationSection[] = [
  {
    label: "TỔNG QUAN",
    items: [
      {
        ...navItem({
          title: "Tổng quan tuyển sinh",
          url: "/",
          icon: <HomeIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Việc cần xử lý",
          url: "/director/ai/next-best-action",
          icon: <TaskIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Chatbot CRM",
          url: "/crm-chatbot",
          icon: <ChatIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Trung tâm AI & dữ liệu",
          url: "/director/ai",
          exact: true,
          icon: <Widget4Icon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Sức khỏe dữ liệu",
          url: "/director/data-health",
          icon: <Widget4Icon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Cảnh báo & lịch nhận tin",
          url: "/director/alerts",
          icon: <TaskIcon />,
          items: [],
        }),
      },
    ],
  },
  {
    label: "HỌC SINH & TRƯỜNG THPT",
    items: [
      {
        ...navItem({
          title: "Khám phá người học",
          url: "/director/demographics",
          icon: <AlphabetIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Hồ sơ học sinh 360°",
          url: "/director/students",
          icon: <UserGroupIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Trường THPT 360°",
          url: "/director/market-intelligence",
          icon: <Buildings11 size={18} />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Hiệu suất khu vực",
          url: "/director/regional-performance",
          icon: <MapMarker5 size={18} />,
          items: [],
        }),
      },
    ],
  },
  {
    label: "MARKETING",
    items: [
      {
        ...navItem({
          title: "Phễu tuyển sinh",
          url: "/director/admission-funnel",
          icon: <Target3 size={18} />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Phân tích xu hướng",
          url: "/director/revenue-forecast",
          icon: <InvoiceIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Thông minh chiến dịch",
          url: "/director/campaign-intelligence",
          icon: <Target3 size={18} />,
          items: [],
        }),
      },
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      {
        ...navItem({
          title: "Quản lý task",
          url: "/director/tasks",
          icon: <TaskIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Hoạt động & chiến dịch",
          url: "/director/activity-campaign",
          icon: <CalendarIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Hiệu suất SLA",
          url: "/director/sla",
          icon: <TaskIcon />,
          items: [],
        }),
      },
      {
        ...navItem({
          title: "Hoạt động trường",
          url: "/director/school-field-activity",
          icon: <CalendarIcon />,
          items: [],
        }),
      },
    ],
  },
  {
    label: "BÁO CÁO",
    items: [],
  },
  {
    label: "CẤU HÌNH",
    items: [
      {
        ...navItem({
          title: "Cấu hình Action NBA",
          url: "/director/admin/nba-actions",
          icon: <Widget4Icon />,
          items: [],
        }),
      },
    ],
  },
];
