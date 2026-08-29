import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const levelColor = { Cao: "success", "Trung bình": "warning", Thấp: "gray" } as const;

export default function ContextCards({ data }: Student360SectionProps) {
  return <div className="grid items-stretch gap-5 lg:grid-cols-2"><Card className="h-full p-5"><CardHeader className="mb-4"><div><CardTitle>Tương tác gần đây</CardTitle><p className="mt-1 text-xs text-text-tertiary">30 ngày gần nhất</p></div></CardHeader><div className="divide-y divide-card-border">{data.engagement.map((item) => <div key={item.label} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium text-text-primary">{item.label}</p><p className="mt-1 text-xs leading-5 text-text-tertiary">{item.value}</p></div><Badge color={levelColor[item.level]}>{item.level}</Badge></div>)}</div></Card><Card className="h-full p-5"><CardHeader className="mb-4"><div><CardTitle>Gia đình & quyết định</CardTitle><p className="mt-1 text-xs text-text-tertiary">Ngữ cảnh cho lần trao đổi tiếp theo</p></div></CardHeader><div className="space-y-4">{data.family.map((item) => <div key={item.label}><p className="text-xs text-text-tertiary">{item.label}</p><p className={`mt-1 text-sm font-medium ${item.emphasis ? "text-badge-primary-text" : "text-text-primary"}`}>{item.value}</p></div>)}</div></Card></div>;
}
