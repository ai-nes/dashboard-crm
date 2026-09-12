"use client";

import {
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus } from "@tailgrids/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmPermissions } from "@/components/common/auth/permissions";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  useAssignedStudentsQuery,
  useDirectorStudentsQuery,
} from "@/hooks/use-students-queries";
import { useLeadSaleCampaignsQuery } from "@/hooks/use-lead-sale-campaign-queries";
import {
  createStudentWithLead,
  type StudentCreateWithLeadFields,
} from "@/services/api/student-school-update";
import type {
  StudentAssignmentStatus,
  StudentStatus,
} from "@/services/api/students/types";

import StudentCreateDialog from "./student-create-dialog";
import StudentList, { studentListGrid } from "./student-list";
import StudentListSkeleton from "./student-list-skeleton";
import StudentListToolbar from "./student-list-toolbar";

export default function StudentsOverviewDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const canReadStudents = permissions.student.canRead;
  const readScope = permissions.student.readScope ?? permissions.student.scope;
  const isSessionScoped = readScope === "assigned" || readScope === "team";
  const isLeadSale = user?.roles?.includes("Lead Sale") ?? false;
  const canCreateStudent = permissions.student.canCreate;
  const pageTitle = isLeadSale ? "Danh sách học sinh" : "Hồ sơ học sinh 360°";
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const ownerId = searchParams.get("owner")?.trim() || undefined;
  const [query, setQuery] = useState("");
  const [studentStatus, setStudentStatus] = useState<StudentStatus | "all">(
    "all",
  );
  const [province, setProvince] = useState("all");
  const [assignmentStatus, setAssignmentStatus] = useState<
    StudentAssignmentStatus | "all"
  >("all");
  const [campaign, setCampaign] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const campaignsQuery = useLeadSaleCampaignsQuery({
    leadOnly: true,
  });
  const availableCampaigns = campaignsQuery.data?.campaigns ?? [];

  const studentsQueryParams = {
    admissionYear: 2026,
    page,
    pageSize,
    q: query || undefined,
    province,
    lifecycleStatus: studentStatus === "all" ? undefined : studentStatus,
    assignmentStatus,
    campaign: campaign || undefined,
    // Session-scoped roles must never be able to widen the list with an owner
    // query parameter. The backend derives pool/team scope from the session.
    ownerId: isSessionScoped ? undefined : ownerId,
  };
  const sessionScopedStudentsQuery = useAssignedStudentsQuery(
    studentsQueryParams,
    user?.user,
    {
      enabled: canReadStudents && isSessionScoped && !isAuthLoading,
      placeholderData: keepPreviousData,
    },
  );
  const allStudentsQuery = useDirectorStudentsQuery(studentsQueryParams, {
    enabled: canReadStudents && !isSessionScoped && !isAuthLoading,
    placeholderData: keepPreviousData,
  });
  const studentsQuery = isSessionScoped
    ? sessionScopedStudentsQuery
    : allStudentsQuery;
  const {
    data: response,
    isError,
    error,
    isPending,
    isPlaceholderData,
  } = studentsQuery;

  const students = response?.data ?? [];
  const meta = response?.meta;

  const totalCount = meta?.total ?? students.length;
  const totalPages = Math.max(
    1,
    meta?.totalPages ?? Math.ceil(totalCount / pageSize),
  );
  const currentPage = meta ? Math.min(page, totalPages) : page;

  const createMutation = useMutation({
    mutationFn: (fields: StudentCreateWithLeadFields) =>
      createStudentWithLead(fields),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["director-students"] });
      await queryClient.invalidateQueries({ queryKey: ["assigned-students"] });
      setCreateDialogOpen(false);
      toast.success("Đã tạo hồ sơ học sinh.");
      if (response.name) {
        router.push(`/director/students/${encodeURIComponent(response.name)}`);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Chưa thể tạo hồ sơ học sinh.",
      );
    },
  });

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  const handleStudentStatusFilterChange = (val: StudentStatus | "all") => {
    setStudentStatus(val);
    setPage(1);
  };

  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setPage(1);
  };

  const handleAssignmentStatusChange = (
    val: StudentAssignmentStatus | "all",
  ) => {
    setAssignmentStatus(val);
    setPage(1);
  };

  const handleCampaignChange = (val: string) => {
    setCampaign(val);
    setPage(1);
  };

  const openCreateDialog = () => {
    createMutation.reset();
    setCreateDialogOpen(true);
  };

  const resetFilters = () => {
    setQuery("");
    setStudentStatus("all");
    setProvince("all");
    setAssignmentStatus("all");
    setCampaign("");
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      {isError && (
        <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
          <p className="font-semibold text-sm">
            Không thể tải dữ liệu từ Frappe CRM API
          </p>
          <p className="mt-1 text-xs">
            {error?.message ||
              "Lỗi kết nối hoặc không có quyền truy cập (403 Forbidden)."}
          </p>
        </Card>
      )}

      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · {pageTitle}</Badge>
            <span className="text-xs text-text-tertiary">
              Dữ liệu tuyển sinh · Kỳ {meta?.admissionYear ?? 2026}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Từ toàn cảnh tệp học sinh đến hành động tiếp theo cho từng hồ sơ.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          {canCreateStudent && (
            <Button
              isDisabled={createMutation.isPending}
              onPress={openCreateDialog}
            >
              <Plus size={16} aria-hidden="true" />
              Thêm học sinh
            </Button>
          )}
        </div>
      </header>

      <StudentCreateDialog
        isOpen={createDialogOpen}
        isSubmitting={createMutation.isPending}
        onCreate={(fields) =>
          createMutation.mutateAsync(fields).then(() => undefined)
        }
        onOpenChange={setCreateDialogOpen}
      />

      <StudentListToolbar
        query={query}
        studentStatus={studentStatus}
        province={province}
        assignmentStatus={assignmentStatus}
        campaign={campaign}
        campaigns={availableCampaigns}
        campaignLoading={campaignsQuery.isPending}
        campaignError={campaignsQuery.error?.message}
        resultCount={totalCount}
        onQueryChange={handleQueryChange}
        onStatusChange={handleStudentStatusFilterChange}
        onProvinceChange={handleProvinceChange}
        onAssignmentStatusChange={handleAssignmentStatusChange}
        onCampaignChange={handleCampaignChange}
        onReset={resetFilters}
      />

      <Card className="min-w-0 overflow-hidden p-0">
        <div>
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
            {isPending && !response ? (
              <StudentListSkeleton />
            ) : (
              <StudentList
                students={students}
                ownerEditable={permissions.student.canAssign}
              />
            )}
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="shrink-0 whitespace-nowrap text-xs text-text-secondary">
                Hiển thị{" "}
                <span className="font-semibold text-text-primary">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-text-primary">
                  {totalCount}
                </span>{" "}
                hồ sơ
              </p>
              {isPlaceholderData && (
                <span className="text-xs text-text-tertiary" role="status">
                  Đang tải trang…
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                variant="compact"
                isDisabled={isPlaceholderData}
              />
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
