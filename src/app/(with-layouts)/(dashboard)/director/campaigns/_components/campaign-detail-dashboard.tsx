"use client";

import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmPermissions } from "@/components/common/auth/permissions";
import {
  useLeadSaleCampaignChannelTypesQuery,
  useLeadSaleCampaignQuery,
} from "@/hooks/use-lead-sale-campaign-queries";
import { useLeadSaleLeadsQuery } from "@/hooks/use-lead-sale-leads-queries";
import {
  useAssignedStudentsQuery,
  useDirectorStudentsQuery,
  studentsKeys,
} from "@/hooks/use-students-queries";
import {
  getDirectorStudents,
  type DirectorStudentsParams,
} from "@/services/api/students";

import CampaignDetailHeader from "./campaign-detail-header";
import CampaignDetailLeadList, {
  campaignLeadListGrid,
} from "./campaign-detail-lead-list";
import {
  countCampaignLeadsByStatus,
  filterCampaignLeads,
  toCampaignLeadRow,
  type CampaignLeadStatusFilter,
} from "./campaign-detail-leads";
import CampaignDetailLeadToolbar from "./campaign-detail-lead-toolbar";
import CampaignDetailRecordTabs, {
  type CampaignDetailRecordView,
} from "./campaign-detail-record-tabs";
import CampaignDetailStudentToolbar, {
  type CampaignDetailStudentStatusFilter,
} from "./campaign-detail-student-toolbar";
import StudentList, {
  studentListGrid,
} from "../../students/_components/student-list";
import { studentStatusOptions } from "../../students/_components/student-status";
import { toCampaignListItem } from "./campaign-mappers";
import { getCampaignListPath } from "./campaign-routes";

const leadPageSize = 5;
const studentPageSize = 10;

export default function CampaignDetailDashboard({
  campaignCode,
}: {
  campaignCode: string;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const studentPermissions = getCrmPermissions(user?.roles);
  const studentReadScope =
    studentPermissions.student.readScope ?? studentPermissions.student.scope;
  const isSessionScopedStudentView =
    studentReadScope === "assigned" || studentReadScope === "team";
  const campaignListPath = getCampaignListPath(user?.roles);
  const campaignQuery = useLeadSaleCampaignQuery(campaignCode);
  const { data: channelTypeData } = useLeadSaleCampaignChannelTypesQuery();
  const campaign = useMemo(
    () => (campaignQuery.data ? toCampaignListItem(campaignQuery.data) : null),
    [campaignQuery.data],
  );
  const leadsQuery = useLeadSaleLeadsQuery(
    { campaign: campaignQuery.data?.name ?? "", page: 1, pageSize: 100 },
    { enabled: Boolean(campaignQuery.data) },
  );
  const fetchedLeads = useMemo(
    () => (leadsQuery.data?.data ?? []).map(toCampaignLeadRow),
    [leadsQuery.data],
  );
  const [leadQuery, setLeadQuery] = useState("");
  const [leadStatus, setLeadStatus] = useState<CampaignLeadStatusFilter>("all");
  const [leadPage, setLeadPage] = useState(1);
  const [recordView, setRecordView] =
    useState<CampaignDetailRecordView>("leads");
  const [studentQuery, setStudentQuery] = useState("");
  const [studentStatus, setStudentStatus] =
    useState<CampaignDetailStudentStatusFilter>("all");
  const [studentPage, setStudentPage] = useState(1);
  const filteredLeads = useMemo(
    () => filterCampaignLeads(fetchedLeads, leadQuery, leadStatus),
    [fetchedLeads, leadQuery, leadStatus],
  );
  const leadStatusCounts = useMemo(
    () => countCampaignLeadsByStatus(fetchedLeads),
    [fetchedLeads],
  );
  const totalLeads = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalLeads / leadPageSize));
  const currentPage = Math.min(leadPage, totalPages);
  const visibleLeads = useMemo(
    () =>
      filteredLeads.slice(
        (currentPage - 1) * leadPageSize,
        currentPage * leadPageSize,
      ),
    [currentPage, filteredLeads],
  );
  const serverConversionRate = leadsQuery.data?.meta.stats?.conversionRate;
  const conversionRate = useMemo(() => {
    if (typeof serverConversionRate === "number") return serverConversionRate;
    if (fetchedLeads.length === 0) return null;

    const converted = fetchedLeads.filter(
      (lead) => lead.processingStatus === "CLOSED",
    ).length;
    return Math.round((converted / fetchedLeads.length) * 100);
  }, [fetchedLeads, serverConversionRate]);

  const studentQueryParams: DirectorStudentsParams = {
    admissionYear: campaign?.admissionYear ?? 2026,
    page: studentPage,
    pageSize: studentPageSize,
    q: studentQuery || undefined,
    campaign: campaign?.code || undefined,
    lifecycleStatus: studentStatus === "all" ? undefined : studentStatus,
  };
  const sessionScopedStudentsQuery = useAssignedStudentsQuery(
    studentQueryParams,
    user?.user,
    {
      enabled:
        recordView === "students" &&
        studentPermissions.student.canRead &&
        isSessionScopedStudentView &&
        !isAuthLoading,
      placeholderData: keepPreviousData,
    },
  );
  const allStudentsQuery = useDirectorStudentsQuery(studentQueryParams, {
    enabled:
      recordView === "students" &&
      studentPermissions.student.canRead &&
      !isSessionScopedStudentView &&
      !isAuthLoading,
    placeholderData: keepPreviousData,
  });
  const studentsQuery = isSessionScopedStudentView
    ? sessionScopedStudentsQuery
    : allStudentsQuery;
  const studentStatusFilters: CampaignDetailStudentStatusFilter[] = [
    "all",
    ...studentStatusOptions,
  ];
  const studentStatusCountQueries = useQueries({
    queries: studentStatusFilters.map((status) => {
      const countParams: DirectorStudentsParams = {
        ...studentQueryParams,
        page: 1,
        pageSize: 1,
        lifecycleStatus: status === "all" ? undefined : status,
      };

      return {
        queryKey: isSessionScopedStudentView
          ? studentsKeys.assignedStudents(countParams, user?.user)
          : studentsKeys.directorStudents(countParams),
        queryFn: () =>
          getDirectorStudents(countParams, {
            sessionRequired: isSessionScopedStudentView,
          }),
        enabled:
          recordView === "students" &&
          studentPermissions.student.canRead &&
          !isAuthLoading &&
          (!isSessionScopedStudentView || Boolean(user?.user)),
      };
    }),
  });
  const studentStatusCounts = Object.fromEntries(
    studentStatusFilters.map((status, index) => [
      status,
      studentStatusCountQueries[index]?.data?.meta.total ?? 0,
    ]),
  ) as Record<CampaignDetailStudentStatusFilter, number>;
  const students = studentsQuery.data?.data ?? [];
  const studentTotal = studentsQuery.data?.meta.total ?? students.length;
  const studentTotalPages = Math.max(
    1,
    studentsQuery.data?.meta.totalPages ??
      Math.ceil(studentTotal / studentPageSize),
  );
  const currentStudentPage = Math.min(studentPage, studentTotalPages);

  const handleLeadQueryChange = (value: string) => {
    setLeadQuery(value);
    setLeadPage(1);
  };

  const handleLeadStatusChange = (value: CampaignLeadStatusFilter) => {
    setLeadStatus(value);
    setLeadPage(1);
  };

  const handleLeadPageChange = (nextPage: number) => {
    setLeadPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const handleRecordViewChange = (nextView: CampaignDetailRecordView) => {
    setRecordView(nextView);
    if (nextView === "leads") setLeadPage(1);
    if (nextView === "students") setStudentPage(1);
  };

  const handleStudentQueryChange = (value: string) => {
    setStudentQuery(value);
    setStudentPage(1);
  };

  const handleStudentStatusChange = (
    nextStatus: CampaignDetailStudentStatusFilter,
  ) => {
    setStudentStatus(nextStatus);
    setStudentPage(1);
  };

  const handleStudentPageChange = (nextPage: number) => {
    setStudentPage(Math.min(Math.max(1, nextPage), studentTotalPages));
  };

  if (campaignQuery.isPending) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="p-5 text-sm text-text-secondary">
          Đang tải chi tiết chiến dịch...
        </Card>
      </main>
    );
  }

  if (campaignQuery.isError) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">Không thể tải chiến dịch.</p>
          <p className="mt-1 text-sm">{campaignQuery.error.message}</p>
        </Card>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">
            Không tìm thấy chiến dịch này.
          </p>
          <p className="mt-1 text-sm">
            Chiến dịch có thể đã bị xóa hoặc mã chiến dịch không đúng.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      <CampaignDetailHeader
        backHref={campaignListPath}
        campaign={campaign}
        channelTypes={channelTypeData?.channelTypes ?? []}
        conversionRate={conversionRate}
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          {recordView === "leads" ? (
            <CampaignDetailLeadToolbar
              query={leadQuery}
              status={leadStatus}
              counts={leadStatusCounts}
              onQueryChange={handleLeadQueryChange}
              onStatusChange={handleLeadStatusChange}
            />
          ) : (
            <CampaignDetailStudentToolbar
              query={studentQuery}
              status={studentStatus}
              counts={studentStatusCounts}
              onQueryChange={handleStudentQueryChange}
              onStatusChange={handleStudentStatusChange}
            />
          )}
        </div>
        <CampaignDetailRecordTabs
          selectedKey={recordView}
          onSelectionChange={handleRecordViewChange}
        />
      </div>

      {recordView === "leads" ? (
        <Card className="overflow-hidden p-0">
          {leadsQuery.isPending ? (
            <div className="px-5 py-14 text-center text-sm text-text-tertiary">
              Đang tải danh sách lead...
            </div>
          ) : leadsQuery.isError ? (
            <div className="px-5 py-14 text-center text-sm text-badge-error-text">
              {leadsQuery.error.message}
            </div>
          ) : (
            <div>
              <div
                className={`hidden ${campaignLeadListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
                aria-hidden="true"
              >
                <span className="min-w-0 truncate">Mã Lead</span>
                <span className="min-w-0 truncate">Họ và Tên</span>
                <span className="min-w-0 truncate">Di động</span>
                <span className="min-w-0 truncate">Nguồn</span>
                <span className="min-w-0 truncate">Trạng thái lead</span>
                <span className="min-w-0 truncate">Kết quả</span>
                <span className="min-w-0 truncate">Người phụ trách</span>
                <span className="min-w-0 truncate">Ngày tạo</span>
              </div>
              <CampaignDetailLeadList
                leads={visibleLeads}
                isFiltered={Boolean(leadQuery.trim()) || leadStatus !== "all"}
              />
              {totalLeads > 0 && (
                <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <p
                    className="shrink-0 whitespace-nowrap text-xs text-text-secondary"
                    aria-live="polite"
                  >
                    Hiển thị{" "}
                    <span className="font-semibold text-text-primary">
                      {(currentPage - 1) * leadPageSize + 1}–
                      {Math.min(currentPage * leadPageSize, totalLeads)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-text-primary">
                      {totalLeads}
                    </span>{" "}
                    lead
                  </p>
                  <div className="flex shrink-0 items-center justify-end max-sm:w-full">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handleLeadPageChange}
                      variant="compact"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card className="min-w-0 overflow-hidden p-0">
          {!studentPermissions.student.canRead ? (
            <div className="px-5 py-14 text-center text-sm text-text-tertiary">
              Bạn không có quyền xem danh sách học sinh.
            </div>
          ) : isAuthLoading || studentsQuery.isPending ? (
            <div className="px-5 py-14 text-center text-sm text-text-tertiary">
              Đang tải danh sách học sinh...
            </div>
          ) : studentsQuery.isError ? (
            <div className="px-5 py-14 text-center text-sm text-badge-error-text">
              {studentsQuery.error.message}
            </div>
          ) : (
            <div>
              <div
                className={`hidden ${studentListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
                aria-hidden="true"
              >
                <span className="min-w-0 truncate">Mã học sinh</span>
                <span className="min-w-0 truncate">Họ và tên</span>
                <span className="min-w-0 truncate">Tỉnh/TP</span>
                <span className="min-w-0 truncate">Ngành quan tâm</span>
                <span className="min-w-0 truncate">Trạng thái</span>
                <span className="min-w-0 truncate">Điểm tiềm năng</span>
                <span className="min-w-0 truncate">Người phụ trách</span>
              </div>
              <StudentList
                students={students}
                ownerEditable={studentPermissions.student.canAssign}
              />
              {studentTotal > 0 && (
                <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <p
                    className="shrink-0 whitespace-nowrap text-xs text-text-secondary"
                    aria-live="polite"
                  >
                    Hiển thị{" "}
                    <span className="font-semibold text-text-primary">
                      {(currentStudentPage - 1) * studentPageSize + 1}–
                      {Math.min(
                        currentStudentPage * studentPageSize,
                        studentTotal,
                      )}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-text-primary">
                      {studentTotal}
                    </span>{" "}
                    học sinh
                  </p>
                  <div className="flex shrink-0 items-center justify-end max-sm:w-full">
                    <Pagination
                      currentPage={currentStudentPage}
                      totalPages={studentTotalPages}
                      onPageChange={handleStudentPageChange}
                      variant="compact"
                      isDisabled={studentsQuery.isPlaceholderData}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
