"use client";

import { useStudentAuditLogsQuery } from "@/hooks/use-student-audit-query";
import type { StudentAuditLog } from "@/services/api/student-audit";

import StudentAuditCard from "./student-audit-card";

interface StudentAuditTabProps {
  studentId: string;
}

const EMPTY_AUDIT_LOGS: StudentAuditLog[] = [];

export default function StudentAuditTab({
  studentId,
}: StudentAuditTabProps) {
  const studentAuditQuery = useStudentAuditLogsQuery({
    student: studentId.trim(),
    pageLength: 100,
  });

  return (
    <StudentAuditCard
      events={studentAuditQuery.data?.logs ?? EMPTY_AUDIT_LOGS}
      isLoading={studentAuditQuery.isPending}
      error={studentAuditQuery.error}
    />
  );
}
