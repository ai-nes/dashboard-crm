"use client";

import { useLeadAuditLogsQuery } from "@/hooks/use-student-audit-query";
import type { StudentAuditLog } from "@/services/api/student-audit";

import StudentAuditCard from "../../students/_components/student-audit-card";

interface LeadLogTabProps {
  leadId: string;
  enabled?: boolean;
}

const EMPTY_AUDIT_LOGS: StudentAuditLog[] = [];

export default function LeadLogTab({
  leadId,
  enabled = true,
}: LeadLogTabProps) {
  const auditQuery = useLeadAuditLogsQuery(
    { lead: leadId, pageLength: 100 },
    { enabled },
  );

  return (
    <StudentAuditCard
      events={auditQuery.data?.logs ?? EMPTY_AUDIT_LOGS}
      isLoading={auditQuery.isPending}
      error={auditQuery.error}
    />
  );
}
