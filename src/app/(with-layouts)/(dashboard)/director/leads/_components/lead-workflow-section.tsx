import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import LeadContactLogCell from "./lead-contact-log-cell";
import { LeadDetailField as Field } from "./lead-detail-field";
import LeadResultCell from "./lead-result-cell";
import {
  leadStageStatusLabel,
  leadStageStatusOptions,
  leadStageTriggerClass,
  type LeadResultStatus,
  type LeadStageStatus,
} from "./lead-status";

interface LeadWorkflowSectionProps {
  leadName: string;
  status: LeadStageStatus | null;
  result: LeadResultStatus | "";
  contactNoAnswer: number;
  contactSuccess: number;
  onStatusChange: (status: LeadStageStatus) => void;
  onResultChange: (result: LeadResultStatus) => void;
}

export default function LeadWorkflowSection({
  leadName,
  status,
  result,
  contactNoAnswer,
  contactSuccess,
  onStatusChange,
  onResultChange,
}: LeadWorkflowSectionProps) {
  return (
    <section
      className="mt-3 border-t border-card-border pt-2"
      aria-labelledby="lead-workflow-heading"
    >
      <h2 id="lead-workflow-heading" className="sr-only">
        Trạng thái xử lý
      </h2>
      <dl className="grid divide-y divide-card-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 [&>div]:px-3 [&>div]:py-2 [&>div>dt]:text-[11px] [&>div>dd]:mt-1">
        <Field
          label="Trạng thái xử lý"
          value={
            status ? (
              <Select
                value={status}
                onChange={(value) =>
                  onStatusChange(String(value) as LeadStageStatus)
                }
                aria-label={`Đổi trạng thái lead ${leadName}`}
                className="w-fit min-w-32"
              >
                <SelectTrigger
                  size="sm"
                  className={`w-full ${leadStageTriggerClass[status]}`}
                >
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {leadStageStatusOptions.map((option) => (
                    <SelectItem
                      key={option}
                      id={option}
                      textValue={leadStageStatusLabel[option]}
                    >
                      {leadStageStatusLabel[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm text-text-tertiary">Chưa cập nhật</span>
            )
          }
        />
        <Field
          label="Kết quả"
          value={
            <LeadResultCell
              leadName={leadName}
              status={status}
              result={result}
              onChange={onResultChange}
            />
          }
        />
        <Field
          label="Số lần liên hệ"
          value={
            <LeadContactLogCell
              compact
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
