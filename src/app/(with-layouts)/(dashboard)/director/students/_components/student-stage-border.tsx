"use client";

import { useStudentAuditLogsQuery } from "@/hooks/use-student-audit-query";
import type { StudentStatus } from "@/services/api/students/types";
import StudentStageBorderSegment from "./student-stage-border-item";
import { buildStudentStageBorder } from "./student-stage-border-model";

interface StudentStageBorderProps {
  studentId: string;
  status: StudentStatus;
}

export default function StudentStageBorder({
  studentId,
  status,
}: StudentStageBorderProps) {
  const audit = useStudentAuditLogsQuery({
    student: studentId,
    pageLength: 100,
  });
  const items = buildStudentStageBorder(status, audit.data?.logs ?? []);

  return (
    <ol
      aria-label="Tiến trình tuyển sinh"
      className="-mx-px -mt-px flex min-w-0 gap-0.5"
    >
      {items.map((item) => (
        <StudentStageBorderSegment
          key={item.status}
          item={item}
          isLoading={audit.isPending}
          hasError={audit.isError}
        />
      ))}
    </ol>
  );
}
