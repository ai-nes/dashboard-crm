import { ArrowDownward, CheckCircle1, TrendUp2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { Student360Data } from "@/services/api/students/types";

import type { Student360SectionProps } from "./types";

function getSignals(data: Student360Data) {
  const scoreDelta = data.insight.scoreDelta ?? 0;
  const barrier = data.classification.dimensions.find((dimension) => dimension.id === "barrier");
  const fit = data.classification.dimensions.find((dimension) => dimension.id === "fit");
  return [
    { label: `Quan tâm ngành ${data.student.major}`, detail: data.engagement[0]?.value ?? "Tín hiệu nội dung gần nhất", change: Math.max(4, scoreDelta), bar: "bg-brand-500" },
    { label: data.acquisition.firstTouch, detail: data.acquisition.sourceGroup, change: Math.max(3, Math.round(Math.abs(scoreDelta) * 0.8)), bar: "bg-info-500" },
    { label: `${data.parentProfile.relation} tham gia quyết định`, detail: data.parentProfile.preferredChannel, change: data.parentProfile.involvement === "Cao" ? 9 : 5, bar: "bg-success-500" },
    { label: "Phản hồi tư vấn gần nhất", detail: data.classification.updatedAt, change: Math.max(3, Math.round(Math.abs(scoreDelta) * 0.55)), bar: "bg-primary-300" },
    { label: fit?.value ?? "Đang đánh giá phù hợp", detail: "Ngành và phương thức xét tuyển", change: fit?.value === "Phù hợp cao" ? 7 : 3, bar: "bg-warning-500" },
    { label: barrier?.value ?? "Rào cản cần xác minh", detail: "Điểm cần tháo gỡ", change: barrier?.value === "Không còn rào cản chính" ? 2 : -6, bar: barrier?.value === "Không còn rào cản chính" ? "bg-success-500" : "bg-error-500" },
  ];
}

export default function StudentSignalCard({ data }: Student360SectionProps) {
  const probability = data.insight.probability;
  const scoreDelta = data.insight.scoreDelta ?? 13;
  const baseline = data.insight.baseline ?? 41;
  const confidence = data.insight.confidence ?? 76;
  const isPriority = probability >= 70;
  const signals = getSignals(data);
  const barrier = data.classification.dimensions.find((dimension) => dimension.id === "barrier")?.value ?? "Cần xác minh";

  return (
    <Card className="flex h-full min-w-0 flex-col p-5">
      <CardHeader className="mb-5">
        <div><CardTitle>Xác suất nhập học</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Mức sẵn sàng được giải thích bằng các tín hiệu có trọng số.</p></div>
        <Badge color={isPriority ? "success" : "warning"}><TrendUp2 size={13} />{isPriority ? "Qua ngưỡng ưu tiên" : "Đang nuôi dưỡng"}</Badge>
      </CardHeader>

      <div className="grid min-w-0 flex-1 gap-6 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-background-gray-primary p-5">
          <div
            role="meter"
            aria-label="Khả năng nhập học"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={probability}
            className="flex size-40 items-center justify-center rounded-full p-3"
            style={{ background: `conic-gradient(var(--success-500) ${probability * 3.6}deg, var(--background-soft-200) 0deg)` }}
          >
            <div className="flex size-full flex-col items-center justify-center rounded-full bg-card-background"><strong className="text-4xl font-semibold tracking-[-1px] text-text-primary">{probability}%</strong><span className="mt-1 text-xs text-text-tertiary">khả năng nhập học</span></div>
          </div>
          <p className={`mt-4 text-sm font-semibold ${scoreDelta >= 0 ? "text-success-500" : "text-error-500"}`}>{scoreDelta > 0 ? "+" : ""}{scoreDelta} điểm trong 7 ngày</p>
          <div className="mt-4 grid w-full grid-cols-2 divide-x divide-card-border rounded-xl bg-background-soft-50 py-3 text-center"><div><p className="text-[11px] text-text-tertiary">Điểm đầu</p><p className="mt-1 text-sm font-semibold text-text-primary">{baseline}%</p></div><div><p className="text-[11px] text-text-tertiary">Độ tin cậy</p><p className="mt-1 text-sm font-semibold text-text-primary">{confidence}%</p></div></div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-text-primary">Tín hiệu đóng góp</p><p className="mt-1 text-xs text-text-tertiary">Tác động lên xác suất trong cửa sổ 30 ngày.</p></div><span className="text-xs text-text-tertiary">6 tín hiệu</span></div>
          <ul className="space-y-3">{signals.map((signal) => {
            const positive = signal.change > 0;
            return <li key={signal.label} className="grid grid-cols-[20px_minmax(0,1fr)_52px] items-center gap-2.5"><span className={`flex size-5 items-center justify-center rounded-full ${positive ? "bg-badge-success-background text-success-500" : "bg-badge-error-background text-error-500"}`} aria-hidden="true">{positive ? <CheckCircle1 size={13} /> : <ArrowDownward size={13} />}</span><div className="min-w-0"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium text-text-primary">{signal.label}</p><span className="hidden text-[11px] text-text-tertiary sm:inline">{signal.detail}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background-soft-100"><div className={`h-full rounded-full ${signal.bar}`} style={{ width: `${Math.max(18, Math.abs(signal.change) * 6)}%` }} /></div></div><span className={`text-right text-xs font-semibold ${positive ? "text-success-500" : "text-error-500"}`}>{positive ? "+" : ""}{signal.change}</span></li>;
          })}</ul>
        </div>
      </div>
      <div className="mt-auto pt-5">
        <div className="grid min-h-24 items-center gap-3 rounded-2xl border border-card-border bg-background-gray-primary p-4 sm:grid-cols-3">
          <QuickRead label="Động lượng" value={`+${scoreDelta} điểm`} detail="trong 7 ngày" tone="text-success-500" />
          <QuickRead label="Ngưỡng ưu tiên" value={isPriority ? "Đã vượt" : "Chưa đạt"} detail="mốc 70%" tone={isPriority ? "text-success-500" : "text-warning-500"} />
          <QuickRead label="Điểm cần gỡ" value={barrier} detail="tác động lớn nhất" tone={barrier === "Không còn rào cản chính" ? "text-success-500" : "text-warning-500"} />
        </div>
      </div>
    </Card>
  );
}

function QuickRead({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <div className="min-w-0"><p className="text-[11px] text-text-tertiary">{label}</p><p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p><p className="mt-0.5 text-xs text-text-secondary">{detail}</p></div>;
}
