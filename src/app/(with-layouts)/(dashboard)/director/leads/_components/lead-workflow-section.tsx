import { Badge } from "@/components/tailgrids/core/badge";

import LeadContactLogCell from "./lead-contact-log-cell";
import { LeadDetailField as Field } from "./lead-detail-field";
import LeadResultCell from "./lead-result-cell";
import {
  leadStageStatusColor,
  leadStageStatusLabel,
  type LeadResultStatus,
  type LeadStageStatus,
} from "./lead-status";

interface LeadWorkflowSectionProps {
  leadId: string;
  leadName: string;
  status: LeadStageStatus | null;
  result: LeadResultStatus | "";
  contactNoAnswer: number;
  contactSuccess: number;
}

export default function LeadWorkflowSection({
  leadId,
  leadName,
  status,
  result,
  contactNoAnswer,
  contactSuccess,
}: LeadWorkflowSectionProps) {
  return (
    <section
      className="mt-3 border-t border-card-border pt-2"
      aria-labelledby="lead-workflow-heading"
    >
      <h2 id="lead-workflow-heading" className="sr-only">
        Trạng thái hiện tại và kết quả hiện tại
      </h2>
      <dl className="grid divide-y divide-card-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 [&>div]:px-3 [&>div]:py-2 [&>div>dt]:text-[11px] [&>div>dd]:mt-1">
        <Field
          label="Trạng thái hiện tại"
          value={
            status ? (
              <Badge
                color={leadStageStatusColor[status]}
                size="md"
                className="whitespace-nowrap border border-current px-2.5 py-1 text-sm font-semibold shadow-xs"
              >
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-current ring-2 ring-current/20"
                />
                {leadStageStatusLabel[status]}
              </Badge>
            ) : (
              <span className="text-sm text-text-tertiary">Chưa cập nhật</span>
            )
          }
        />
        <Field
          label="Kết quả hiện tại"
          value={<LeadResultCell current result={result} />}
        />
        <Field
          label="Số lần liên hệ"
          value={
            <LeadContactLogCell
              compact
              leadId={leadId}
              leadName={leadName}
              noAnswer={contactNoAnswer}
              success={contactSuccess}
            />
          }
        />
      </dl>
    </section>
  );
}
