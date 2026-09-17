import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type {
  SaleDashboardLeadRecord,
  SaleDashboardStudentRecord,
} from "./sale-dashboard-detail.types";
import RecentLeadRow from "./recent-lead-row";
import RecentStudentRow from "./recent-student-row";

interface RecentRecordsProps {
  leads: SaleDashboardLeadRecord[];
  students: SaleDashboardStudentRecord[];
  timezone: string;
  onOpenLead: (lead: SaleDashboardLeadRecord) => void;
  onOpenStudent: (student: SaleDashboardStudentRecord) => void;
}

export default function RecentRecords({
  leads,
  students,
  timezone,
  onOpenLead,
  onOpenStudent,
}: RecentRecordsProps) {
  return (
    <section
      aria-label="Hồ sơ mới"
      className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2"
    >
      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="items-center gap-3 border-b border-card-border px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle>Lead mới</CardTitle>
            <Badge color="gray" size="sm">
              {leads.length}
            </Badge>
          </div>
          <Link
            href="/sale/leads"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Tất cả Lead
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </CardHeader>
        {leads.length > 0 ? (
          <ul
            aria-label="Lead mới tiếp nhận"
            className="divide-y divide-card-border"
          >
            {leads.slice(0, 2).map((lead) => (
              <RecentLeadRow
                key={lead.id}
                lead={lead}
                timezone={timezone}
                onOpen={onOpenLead}
              />
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-text-tertiary">
            Chưa có dữ liệu Lead mới.
          </p>
        )}
      </Card>

      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="items-center gap-3 border-b border-card-border px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle>Học sinh mới</CardTitle>
            <Badge color="gray" size="sm">
              {students.length}
            </Badge>
          </div>
          <Link
            href="/sale/students"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Tất cả học sinh
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </CardHeader>
        {students.length > 0 ? (
          <ul
            aria-label="Học sinh mới trong CRM"
            className="divide-y divide-card-border"
          >
            {students.slice(0, 2).map((record) => (
              <RecentStudentRow
                key={record.student.studentId}
                record={record}
                onOpen={onOpenStudent}
              />
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-text-tertiary">
            Chưa có dữ liệu học sinh mới.
          </p>
        )}
      </Card>
    </section>
  );
}
