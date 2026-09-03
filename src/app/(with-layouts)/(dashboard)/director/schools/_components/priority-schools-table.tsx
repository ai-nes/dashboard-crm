import { ArrowRight, TrendUp2 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { PrioritySchoolReport } from "@/services/api/schools/types";

interface PrioritySchoolsTableProps {
  schools: PrioritySchoolReport[];
}

export default function PrioritySchoolsTable({ schools }: PrioritySchoolsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Trường cần ưu tiên tiếp cận</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Xếp hạng theo điểm tiềm năng và dự báo số học sinh nhập học.</p></div><Badge color="success">Top {schools.length}</Badge></CardHeader>
      <div className="overflow-x-auto"><table className="w-full min-w-180 text-left text-sm"><thead className="bg-background-soft-50 text-xs text-text-tertiary"><tr><th className="px-5 py-3 font-medium">Trường THPT</th><th className="px-4 py-3 font-medium">Địa bàn</th><th className="px-4 py-3 text-right font-medium">Tiềm năng</th><th className="px-4 py-3 text-right font-medium">Học sinh lớp 12</th><th className="px-4 py-3 text-right font-medium">Dự báo nhập học</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-card-border">{schools.map((item, index) => <tr key={item.school.id} className="transition hover:bg-background-soft-50"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-badge-primary-background text-xs font-semibold text-badge-primary-text">{index + 1}</span><div><p className="font-medium text-text-primary">{item.school.name}</p><p className="mt-0.5 text-xs text-text-tertiary">Mã trường {item.school.schoolCode}</p></div></div></td><td className="px-4 py-3.5"><p className="text-text-secondary">{item.school.province}</p><p className="mt-0.5 text-xs text-text-tertiary">{item.region}</p></td><td className="px-4 py-3.5 text-right"><span className="font-semibold text-success-500">{item.potentialScore}/100</span></td><td className="px-4 py-3.5 text-right text-text-secondary">{item.grade12Students.toLocaleString("vi-VN")}</td><td className="px-4 py-3.5 text-right"><span className="inline-flex items-center gap-1 text-text-secondary"><TrendUp2 size={14} className="text-success-500" />{item.enrollmentForecast}</span></td><td className="px-5 py-3.5 text-right"><Link href={`/director/schools/${item.school.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-button-primary-outline-text hover:text-button-primary-outline-hover-text">Chi tiết<ArrowRight size={14} /></Link></td></tr>)}</tbody></table></div>
    </Card>
  );
}
