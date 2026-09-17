"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  Book4,
  Buildings11,
  Gear1,
  RefreshCircle1Clockwise,
  Shield1Check,
  UserMultiple4,
} from "@tailgrids/icons";

import { useActivityLogsQuery } from "@/hooks/use-activity-logs-query";
import {
  useNbaAdminActionTypesQuery,
  useNbaTimingPoliciesQuery,
} from "@/hooks/use-nba-admin-queries";
import { useCrmRuleVersionsQuery } from "@/hooks/use-rules-config-queries";
import {
  useMajorGroupsQuery,
  useMajorsQuery,
} from "@/hooks/use-major-catalog-queries";
import {
  useProvincesQuery,
  useSchoolAreasQuery,
  useSchoolsQuery,
  useWardsQuery,
} from "@/hooks/use-reference-catalog-queries";
import { useSegmentsQuery } from "@/hooks/use-segment-queries";
import { useCrmUsersQuery } from "@/hooks/use-user-management-queries";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { Button } from "@/components/tailgrids/core/button";
import { listAdminMessageTemplateLibrary } from "@/services/api/message-templates";

import AdminOverviewActivityChart, {
  AdminOverviewConfigurationChart,
} from "./admin-overview-charts";
import AdminOverviewConfiguration, {
  AdminOverviewQuickLinks,
} from "./admin-overview-configuration";
import AdminOverviewKpiStrip from "./admin-overview-kpi-strip";
import type {
  AdminOverviewLink,
  AdminOverviewModule,
  AdminOverviewStatus,
  AdminOverviewVolume,
} from "./admin-overview-types";

function formatNumber(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("vi-VN");
}

function totalOf(value: { total?: number } | undefined): number | null {
  return typeof value?.total === "number" ? value.total : null;
}

function statusOf({
  isPending,
  isError,
  value,
}: {
  isPending: boolean;
  isError: boolean;
  value: number | null;
}): AdminOverviewStatus {
  if (isPending) return "loading";
  if (isError) return "error";
  return value === null || value === 0 ? "empty" : "ready";
}

function sumKnown(values: readonly (number | null)[]): number | null {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

export default function AdminOverviewPage({
  links,
}: {
  links: readonly AdminOverviewLink[];
}) {
  const usersQuery = useCrmUsersQuery();
  const ruleVersionsQuery = useCrmRuleVersionsQuery({ pageLength: 50 });
  const nbaActionsQuery = useNbaAdminActionTypesQuery({ pageLength: 1 });
  const nbaPoliciesQuery = useNbaTimingPoliciesQuery({ pageLength: 1 });
  const messageTemplatesQuery = useQuery({
    queryKey: ["admin-overview", "message-templates"],
    queryFn: () => listAdminMessageTemplateLibrary({ start: 0, pageLength: 1 }),
    staleTime: 30_000,
  });
  const segmentsQuery = useSegmentsQuery({ start: 0, pageLength: 1 });
  const majorGroupsQuery = useMajorGroupsQuery({ start: 0, pageLength: 1 });
  const majorsQuery = useMajorsQuery({ start: 0, pageLength: 1 });
  const provincesQuery = useProvincesQuery({ start: 0, pageLength: 1 });
  const wardsQuery = useWardsQuery({ start: 0, pageLength: 1 });
  const schoolsQuery = useSchoolsQuery({ start: 0, pageLength: 1 });
  const schoolAreasQuery = useSchoolAreasQuery({ start: 0, pageLength: 1 });
  const activityQuery = useActivityLogsQuery({ module: "all", pageLength: 50 });

  const usersTotal = totalOf(usersQuery.data);
  const activeUsers =
    usersQuery.data?.allUsers.filter((user) => user.enabled).length ?? null;
  const activeVersion = ruleVersionsQuery.data?.versions.find(
    (version) => version.isActive,
  );
  const ruleCount = activeVersion?.rulesCount ?? null;
  const nbaCount = sumKnown([
    totalOf(nbaActionsQuery.data),
    totalOf(nbaPoliciesQuery.data),
    ruleCount,
  ]);
  const catalogCount = sumKnown([
    totalOf(majorGroupsQuery.data),
    totalOf(majorsQuery.data),
    totalOf(provincesQuery.data),
    totalOf(wardsQuery.data),
    totalOf(schoolsQuery.data),
    totalOf(schoolAreasQuery.data),
  ]);

  const catalogQueries = [
    majorGroupsQuery,
    majorsQuery,
    provincesQuery,
    wardsQuery,
    schoolsQuery,
    schoolAreasQuery,
  ];
  const nbaQueries = [nbaActionsQuery, nbaPoliciesQuery, ruleVersionsQuery];
  const isCatalogLoading = catalogQueries.some((query) => query.isPending);
  const isCatalogError = catalogQueries.some((query) => query.isError);
  const isNbaLoading = nbaQueries.some((query) => query.isPending);
  const isNbaError = nbaQueries.some((query) => query.isError);

  const modules = useMemo<AdminOverviewModule[]>(
    () => [
      {
        label: "Người dùng CRM",
        description: "Tài khoản và quyền truy cập hệ thống.",
        value: formatNumber(usersTotal),
        detail:
          activeUsers === null
            ? "Đang tổng hợp"
            : `${formatNumber(activeUsers)} đang hoạt động`,
        status: statusOf({
          isPending: usersQuery.isPending,
          isError: usersQuery.isError,
          value: usersTotal,
        }),
        icon: <UserMultiple4 size={17} aria-hidden="true" />,
      },
      {
        label: "Rule Engine",
        description: "Phiên bản và bộ quy tắc nghiệp vụ.",
        value: formatNumber(ruleCount),
        detail: activeVersion
          ? `${formatNumber(ruleVersionsQuery.data?.total ?? null)} phiên bản`
          : "Chưa phát hành",
        status: statusOf({
          isPending: ruleVersionsQuery.isPending,
          isError: ruleVersionsQuery.isError,
          value: ruleCount,
        }),
        icon: <Shield1Check size={17} aria-hidden="true" />,
      },
      {
        label: "NBA",
        description: "Hành động, khung giờ và quy tắc gợi ý.",
        value: formatNumber(nbaCount),
        detail: `${formatNumber(totalOf(nbaActionsQuery.data))} action · ${formatNumber(totalOf(nbaPoliciesQuery.data))} timing`,
        status: statusOf({
          isPending: isNbaLoading,
          isError: isNbaError,
          value: nbaCount,
        }),
        icon: <BarChart2 size={17} aria-hidden="true" />,
      },
      {
        label: "Message Template",
        description: "Thư viện mẫu dùng chung cho đội tuyển sinh.",
        value: formatNumber(totalOf(messageTemplatesQuery.data)),
        detail: "Mẫu dùng chung",
        status: statusOf({
          isPending: messageTemplatesQuery.isPending,
          isError: messageTemplatesQuery.isError,
          value: totalOf(messageTemplatesQuery.data),
        }),
        icon: <Book4 size={17} aria-hidden="true" />,
      },
      {
        label: "Phân khúc",
        description: "Các nhóm học sinh phục vụ phân loại và chăm sóc.",
        value: formatNumber(totalOf(segmentsQuery.data)),
        detail: "Nhóm học sinh dùng chung",
        status: statusOf({
          isPending: segmentsQuery.isPending,
          isError: segmentsQuery.isError,
          value: totalOf(segmentsQuery.data),
        }),
        icon: <Gear1 size={17} aria-hidden="true" />,
      },
      {
        label: "Danh mục tuyển sinh",
        description: "Ngành học, địa bàn, trường và khu vực.",
        value: formatNumber(catalogCount),
        detail: `${formatNumber(totalOf(majorsQuery.data))} ngành · ${formatNumber(totalOf(schoolsQuery.data))} trường`,
        status: statusOf({
          isPending: isCatalogLoading,
          isError: isCatalogError,
          value: catalogCount,
        }),
        icon: <Buildings11 size={17} aria-hidden="true" />,
      },
    ],
    [
      activeUsers,
      activeVersion,
      catalogCount,
      isCatalogError,
      isCatalogLoading,
      isNbaError,
      isNbaLoading,
      messageTemplatesQuery.data,
      messageTemplatesQuery.isError,
      messageTemplatesQuery.isPending,
      nbaActionsQuery.data,
      nbaCount,
      nbaPoliciesQuery.data,
      ruleCount,
      ruleVersionsQuery.data,
      ruleVersionsQuery.isError,
      ruleVersionsQuery.isPending,
      segmentsQuery.data,
      segmentsQuery.isError,
      segmentsQuery.isPending,
      usersQuery.isError,
      usersQuery.isPending,
      usersTotal,
      majorsQuery.data,
      schoolsQuery.data,
    ],
  );

  const chartData = useMemo<AdminOverviewVolume[]>(
    () =>
      [
        { label: "Người dùng", value: usersTotal, color: "var(--primary-500)" },
        { label: "Rule Engine", value: ruleCount, color: "var(--success-500)" },
        { label: "NBA", value: nbaCount, color: "var(--info-500)" },
        {
          label: "Templates",
          value: totalOf(messageTemplatesQuery.data),
          color: "var(--warning-500)",
        },
        {
          label: "Phân khúc",
          value: totalOf(segmentsQuery.data),
          color: "var(--primary-300)",
        },
        { label: "Danh mục", value: catalogCount, color: "var(--primary-700)" },
      ].filter(
        (item): item is AdminOverviewVolume =>
          item.value !== null && item.value > 0,
      ),
    [
      catalogCount,
      messageTemplatesQuery.data,
      nbaCount,
      ruleCount,
      segmentsQuery.data,
      usersTotal,
    ],
  );

  const queryList = [
    usersQuery,
    ruleVersionsQuery,
    nbaActionsQuery,
    nbaPoliciesQuery,
    messageTemplatesQuery,
    segmentsQuery,
    majorGroupsQuery,
    majorsQuery,
    provincesQuery,
    wardsQuery,
    schoolsQuery,
    schoolAreasQuery,
    activityQuery,
  ];
  const resolvedSources = queryList.filter(
    (query) => !query.isPending && !query.isError,
  ).length;

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <AdminPageHeader
        section="ADMIN"
        title="Tổng quan hệ thống"
        description="Nắm nhanh tình trạng vận hành và các cấu hình đang phục vụ quy trình tuyển sinh."
        actions={
          <Button
            size="md"
            appearance="outline"
            onPress={() =>
              void Promise.all(queryList.map((query) => query.refetch()))
            }
          >
            <RefreshCircle1Clockwise size={16} aria-hidden="true" />
            Làm mới dữ liệu
          </Button>
        }
        metaLabel="Nguồn dữ liệu đã phản hồi"
        metaValue={`${resolvedSources}/${queryList.length} kết nối`}
      />

      <AdminOverviewKpiStrip
        items={[
          {
            label: "Người dùng CRM",
            value: formatNumber(usersTotal),
            detail: `${formatNumber(activeUsers)} đang hoạt động`,
            tone: "primary",
          },
          {
            label: "Rule đang chạy",
            value: formatNumber(ruleCount),
            detail: activeVersion?.versionName ?? "Chưa có phiên bản active",
            tone: "success",
          },
          {
            label: "Bản ghi cấu hình",
            value: formatNumber(
              catalogCount === null || nbaCount === null
                ? null
                : catalogCount + nbaCount,
            ),
            detail: "NBA + danh mục tuyển sinh",
            tone: "info",
          },
          {
            label: "Sự kiện gần đây",
            value: formatNumber(activityQuery.data?.total ?? null),
            detail: "Theo nhật ký hệ thống",
            tone: "warning",
          },
        ]}
      />

      <section
        aria-label="Tổng quan cấu hình"
        className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)]"
      >
        <AdminOverviewConfiguration modules={modules} />
        <AdminOverviewConfigurationChart data={chartData} />
      </section>

      <section
        aria-label="Hoạt động và lối tắt quản trị"
        className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)]"
      >
        <AdminOverviewActivityChart
          logs={activityQuery.data?.logs ?? []}
          isLoading={activityQuery.isPending}
        />
        <AdminOverviewQuickLinks links={links} />
      </section>

      {activityQuery.isError ? (
        <p className="text-xs text-text-tertiary">
          Nhật ký hoạt động chưa phản hồi; các chỉ số cấu hình khác vẫn được
          hiển thị độc lập.
        </p>
      ) : null}
    </main>
  );
}
