"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canAccessStudent,
  canPerformStudentAction,
  getCrmPermissions,
} from "@/components/common/auth/permissions";
import type { DetailTabItem } from "@/components/common/detail-tabs";
import { Card } from "@/components/tailgrids/core/card";
import { useStudent360Query } from "@/hooks/use-students-queries";
import {
  deleteStudent,
  requestStudentStageTransition,
} from "@/services/api/student-school-update";
import type {
  StudentChatwootInteractionsResponse,
  StudentInteractionsResponse,
  StudentStatus,
  Student360Data,
} from "@/services/api/students/types";

import StudentActivitiesTab from "./student-activities-tab";
import StudentAuditTab from "./student-audit-tab";
import StudentClassificationCockpit from "./student-classification-cockpit";
import StudentDetailsTab from "./student-details-tab";
import StudentDocumentsTab from "./student-documents-tab";
import StudentFamilyTab from "./student-family-tab";
import StudentHeader from "./student-header";
import StudentSourceContext from "./student-source-context";
import {
  canTransitionStudentStatus,
  defaultStudentStatus,
} from "./student-status";

interface Student360DashboardProps {
  studentId?: string;
  initialData?: Student360Data | null;
  initialChatwootInteractions?: StudentChatwootInteractionsResponse | null;
  initialStudentInteractions?: StudentInteractionsResponse | null;
  data?: Student360Data;
  initialTab?: string;
  initialTaskId?: string;
}

interface StudentStageTransitionVariables {
  student: string;
  targetStage: StudentStatus;
}

export default function Student360Dashboard({
  studentId,
  initialData,
  initialChatwootInteractions,
  initialStudentInteractions,
  data: propData,
  initialTab,
  initialTaskId,
}: Student360DashboardProps) {
  const targetId =
    studentId ||
    propData?.student.code ||
    propData?.student.name ||
    "nguyen-minh-an";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentStatusDraft, setStudentStatusDraft] = useState<{
    studentId: string;
    status: StudentStatus;
  } | null>(null);
  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(targetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["director-students"] });
      await queryClient.invalidateQueries({ queryKey: ["student-360"] });
      setDeleteDialogOpen(false);
      toast.success("Đã xóa hồ sơ học sinh.");
      router.replace("/director/students");
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Chưa thể xóa hồ sơ học sinh.",
      );
    },
  });
  const stageTransitionMutation = useMutation({
    mutationFn: ({ student, targetStage }: StudentStageTransitionVariables) =>
      requestStudentStageTransition({
        student,
        target_stage: targetStage,
      }),
    onSuccess: async (_result, variables) => {
      setStudentStatusDraft({
        studentId: variables.student,
        status: variables.targetStage,
      });
      await queryClient.invalidateQueries({
        queryKey: ["student-360", variables.student],
      });
      await queryClient.invalidateQueries({ queryKey: ["director-students"] });
      await queryClient.invalidateQueries({ queryKey: ["assigned-students"] });
      toast.success("Đã cập nhật trạng thái học sinh.");
    },
    onError: (error, variables) => {
      setStudentStatusDraft((draft) =>
        draft?.studentId === variables.student ? null : draft,
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể cập nhật trạng thái học sinh.",
      );
    },
  });
  const {
    data: queryData,
    isError,
    error,
  } = useStudent360Query(targetId, {
    initialData: initialData ?? propData ?? undefined,
    enabled: Boolean(targetId),
  });

  const data = queryData ?? initialData ?? propData;
  const studentOwnership = {
    owner: data?.student.counselor,
    ownerId: data?.student.ownerId,
  };
  const hasStudentAccess =
    isAuthLoading ||
    (data !== undefined &&
      data !== null &&
      canAccessStudent(permissions.student, studentOwnership, user));
  const canUpdateStudent =
    !isAuthLoading &&
    canPerformStudentAction(
      permissions.student,
      "update",
      studentOwnership,
      user,
    );
  const canDeleteStudent =
    !isAuthLoading &&
    canPerformStudentAction(
      permissions.student,
      "delete",
      studentOwnership,
      user,
    );
  const studentStatus =
    (studentStatusDraft?.studentId === targetId
      ? studentStatusDraft.status
      : null) ??
    data?.student.studentStage ??
    defaultStudentStatus;
  const handleStudentStatusChange = (nextStatus: StudentStatus) => {
    if (!canTransitionStudentStatus(studentStatus, nextStatus)) {
      toast.error("Trạng thái chỉ được chuyển theo đúng quy trình.");
      return;
    }

    setStudentStatusDraft({ studentId: targetId, status: nextStatus });
    stageTransitionMutation.mutate({
      student: targetId,
      targetStage: nextStatus,
    });
  };

  if (!isAuthLoading && data && !hasStudentAccess) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-warning-200 bg-badge-warning-background p-5 text-badge-warning-text">
          <p className="font-semibold text-base">
            Bạn không có quyền xem hồ sơ này.
          </p>
          <p className="mt-1 text-sm">
            Sale và CTV Sale chỉ được truy cập học sinh đang được phân công cho
            mình.
          </p>
        </Card>
      </main>
    );
  }

  if (isError && !data) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="font-semibold text-base">
            Không thể tải hồ sơ học sinh từ Frappe CRM
          </p>
          <p className="mt-1 text-sm">
            {error?.message || "Lỗi 403 Forbidden hoặc không tìm thấy hồ sơ."}
          </p>
        </Card>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <p className="text-text-tertiary">Đang tải hồ sơ học sinh...</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-w-0 max-w-full overflow-x-clip pb-10"
    >
      {isError && (
        <div className="px-2 pt-4 lg:px-6">
          <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
            <p className="font-semibold text-sm">
              Cảnh báo: Lỗi khi đồng bộ từ Frappe CRM
            </p>
            <p className="mt-1 text-xs">{error?.message}</p>
          </Card>
        </div>
      )}
      <div className="px-2 pt-4 lg:px-6">
        <StudentHeader
          contactCount={initialStudentInteractions?.total_interactions}
          data={data}
          isStatusUpdating={stageTransitionMutation.isPending}
          status={studentStatus}
          onStatusChange={
            canUpdateStudent ? handleStudentStatusChange : undefined
          }
          onDeleteRequest={
            canDeleteStudent ? () => setDeleteDialogOpen(true) : undefined
          }
        />
      </div>

      <div className="px-2 pt-4 lg:px-6">
        <StudentActivitiesTab
          data={data}
          defaultSelectedKey={getInitialTab(initialTab, initialTaskId)}
          detailTabs={getStudentTabs(data, targetId, canUpdateStudent)}
          initialChatwootInteractions={initialChatwootInteractions}
          initialStudentInteractions={initialStudentInteractions}
          initialTaskId={initialTaskId}
          studentId={targetId}
        />
      </div>
      <DeleteRecordDialog
        isDeleting={deleteMutation.isPending}
        isOpen={deleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        onOpenChange={setDeleteDialogOpen}
        recordName={data.student.name || targetId}
        recordType="hồ sơ học sinh"
      />
    </main>
  );
}

function getStudentTabs(
  data: Student360Data,
  analysisTargetId: string,
  canEditStudent: boolean,
): DetailTabItem[] {
  return [
    {
      id: "decision",
      label: "Tổng quan",
      content: (
        <StudentClassificationCockpit
          data={data}
          analysisTargetId={analysisTargetId}
        />
      ),
    },
    {
      id: "audit",
      label: "Nhật ký",
      content: <StudentAuditTab studentId={analysisTargetId} />,
    },
    {
      id: "profile",
      label: "Thông tin học sinh",
      content: (
        <div className="space-y-6">
          <StudentDetailsTab
            data={data}
            studentId={analysisTargetId}
            canEdit={canEditStudent}
          />
          <StudentSourceContext
            data={data}
            studentId={analysisTargetId}
            canEdit={canEditStudent}
          />
          <StudentFamilyTab data={data} canEdit={canEditStudent} />
        </div>
      ),
    },
    {
      id: "records",
      label: "Hồ sơ & tài liệu",
      content: <StudentDocumentsTab data={data} />,
    },
  ];
}

function getInitialTab(initialTab?: string, initialTaskId?: string): string {
  if (initialTaskId) return "tasks";

  if (initialTab === "activities") return "notes";

  const supportedTabs = new Set([
    "decision",
    "notes",
    "tasks",
    "zalo",
    "calls",
    "profile",
    "audit",
    "records",
  ]);

  const legacyTabAliases: Record<string, string> = {
    family: "profile",
    log: "audit",
  };
  const normalizedTab = initialTab
    ? legacyTabAliases[initialTab] || initialTab
    : undefined;

  return normalizedTab && supportedTabs.has(normalizedTab)
    ? normalizedTab
    : "decision";
}
