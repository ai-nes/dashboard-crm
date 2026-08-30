import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/tailgrids/core/badge";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { StudentClassificationDimension, Student360Data } from "@/services/api/students/types";

type StudentDecisionScoreProps = {
  data: Student360Data;
};

const scoreColors = ["var(--primary-500)", "var(--info-500)", "var(--warning-500)"];

export default function StudentDecisionScore({ data }: StudentDecisionScoreProps) {
  const dimensions = data.classification.dimensions;
  const signalScore = data.insight.signalScore;
  const scoreProfile = ["Tương tác", "Gia đình", "Hồ sơ"].map((label) => ({ label, value: data.readiness.find((item) => item.label === label)?.value ?? 0 }));

  return (
    <section className="min-w-0 p-5 lg:p-6" aria-labelledby="student-score-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="student-score-heading" className="text-lg font-semibold text-text-primary">Phân loại 4 chiều</h3>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Bốn chiều độc lập để xác định hồ sơ đang ở đâu và cần chăm sóc thế nào.</p>
        </div>
        <Badge color="primary">4 chiều chính</Badge>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {dimensions.map((dimension) => <ScoreDimension key={dimension.id} dimension={dimension} />)}
      </div>

      <div className="mt-5 grid min-w-0 gap-4 rounded-xl border border-card-border bg-card-background p-3 lg:grid-cols-[10.5rem_minmax(0,1fr)] lg:items-center">
        <div className="text-center lg:border-r lg:border-card-border lg:pr-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">Điểm tín hiệu</p>
          <p className="mt-2 text-4xl leading-none font-semibold tracking-[-1px] text-primary-500">{signalScore}<span className="text-lg font-medium text-text-tertiary">/100</span></p>
          <p className="mt-2 text-xs text-text-tertiary">Chỉ số hỗ trợ ưu tiên chăm sóc</p>
          <p className={`mt-3 text-xs font-semibold ${(data.insight.scoreDelta ?? 0) >= 0 ? "text-success-500" : "text-error-500"}`}>{(data.insight.scoreDelta ?? 0) >= 0 ? "+" : ""}{data.insight.scoreDelta ?? 0} gần nhất</p>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-text-primary">Tín hiệu hỗ trợ</p><p className="mt-0.5 text-[11px] text-text-tertiary">Chỉ số tham khảo, không phải 4 chiều phân loại.</p></div><span className="text-[11px] text-text-tertiary">/ 100</span></div>
          <div className="h-28 min-h-28 w-full"><ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={scoreProfile} layout="vertical" margin={{ top: 2, right: 30, left: 0, bottom: 2 }} barCategoryGap="24%"><CartesianGrid horizontal={false} /><XAxis type="number" hide domain={[0, 100]} /><YAxis type="category" dataKey="label" width={54} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 10 }} /><Bar dataKey="value" fill="var(--primary-500)" radius={[0, 5, 5, 0]} barSize={10}>{scoreProfile.map((item, index) => <Cell key={item.label} fill={scoreColors[index]} />)}<LabelList dataKey="value" position="right" formatter={(value) => `${value}/100`} fill="var(--text-secondary)" fontSize={10} /></Bar></BarChart></ChartContainer></div>
        </div>
      </div>
    </section>
  );
}

function ScoreDimension({ dimension }: { dimension: StudentClassificationDimension }) {
  return <div className="min-w-0 rounded-xl border border-card-border bg-card-background p-3"><div className="flex min-w-0 items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className={`size-2.5 shrink-0 rounded-full ${dimension.tone === "warning" ? "bg-warning-500" : dimension.tone === "success" ? "bg-success-500" : dimension.tone === "sky" ? "bg-info-500" : "bg-primary-500"}`} aria-hidden="true" /><span className="truncate text-xs text-text-secondary">{dimension.label}</span></div><Badge color={dimension.tone}>{dimension.value}</Badge></div>{dimension.id === "fit" && dimension.fitFactors ? <p className="mt-2 text-[10px] leading-4 text-text-tertiary">{formatFitEvidence(dimension.fitFactors)}</p> : null}</div>;
}

function formatFitEvidence(factors: NonNullable<StudentClassificationDimension["fitFactors"]>) {
  return factors.filter((factor) => factor.label !== "Chi phí").map((factor) => `${factor.label === "Hồ sơ học tập" ? "Hồ sơ" : factor.label === "Phương thức xét tuyển" ? "Phương thức" : factor.label} ${factor.tone === "warning" ? "cần làm rõ" : "✓"}`).join(" · ");
}
