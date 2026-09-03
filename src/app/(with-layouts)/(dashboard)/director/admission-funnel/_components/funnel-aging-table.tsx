import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatDays(value: number | null) {
  return value === null ? "—" : `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ngày`;
}

export default function FunnelAgingTable() {
  const { aging } = useAdmissionFunnelData();

  return (
    <Card className="min-w-0 overflow-hidden p-5 xl:h-full">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Hồ sơ đang chờ xử lý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Số hồ sơ chưa chuyển bước, chia theo thời gian chờ.</p>
        </div>
        <span className="rounded-full bg-badge-error-background px-2.5 py-1 text-xs font-semibold text-badge-error-text">{formatNumber(aging.totalOverFourteenDays)} hồ sơ &gt;14 ngày</span>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
            <tr>
              <th className="pb-3 font-medium">Giai đoạn</th>
              <th className="pb-3 text-right font-medium">&lt;3 ngày</th>
              <th className="pb-3 text-right font-medium">3–7 ngày</th>
              <th className="pb-3 text-right font-medium">7–14 ngày</th>
              <th className="pb-3 text-right font-medium">&gt;14 ngày</th>
              <th className="pb-3 text-right font-medium">Thời gian chờ</th>
            </tr>
          </thead>
          <tbody>
            {aging.rows.map((row) => (
              <tr key={row.stageId} className="border-t border-card-border">
                <td className="py-3 font-medium text-text-primary">{row.stage}</td>
                <td className="py-3 text-right text-text-secondary">{formatNumber(row.underThreeDays)}</td>
                <td className="py-3 text-right text-text-secondary">{formatNumber(row.threeToSevenDays)}</td>
                <td className="py-3 text-right text-text-secondary">{formatNumber(row.sevenToFourteenDays)}</td>
                <td className={`py-3 text-right font-medium ${row.overFourteenDays >= 1000 ? "text-error-500" : "text-text-secondary"}`}>{formatNumber(row.overFourteenDays)}</td>
                <td className="py-3 text-right text-text-secondary">{formatDays(row.medianDays)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-text-tertiary">Thời gian điển hình: một nửa hồ sơ nhanh hơn, một nửa chậm hơn. Ưu tiên nhóm đã chờ trên 14 ngày.</p>
    </Card>
  );
}
