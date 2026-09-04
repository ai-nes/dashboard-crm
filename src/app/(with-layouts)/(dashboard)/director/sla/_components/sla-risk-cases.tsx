import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import StudentCardEmptyState from "../../students/_components/student-card-empty-state";
import { slaRiskCases } from "./data";
import type { SlaRiskCase } from "./types";

interface SlaRiskCasesProps {
  riskCases?: SlaRiskCase[];
}

export default function SlaRiskCases({ riskCases }: SlaRiskCasesProps) {
  const rows = riskCases ?? slaRiskCases;

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="items-start border-b-[0.5px] border-card-border p-5">
        <div>
          <CardTitle>Hồ sơ cần ưu tiên chăm sóc</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Có tín hiệu quan tâm nhưng chưa có tương tác mới.
          </p>
        </div>
        <Badge color="error">{rows.length} hồ sơ</Badge>
      </CardHeader>

      {rows.length === 0 && <StudentCardEmptyState message="Chưa có dữ liệu." className="py-6" />}

      {rows.length > 0 && (
      <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b-[0.5px] border-card-border bg-background-soft-50 text-xs text-text-tertiary">
            <tr>
              <th className="px-5 py-3 font-medium">Hồ sơ</th>
              <th className="px-3 py-3 font-medium">Chưa có tương tác</th>
              <th className="px-3 py-3 font-medium">Phụ trách</th>
              <th className="px-5 py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {rows.map((riskCase) => (
              <tr key={riskCase.studentId ?? riskCase.name}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-text-primary">
                    {riskCase.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {riskCase.school}
                  </p>
                </td>
                <td className="px-3 py-3.5 font-medium text-error-500">
                  {riskCase.silentFor}
                </td>
                <td className="px-3 py-3.5 text-text-secondary">
                  {riskCase.owner}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={riskCase.href ?? "/director/students"}
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600"
                  >
                    Xem hồ sơ
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul
        className="divide-y divide-card-border md:hidden"
        aria-label="Danh sách hồ sơ cần xử lý trước"
      >
        {rows.map((riskCase) => (
          <li
            key={riskCase.studentId ?? riskCase.name}
            className="space-y-3 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">
                  {riskCase.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  {riskCase.school}
                </p>
              </div>
              <Badge color={riskCase.priority === "Cao" ? "error" : "warning"}>
                {riskCase.priority}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-text-tertiary">Chưa có tương tác</p>
                <p className="mt-1 font-semibold text-error-500">
                  {riskCase.silentFor}
                </p>
              </div>
              <div>
                <p className="text-text-tertiary">Phụ trách</p>
                <p className="mt-1 truncate font-medium text-text-primary">
                  {riskCase.owner}
                </p>
              </div>
            </div>
            <Link
              href={riskCase.href ?? "/director/students"}
              className="inline-flex text-xs font-semibold text-primary-500"
            >
              Xem hồ sơ
            </Link>
          </li>
        ))}
      </ul>
      </>
      )}
    </Card>
  );
}
