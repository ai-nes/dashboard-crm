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
import {
  useAssignedStudentsQuery,
  useDirectorStudentsQuery,
  useStudent360Query,
} from "@/hooks/use-students-queries";
import { studentAuditKeys } from "@/hooks/use-student-audit-query";
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
import StudentAdmissionInformationMockup from "./student-admission-information-mockup";
import StudentAdmissionTabs from "./student-admission-tabs";
import StudentAuditTab from "./student-audit-tab";
import StudentClassificationCockpit from "./student-classification-cockpit";
import StudentHeader from "./student-header";
import StudentHighSchoolMockup from "./student-high-school-mockup";
import StudentHighSchoolScoreMockup from "./student-high-school-score-mockup";
import StudentPersonalContactMockup from "./student-personal-contact-mockup";
import { isHighSchoolAdmissionMethod } from "./student-admission-method";
import { canTransitionStudentStatus } from "./student-status";

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
  targetStudent: string;
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
    studentId?.trim() ||
    propData?.student.code?.trim() ||
    propData?.student.name?.trim() ||
    "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentOwnerDraft, setStudentOwnerDraft] = useState<{
    studentId: string;
    owner: string;
  } | null>(null);
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
    mutationFn: ({
      targetStudent,
      targetStage,
    }: StudentStageTransitionVariables) =>
      requestStudentStageTransition({
        student: targetStudent,
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
      await queryClient.invalidateQueries({ queryKey: studentAuditKeys.all });
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
  const canAssignStudent = permissions.student.canAssign && canUpdateStudent;
  const readScope = permissions.student.readScope ?? permissions.student.scope;
  const isSessionScopedStudentQuery =
    readScope === "assigned" || readScope === "team";
  const revisionLookupParams = {
    admissionYear: 2026,
    page: 1,
    pageSize: 1,
    q: data?.student.code || targetId,
  };
  const needsRevisionLookup = data?.student.revision === undefined;
  const sessionScopedRevisionQuery = useAssignedStudentsQuery(
    revisionLookupParams,
    user?.user,
    {
      enabled:
        isSessionScopedStudentQuery &&
        canAssignStudent &&
        needsRevisionLookup &&
        Boolean(data) &&
        !isAuthLoading,
    },
  );
  const allStudentsRevisionQuery = useDirectorStudentsQuery(
    revisionLookupParams,
    {
      enabled:
        !isSessionScopedStudentQuery &&
        canAssignStudent &&
        needsRevisionLookup &&
        Boolean(data) &&
        !isAuthLoading,
    },
  );
  const revisionLookupData = isSessionScopedStudentQuery
    ? sessionScopedRevisionQuery.data
    : allStudentsRevisionQuery.data;
  const ownerRevision =
    data?.student.revision ??
    revisionLookupData?.data.find(
      (student) =>
        student.id === targetId || student.code === data?.student.code,
    )?.revision;
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
    null;
  const canonicalStudentId = data?.student.studentId;
  const studentOwner =
    (studentOwnerDraft?.studentId === targetId
      ? studentOwnerDraft.owner
      : null) ??
    data?.student.counselor ??
    "";
  const handleStudentStatusChange = async (
    nextStatus: StudentStatus,
  ): Promise<boolean> => {
    if (!canonicalStudentId) {
      toast.error("Hồ sơ này chưa được liên kết với bản ghi CRM Student.");
      return false;
    }
    if (!studentStatus) {
      toast.error("Hồ sơ chưa có trạng thái Student hợp lệ.");
      return false;
    }
    if (!canTransitionStudentStatus(studentStatus, nextStatus)) {
      toast.error("Trạng thái chỉ được chuyển theo đúng quy trình.");
      return false;
    }
    setStudentStatusDraft({ studentId: targetId, status: nextStatus });
    try {
      await stageTransitionMutation.mutateAsync({
        student: targetId,
        targetStudent: canonicalStudentId,
        targetStage: nextStatus,
      });
      return true;
    } catch {
      return false;
    }
  };
  const handleStudentOwnerChange = (owner: string) => {
    setStudentOwnerDraft({ studentId: targetId, owner });
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
          data={data}
          isStatusUpdating={stageTransitionMutation.isPending}
          status={studentStatus}
          onStatusChange={
            canUpdateStudent ? handleStudentStatusChange : undefined
          }
          onDeleteRequest={
            canDeleteStudent ? () => setDeleteDialogOpen(true) : undefined
          }
          onOwnerChange={handleStudentOwnerChange}
          owner={studentOwner}
          ownerEditable={canAssignStudent}
          ownerRevision={ownerRevision}
          studentId={targetId}
          tagStudentId={canonicalStudentId}
          tagsEditable={canUpdateStudent && Boolean(canonicalStudentId)}
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
          studentId={canonicalStudentId || targetId}
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
  canUpdateStudent: boolean,
): DetailTabItem[] {
  const auditStudentId = data.student.studentId || analysisTargetId;
  const showHighSchoolScore = isHighSchoolAdmissionMethod(data);
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
      id: "student-profile",
      label: "Hồ sơ học sinh",
      content: (
        <StudentPersonalContactMockup
          canEdit={canUpdateStudent}
          data={data}
          studentId={analysisTargetId}
        />
      ),
    },
    {
      id: "academic-admission",
      label: "Học tập và tuyển sinh",
      content: (
        <div className="space-y-6">
          <StudentAdmissionInformationMockup data={data} />
          <div
            className={
              showHighSchoolScore
                ? "grid items-stretch gap-6 lg:grid-cols-2"
                : "grid items-stretch gap-6"
            }
          >
            <StudentHighSchoolMockup
              canEdit={canUpdateStudent}
              data={data}
              studentId={analysisTargetId}
            />
            {showHighSchoolScore && (
              <StudentHighSchoolScoreMockup
                canEdit={canUpdateStudent}
                data={data}
                studentId={analysisTargetId}
              />
            )}
          </div>
        </div>
      ),
    },
    {
      id: "admission",
      label: "Nhập học",
      content: <StudentAdmissionTabs data={data} />,
    },
    {
      id: "audit",
      label: "Nhật ký",
      content: <StudentAuditTab studentId={auditStudentId} />,
    },
  ];
}

function getInitialTab(initialTab?: string, initialTaskId?: string): string {
  if (initialTaskId) return "tasks";

  if (initialTab === "activities") return "calls";

  const supportedTabs = new Set([
    "decision",
    "student-profile",
    "academic-admission",
    "admission",
    "notes",
    "tasks",
    "interactions",
    "profile",
    "audit",
  ]);

  const legacyTabAliases: Record<string, string> = {
    family: "student-profile",
    profile: "student-profile",
    records: "admission",
    zalo: "interactions",
    calls: "interactions",
    log: "audit",
  };
  const normalizedTab = initialTab
    ? legacyTabAliases[initialTab] || initialTab
    : undefined;

  return normalizedTab && supportedTabs.has(normalizedTab)
    ? normalizedTab
    : "decision";
}
