import { Phone } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import ParentProfileCard from "./parent-profile-card";
import type { Student360SectionProps } from "./types";

export default function StudentFamilyTab({ data }: Student360SectionProps) {
  const concerns = data.parentProfile?.concerns ?? [];
  const contactInfo = [data.parentProfile?.preferredChannel, data.parentProfile?.bestContactTime].filter(Boolean).join(" · ") || "-";

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2">
      <ParentProfileCard data={data} />
      <Card className="h-full p-5">
        <CardHeader className="mb-5">
          <CardTitle>Mối quan tâm</CardTitle>
          <Badge color="warning">{concerns.length} nhóm</Badge>
        </CardHeader>
        <div className="space-y-3">
          {concerns.length > 0 ? (
            <>
              <div className="rounded-lg border border-warning-200 bg-badge-warning-background p-4">
                <p className="text-sm font-semibold text-badge-warning-text">{concerns[0]}</p>
              </div>
              {concerns.slice(1).map((concern) => (
                <div key={concern} className="rounded-lg border border-card-border p-4">
                  <p className="text-sm font-semibold text-text-primary">{concern}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="rounded-lg border border-card-border p-4">
              <p className="text-sm text-text-tertiary">Chưa ghi nhận mối quan tâm cụ thể</p>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-start gap-2 border-t border-card-border pt-4 text-xs leading-5 text-text-secondary">
          <Phone size={15} className="mt-0.5 shrink-0 text-primary-500" aria-hidden="true" />
          <span>{contactInfo}</span>
        </div>
      </Card>
    </div>
  );
}
