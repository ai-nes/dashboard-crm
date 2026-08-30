import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { regionalDemandMatrix } from "./data";

const heatTone = (value: number) => value >= 85 ? "bg-brand-500 text-white-100" : value >= 70 ? "bg-primary-200 text-primary-text" : value >= 55 ? "bg-primary-100 text-primary-text" : "bg-background-soft-100 text-text-secondary";

export default function RegionalDemandHeatmap() {
  return (
    <Card className="min-w-0 overflow-hidden bg-card-background p-0">
      <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Nhu cầu ngành theo địa bàn</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Chỉ số nhu cầu tương đối; ô đậm là nơi đáng mở phân tích phân khúc.</p></div><span className="text-xs text-text-tertiary">Thang điểm 0–100</span></CardHeader>
      <div className="overflow-x-auto p-4 sm:p-5"><table className="w-full min-w-[680px] border-separate border-spacing-1.5 text-left text-xs"><thead><tr><th className="px-2 py-2 font-medium text-text-tertiary">Ngành quan tâm</th><th className="px-2 py-2 text-center font-medium text-text-tertiary">TP.HCM</th><th className="px-2 py-2 text-center font-medium text-text-tertiary">Đồng Nai</th><th className="px-2 py-2 text-center font-medium text-text-tertiary">Bình Dương</th><th className="px-2 py-2 text-center font-medium text-text-tertiary">Cần Thơ</th><th className="px-2 py-2 text-center font-medium text-text-tertiary">Đà Nẵng</th></tr></thead><tbody>{regionalDemandMatrix.map((row) => <tr key={row.interest}><th scope="row" className="whitespace-nowrap px-2 py-3 font-medium text-text-secondary">{row.interest}</th>{[row.hcm, row.dongNai, row.binhDuong, row.canTho, row.daNang].map((value, index) => <td key={`${row.interest}-${index}`} className={`rounded-lg px-2 py-3 text-center font-semibold ${heatTone(value)}`}>{value}</td>)}</tr>)}</tbody></table></div>
      <div className="flex flex-wrap items-center gap-4 border-t border-card-border px-5 py-3 text-[11px] text-text-tertiary"><span>Thấp</span><span className="size-3 rounded bg-background-soft-100" /><span className="size-3 rounded bg-primary-100" /><span className="size-3 rounded bg-primary-200" /><span className="size-3 rounded bg-brand-500" /><span>Cao</span><span className="ml-auto font-medium text-text-secondary">Đồng Nai · AI đang là điểm nóng nhất</span></div>
    </Card>
  );
}
