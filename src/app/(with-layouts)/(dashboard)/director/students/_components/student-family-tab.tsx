import { Phone } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import ParentProfileCard from "./parent-profile-card";
import type { Student360SectionProps } from "./types";

export default function StudentFamilyTab({ data }: Student360SectionProps) {
  return <div className="grid items-stretch gap-5 lg:grid-cols-2"><ParentProfileCard data={data} /><Card className="h-full p-5"><CardHeader className="mb-5"><div><CardTitle>Băn khoăn cần tháo gỡ</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Các câu hỏi chưa được giải quyết hoàn toàn; lịch sử trao đổi đã nằm trong dòng điểm chạm phía trên.</p></div><Badge color="warning">{data.parentProfile.concerns.length} nhóm quan tâm</Badge></CardHeader><div className="space-y-3"><div className="rounded-lg border border-warning-200 bg-badge-warning-background p-4"><p className="text-sm font-semibold text-badge-warning-text">{data.parentProfile.concerns[0]}</p><p className="mt-1 text-xs leading-5 text-text-secondary">Đây là rào cản ưu tiên cần được xử lý trong lần trao đổi tiếp theo.</p></div>{data.parentProfile.concerns.slice(1).map((concern) => <div key={concern} className="rounded-lg border border-card-border p-4"><p className="text-sm font-semibold text-text-primary">{concern}</p></div>)}</div><div className="mt-5 flex items-start gap-2 border-t border-card-border pt-4 text-xs leading-5 text-text-secondary"><Phone size={15} className="mt-0.5 shrink-0 text-primary-500" aria-hidden="true" /><span>Ưu tiên {data.parentProfile.preferredChannel.toLowerCase()} với {data.parentProfile.relation.toLowerCase()} trong khung {data.parentProfile.bestContactTime}.</span></div></Card></div>;
}
