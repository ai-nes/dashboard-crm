import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { Student360Data } from "@/services/api/students/types";

import StudentScoreTooltip from "./student-score-tooltip";

type StudentDecisionScoreProps = {
  data: Student360Data;
};

const scoreColors = ["var(--primary-500)", "var(--info-500)", "var(--warning-500)"];

export default function StudentDecisionScore({ data }: StudentDecisionScoreProps) {
  const signalScore = data.insight.signalScore;
  const scoreProfile = ["Tương tác", "Gia đình", "Hồ sơ"].map((label) => {
    const readiness = data.readiness.find((item) => item.label === label);

    return { label, value: readiness?.value ?? 0, summary: readiness?.detail ?? "-" };
  });

  return (
    <section className="min-w-0 p-5 lg:flex lg:h-full lg:flex-col lg:p-6" aria-labelledby="student-score-heading">
      <h3 id="student-score-heading" className="text-lg font-semibold text-text-primary">Đánh giá học sinh này</h3>

      <div className="mt-5 grid min-w-0 gap-0 lg:flex-1 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col items-center justify-center text-center lg:border-r lg:border-card-border lg:pr-6">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">Mức độ ưu tiên</p>
          <p className="mt-2 text-4xl leading-none font-semibold tracking-[-1px] text-primary-500">{signalScore != null ? signalScore : "-"}<span className="text-lg font-medium text-text-tertiary">/100</span></p>
          <p className="mt-2 text-xs text-text-tertiary">Điểm càng cao càng nên chăm sóc sớm</p>
          <p className={`mt-3 text-xs font-semibold ${(data.insight.scoreDelta ?? 0) >= 0 ? "text-success-500" : "text-error-500"}`}>{data.insight.scoreDelta != null ? `${data.insight.scoreDelta >= 0 ? "+" : ""}${data.insight.scoreDelta} gần nhất` : "-"}</p>
        </div>

        <div className="min-w-0 lg:flex lg:flex-col lg:pl-6">
          <div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-text-primary">Theo từng nguồn</p><span className="text-xs text-text-tertiary">/ 100</span></div>
          <div className="h-32 min-h-32 w-full lg:min-h-0 lg:flex-1"><ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={scoreProfile} layout="vertical" margin={{ top: 2, right: 30, left: 0, bottom: 2 }} barCategoryGap="24%"><CartesianGrid horizontal={false} /><XAxis type="number" hide domain={[0, 100]} /><YAxis type="category" dataKey="label" width={84} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} /><Tooltip cursor={{ fill: "var(--background-soft-50)" }} content={<StudentScoreTooltip />} /><Bar dataKey="value" fill="var(--primary-500)" radius={[0, 5, 5, 0]} barSize={28}>{scoreProfile.map((item, index) => <Cell key={item.label} fill={scoreColors[index]} />)}<LabelList dataKey="value" position="right" formatter={(value) => `${value}/100`} fill="var(--text-secondary)" fontSize={12} /></Bar></BarChart></ChartContainer></div>
        </div>
      </div>
    </section>
  );
}
