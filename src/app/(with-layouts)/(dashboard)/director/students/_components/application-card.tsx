import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const statusColor = { success: "success", warning: "warning", primary: "primary" } as const;

export default function ApplicationCard({ data }: Student360SectionProps) {
  return <Card className="p-5"><CardHeader className="mb-4"><div><CardTitle>Hồ sơ ứng tuyển</CardTitle><p className="mt-1 text-xs text-text-tertiary">Theo dõi mức sẵn sàng chuyển đổi.</p></div></CardHeader><dl className="divide-y divide-card-border">{data.application.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><dt className="text-sm text-text-secondary">{item.label}</dt><dd>{item.status ? <Badge color={statusColor[item.status]}>{item.value}</Badge> : <span className="text-sm font-medium text-text-primary">{item.value}</span>}</dd></div>)}</dl></Card>;
}
