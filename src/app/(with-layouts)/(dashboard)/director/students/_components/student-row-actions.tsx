"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canPerformStudentAction,
  getCrmPermissions,
} from "@/components/common/auth/permissions";
import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { TableRowActions } from "@/components/common/table-row-actions";
import { deleteStudent } from "@/services/api/student-school-update";
import type { StudentListItem } from "@/services/api/students/types";
import { getBusinessRouteKey } from "@/utils/business-record-route";
import { getStudentInternalId } from "./student-identifiers";

export default function StudentRowActions({
  student,
}: {
  student: StudentListItem;
}) {
  const { user, isLoading } = useAuth();
  const permissions = getCrmPermissions(user).student;
  const ownership = { ownerId: student.ownerId };
  const canRead =
    !isLoading && canPerformStudentAction(permissions, "read", ownership, user);
  const canEdit =
    !isLoading &&
    canPerformStudentAction(permissions, "update", ownership, user);
  const canDelete =
    !isLoading &&
    canPerformStudentAction(permissions, "delete", ownership, user);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => {
      if (!canDelete)
        throw new Error("Bạn không có quyền xóa hồ sơ học sinh này.");
      return deleteStudent(getStudentInternalId(student));
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["director-students"] }),
        queryClient.invalidateQueries({ queryKey: ["assigned-students"] }),
        queryClient.invalidateQueries({ queryKey: ["student-360"] }),
      ]);
      setDeleteOpen(false);
      toast.success("Đã xóa hồ sơ học sinh.");
    },
    onError: (error) =>
      toast.error(error.message || "Chưa thể xóa hồ sơ học sinh."),
  });
  const href = `/director/students/${encodeURIComponent(getBusinessRouteKey(student.code, student.id))}`;
  return (
    <>
      <TableRowActions
        label={`học sinh ${student.code || student.name}`}
        actions={[
          { id: "view", label: "Xem chi tiết", href, isVisible: canRead },
          {
            id: "edit",
            label: "Chỉnh sửa",
            href: `${href}?tab=student-profile&edit=personal`,
            isVisible: canEdit,
          },
          {
            id: "delete",
            label: "Xóa",
            onAction: () => setDeleteOpen(true),
            isVisible: canDelete,
            isDisabled: remove.isPending,
            variant: "danger",
          },
        ]}
      />
      {canDelete && (
        <DeleteRecordDialog
          isOpen={deleteOpen}
          onOpenChange={setDeleteOpen}
          recordType="hồ sơ học sinh"
          recordName={student.name}
          isDeleting={remove.isPending}
          onConfirm={() => remove.mutate()}
        />
      )}
    </>
  );
}
