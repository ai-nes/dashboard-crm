"use client";

import { useSegmentAuditLogsQuery } from "@/hooks/use-student-audit-query";
import type { StudentAuditLog } from "@/services/api/student-audit";

import StudentAuditCard from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-audit-card";

interface SegmentAuditTabProps {
  segmentId: string;
}

const EMPTY_AUDIT_LOGS: StudentAuditLog[] = [];

export default function SegmentAuditTab({ segmentId }: SegmentAuditTabProps) {
  const auditQuery = useSegmentAuditLogsQuery({
    segment: segmentId,
  });

  return (
    <section aria-labelledby="segment-audit-heading">
      <h2 id="segment-audit-heading" className="sr-only">
        Nhật ký Segment
      </h2>
      <StudentAuditCard
        events={auditQuery.data?.logs ?? EMPTY_AUDIT_LOGS}
        isLoading={auditQuery.isPending}
        error={auditQuery.error}
        recordLabel="segment"
      />
    </section>
  );
}
