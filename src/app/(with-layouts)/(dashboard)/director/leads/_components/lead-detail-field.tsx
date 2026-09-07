import type { ReactNode } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

interface LeadDetailFieldProps {
  label: string;
  value?: ReactNode;
  className?: string;
}

export function LeadDetailField({
  label,
  value,
  className,
}: LeadDetailFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs leading-5 text-text-tertiary">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-6 text-text-primary [overflow-wrap:anywhere]">
        {value || (
          <span className="font-normal text-text-tertiary">Chưa cập nhật</span>
        )}
      </dd>
    </div>
  );
}

interface LeadDetailTagsProps {
  label: string;
  values: string[];
  className?: string;
}

export function LeadDetailTags({
  label,
  values,
  className,
}: LeadDetailTagsProps) {
  return (
    <LeadDetailField
      label={label}
      className={className}
      value={
        values.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {[...new Set(values)].map((value) => (
              <Badge
                key={value}
                color="gray"
                size="sm"
                className="max-w-full whitespace-normal [overflow-wrap:anywhere]"
              >
                {value}
              </Badge>
            ))}
          </span>
        ) : undefined
      }
    />
  );
}
