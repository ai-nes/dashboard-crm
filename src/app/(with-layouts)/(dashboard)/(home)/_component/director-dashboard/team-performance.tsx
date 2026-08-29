import { ArrowDownward, ArrowRight, ArrowUpward } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@/components/tailgrids/core/table";

import { teamPerformance } from "./data";

export default function TeamPerformance() {
  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="p-5 pb-4 sm:px-6 sm:pt-6">
        <div>
          <CardTitle>Hiệu suất cơ sở & đội tuyển sinh</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">So sánh năng suất và chất lượng xử lý hồ sơ</p>
        </div>
        <a href="/director/regional-performance" className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
          Xem báo cáo
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </CardHeader>

      <TableRoot className="min-w-[620px] rounded-none border-x-0 border-b-0">
        <TableHeader>
          <TableRow>
            <TableHead>Đội / Cơ sở</TableHead>
            <TableHead className="text-right">Hồ sơ đang xử lý</TableHead>
            <TableHead className="text-right">SLA</TableHead>
            <TableHead className="text-right">Đã nhập học</TableHead>
            <TableHead className="text-right">Tỷ lệ chuyển đổi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamPerformance.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="text-sm text-text-primary">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background-gray-primary text-xs font-semibold text-text-secondary">
                    {team.campus}
                  </span>
                  <span className="whitespace-nowrap">{team.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-sm">{team.activeLeads}</TableCell>
              <TableCell className="text-right">
                <span className={team.sla.startsWith("88") ? "font-semibold text-orange-600" : "font-semibold text-green-600"}>
                  {team.sla}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-text-primary">{team.enrolled}</TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  {team.trend === "up" ? (
                    <ArrowUpward size={14} className="text-green-600" aria-label="Tăng" />
                  ) : (
                    <ArrowDownward size={14} className="text-red-600" aria-label="Giảm" />
                  )}
                  {team.conversion}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </Card>
  );
}
