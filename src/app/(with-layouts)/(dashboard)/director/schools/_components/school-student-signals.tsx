import { ArrowRight, CheckCircle1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolStudentSignalsProps {
  data: SchoolIntelligenceData;
}

function probabilityColor(probability: number): "success" | "primary" | "warning" {
  if (probability >= 80) return "success";
  if (probability >= 65) return "primary";
  return "warning";
}

export default function SchoolStudentSignals({ data }: SchoolStudentSignalsProps) {
  return (
    <Card className="min-w-0 p-0">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <CardTitle>Tín hiệu học sinh nổi bật</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Những prospect nên được ưu tiên chăm sóc tiếp theo.</p>
        </div>
        <Link href="/director/students" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring">Mở danh sách <ArrowRight size={13} /></Link>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-background-soft-50 text-[11px] text-text-tertiary"><tr><th className="px-5 py-3 font-medium">Học sinh</th><th className="px-3 py-3 font-medium">Ngành quan tâm</th><th className="px-3 py-3 font-medium">Giai đoạn</th><th className="px-3 py-3 font-medium">Xác suất</th><th className="px-3 py-3 font-medium">Phụ trách</th><th className="px-5 py-3 font-medium">Tương tác gần nhất</th></tr></thead>
          <tbody className="divide-y divide-card-border">
            {data.studentSignals.map((student) => (
              <tr className="transition hover:bg-background-soft-50" key={student.id}>
                <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-[10px] font-semibold text-badge-primary-text">{student.name.replaceAll(".", "").slice(0, 2)}</span><div><p className="font-semibold text-text-primary">{student.name}</p><p className="mt-0.5 text-[11px] text-text-tertiary">Quan tâm: {student.concern}</p></div></div></td>
                <td className="px-3 py-3.5 font-medium text-text-secondary">{student.major}</td>
                <td className="px-3 py-3.5"><Badge color={probabilityColor(student.probability)}>{student.stage}</Badge></td>
                <td className="px-3 py-3.5"><span className="inline-flex items-center gap-1 font-semibold text-text-primary"><CheckCircle1 size={14} className="text-success-500" />{student.probability}%</span></td>
                <td className="px-3 py-3.5 text-text-secondary">{student.owner}</td>
                <td className="px-5 py-3.5 text-text-secondary">{student.lastInteraction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
