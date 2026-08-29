"use client";

import type { Student360Data } from "@/services/api/students/types";

import AiInsight from "./ai-insight";
import ReadinessStrip from "./readiness-strip";
import StudentHeader from "./student-header";
import StudentTabs from "./student-tabs";

interface Student360DashboardProps { data: Student360Data; }

export default function Student360Dashboard({ data }: Student360DashboardProps) {
  return <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"><StudentHeader data={data} /><ReadinessStrip data={data} /><section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="min-w-0"><StudentTabs data={data} /></div><aside className="min-w-0"><AiInsight data={data} /></aside></section></main>;
}
