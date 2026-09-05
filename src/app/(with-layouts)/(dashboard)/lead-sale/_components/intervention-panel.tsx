import {
  ArrowRight,
  FileTextMultiple,
  InfoCircle,
  InfoTriangle,
  UserPencil,
} from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { InterventionItem } from "./data";

const interventionStyles = {
  violet: {
    icon: "bg-badge-violet-background text-badge-violet-text",
    badge: "violet" as const,
  },
  warning: {
    icon: "bg-badge-warning-background text-badge-warning-text",
    badge: "warning" as const,
  },
  error: {
    icon: "bg-badge-error-background text-badge-error-text",
    badge: "error" as const,
  },
  sky: {
    icon: "bg-badge-sky-background text-badge-sky-text",
    badge: "sky" as const,
  },
};

function InterventionIcon({ itemId }: { itemId: string }) {
  if (itemId === "unassigned")
    return <UserPencil size={18} aria-hidden="true" />;
  if (itemId === "blocked")
    return <FileTextMultiple size={18} aria-hidden="true" />;
  return <InfoTriangle size={18} aria-hidden="true" />;
}

export default function InterventionPanel({
  items,
}: {
  items: InterventionItem[];
}) {
  return (
    <Card className="min-w-0 p-0">
      <CardHeader className="border-b border-card-border px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Cần can thiệp</CardTitle>
            <Badge color="warning" size="sm">
              4 nhóm
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Những việc trưởng nhóm cần quyết định hoặc hỗ trợ.
          </p>
        </div>
        <InfoCircle
          size={18}
          className="text-icon-tertiary"
          aria-label="Các nhóm cần can thiệp"
        />
      </CardHeader>

      <div className="divide-y divide-card-border">
        {items.map((item) => {
          const styles = interventionStyles[item.tone];

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-background-soft-50 sm:px-6"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
              >
                <InterventionIcon itemId={item.id} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {item.label}
                  </p>
                  <Badge color={styles.badge} size="sm">
                    {item.value}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-text-tertiary">
                  {item.note}
                </p>
              </div>
              <Link
                href={item.href}
                className="group inline-flex shrink-0 items-center gap-1 rounded-lg border border-button-primary-outline-stroke bg-button-primary-outline-background px-2.5 py-1.5 text-[11px] font-semibold text-button-primary-outline-text transition-colors hover:bg-button-primary-outline-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                aria-label={`${item.action} nhóm ${item.label}`}
              >
                {item.action}
                <ArrowRight
                  size={13}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
