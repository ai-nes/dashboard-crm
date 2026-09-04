import {
  AlphabetIcon,
  CalendarIcon,
  ChatIcon,
  HomeIcon,
  InvoiceIcon,
  PieChartIcon,
  TaskIcon,
  UserGroupIcon,
  Widget4Icon,
} from "./icon";
import {
  Buildings11,
  MapMarker5,
  Target3,
  UserMultiple4,
  UserPencil,
} from "@tailgrids/icons";
import type { ReactNode } from "react";
import type { CrmRole } from "../auth/rbac";
import {
  getDefaultRouteForRoles,
  getEffectiveCrmRoles,
  getRolesForRoute,
} from "../auth/rbac";

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

/**
 * Full navigation used by non-director roles. Director gets a smaller,
 * decision-oriented set of entry points below.
 */
export const NAV_DATA: NavigationSection[] = [
  {
    label: "TỔNG QUAN",
    items: [
      navItem({
        title: "Tổng quan tuyển sinh",
        url: "/",
        icon: <HomeIcon />,
      }),
      navItem({
        title: "Việc cần xử lý",
        url: "/director/ai/next-best-action",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Chatbot CRM",
        url: "/crm-chatbot",
        icon: <ChatIcon />,
      }),
      navItem({
        title: "Trung tâm AI & dữ liệu",
        url: "/director/ai",
        exact: true,
        icon: <Widget4Icon />,
      }),
      navItem({
        title: "Sức khỏe dữ liệu",
        url: "/director/data-health",
        icon: <Widget4Icon />,
      }),
      navItem({
        title: "Cảnh báo & lịch nhận tin",
        url: "/director/alerts",
        icon: <TaskIcon />,
      }),
    ],
  },
  {
    label: "HỌC SINH & TRƯỜNG THPT",
    items: [
      navItem({
        title: "Khám phá người học",
        url: "/director/demographics",
        icon: <AlphabetIcon />,
      }),
      navItem({
        title: "Hồ sơ học sinh 360°",
        url: "/director/students",
        icon: <UserGroupIcon />,
      }),
      navItem({
        title: "Trường THPT 360°",
        url: "/director/market-intelligence",
        icon: <Buildings11 size={18} />,
      }),
      navItem({
        title: "Hiệu suất khu vực",
        url: "/director/regional-performance",
        icon: <MapMarker5 size={18} />,
      }),
    ],
  },
  {
    label: "MARKETING",
    items: [
      navItem({
        title: "Phễu tuyển sinh",
        url: "/director/admission-funnel",
        icon: <Target3 size={18} />,
      }),
      navItem({
        title: "Phân tích xu hướng",
        url: "/director/revenue-forecast",
        icon: <InvoiceIcon />,
      }),
      navItem({
        title: "Thông minh chiến dịch",
        url: "/director/campaign-intelligence",
        icon: <Target3 size={18} />,
      }),
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      navItem({
        title: "Quản lý task",
        url: "/director/tasks",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Hoạt động & chiến dịch",
        url: "/director/activity-campaign",
        icon: <CalendarIcon />,
      }),
      navItem({
        title: "Hiệu suất SLA",
        url: "/director/sla",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Hoạt động trường",
        url: "/director/school-field-activity",
        icon: <CalendarIcon />,
      }),
    ],
  },
  {
    label: "CẤU HÌNH",
    items: [
      navItem({
        title: "Quản lý cấu hình NBA",
        url: "/director/admin/nba-actions",
        icon: <Widget4Icon />,
      }),
    ],
  },
];

const DIRECTOR_NAV_PATHS = new Set([
  "/",
  "/director/ai/next-best-action",
  "/crm-chatbot",
  "/director/ai",
  "/director/demographics",
  "/director/students",
  "/director/market-intelligence",
  "/director/regional-performance",
  "/director/admission-funnel",
  "/director/revenue-forecast",
  "/director/tasks",
  "/director/activity-campaign",
]);

export const DIRECTOR_NAV_DATA: NavigationSection[] = NAV_DATA.map(
  (section) => ({
    ...section,
    items: section.items.filter(
      (item) => item.url && DIRECTOR_NAV_PATHS.has(item.url),
    ),
  }),
).filter((section) => section.items.length > 0);

/**
 * Dedicated, curated navigation for CTV Sale — a small, focused set of
 * entry points rather than a filtered slice of the full NAV_DATA (two of
 * these routes, the CTV Sale overview and results screens, don't exist
 * anywhere else in NAV_DATA).
 */
export const CTV_SALE_NAV_DATA: NavigationSection[] = [
  {
    label: "TỔNG QUAN",
    items: [
      navItem({
        title: "Tổng quan tuyển sinh",
        url: "/ctv-sale",
        exact: true,
        icon: <HomeIcon />,
      }),
      navItem({
        title: "Việc cần xử lý",
        url: "/ctv-sale/next-best-action",
        icon: <TaskIcon />,
      }),
    ],
  },
  {
    label: "HỒ SƠ HỌC SINH",
    items: [
      navItem({
        title: "Hồ sơ học sinh 360°",
        url: "/ctv-sale/students",
        icon: <UserGroupIcon />,
      }),
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      navItem({
        title: "Quản lý task",
        url: "/ctv-sale/tasks",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Kết quả",
        url: "/ctv-sale/results",
        icon: <PieChartIcon />,
      }),
    ],
  },
];

/**
 * Dedicated, curated navigation for Sale — mirrors CTV Sale's structure but
 * also keeps the CRM chatbot entry point that Sale already has access to.
 */
export const SALE_NAV_DATA: NavigationSection[] = [
  {
    label: "TỔNG QUAN",
    items: [
      navItem({
        title: "Tổng quan tuyển sinh",
        url: "/sale",
        exact: true,
        icon: <HomeIcon />,
      }),
      navItem({
        title: "Việc cần xử lý",
        url: "/sale/next-best-action",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Chatbot CRM",
        url: "/crm-chatbot",
        icon: <ChatIcon />,
      }),
    ],
  },
  {
    label: "HỌC SINH & NGƯỜI HỌC",
    items: [
      navItem({
        title: "Khám phá người học",
        url: "/sale/demographics",
        icon: <AlphabetIcon />,
      }),
      navItem({
        title: "Hồ sơ học sinh 360°",
        url: "/sale/students",
        icon: <UserGroupIcon />,
      }),
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      navItem({
        title: "Quản lý task",
        url: "/sale/tasks",
        icon: <TaskIcon />,
      }),
    ],
  },
];

/**
 * Dedicated, curated navigation for Lead Sale — Sale's set plus the two
 * team-management screens (student assignment, sales team) that only a
 * Lead Sales owns.
 */
export const LEAD_SALE_NAV_DATA: NavigationSection[] = [
  {
    label: "TỔNG QUAN",
    items: [
      navItem({
        title: "Tổng quan tuyển sinh",
        url: "/lead-sale",
        exact: true,
        icon: <HomeIcon />,
      }),
      navItem({
        title: "Việc cần xử lý",
        url: "/lead-sale/next-best-action",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Chatbot CRM",
        url: "/crm-chatbot",
        icon: <ChatIcon />,
      }),
    ],
  },
  {
    label: "HỌC SINH & NGƯỜI HỌC",
    items: [
      navItem({
        title: "Khám phá người học",
        url: "/lead-sale/demographics",
        icon: <AlphabetIcon />,
      }),
      navItem({
        title: "Hồ sơ học sinh 360°",
        url: "/lead-sale/students",
        icon: <UserGroupIcon />,
      }),
    ],
  },
  {
    label: "VẬN HÀNH TUYỂN SINH",
    items: [
      navItem({
        title: "Quản lý task",
        url: "/lead-sale/tasks",
        icon: <TaskIcon />,
      }),
      navItem({
        title: "Phân công học sinh",
        url: "/lead-sale/student-assignment",
        icon: <UserPencil size={18} />,
      }),
    ],
  },
  {
    label: "ĐỘI NGŨ",
    items: [
      navItem({
        title: "Đội ngũ Sale",
        url: "/lead-sale/sales-team",
        icon: <UserMultiple4 size={18} />,
      }),
    ],
  },
];

export function getNavigationDataForRoles(
  userRoles: readonly string[],
): NavigationSection[] {
  const effectiveRoles = getEffectiveCrmRoles(userRoles);
  const navigation = effectiveRoles.includes("Admissions Director")
    ? DIRECTOR_NAV_DATA
    : effectiveRoles.includes("CTV Sale")
      ? CTV_SALE_NAV_DATA
      : effectiveRoles.includes("Lead Sales")
        ? LEAD_SALE_NAV_DATA
        : effectiveRoles.includes("Sale")
          ? SALE_NAV_DATA
          : NAV_DATA;

  const workspaceRoute = getDefaultRouteForRoles(userRoles);

  return navigation.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.url === "/"
        ? {
            ...item,
            url: workspaceRoute,
            exact: true,
            roles: getRolesForRoute(workspaceRoute),
          }
        : item,
    ),
  }));
}
