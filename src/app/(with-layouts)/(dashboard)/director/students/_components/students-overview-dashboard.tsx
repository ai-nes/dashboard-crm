"use client";

import { ArrowRight, Download1, Sparkle } from "@tailgrids/icons";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { studentListData } from "@/services/api/students/data";
import type { StudentJourneyStage } from "@/services/api/students/types";

import StudentKpiStrip from "./student-kpi-strip";
import StudentList from "./student-list";
import StudentListToolbar from "./student-list-toolbar";

export default function StudentsOverviewDashboard() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<StudentJourneyStage | "all">("all");
  const [province, setProvince] = useState("all");

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");

    return studentListData.filter((student) => {
      const matchesQuery = !normalizedQuery || [student.name, student.code, student.school, student.major, student.owner].some((value) => value.toLocaleLowerCase("vi").includes(normalizedQuery));
      const matchesStage = stage === "all" || student.stage === stage;
      const matchesProvince = province === "all" || student.province === province;

      return matchesQuery && matchesStage && matchesProvince;
    });
  }, [province, query, stage]);

  const resetFilters = () => {
    setQuery("");
    setStage("all");
    setProvince("all");
  };

  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Student 360°</Badge>
            <span className="text-xs text-text-tertiary">Dữ liệu mô phỏng · Kỳ tuyển sinh 2026</span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Hồ sơ học sinh 360°</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Từ toàn cảnh tệp học sinh đến hành động tiếp theo cho từng hồ sơ. Chọn một học sinh để xem đầy đủ tín hiệu, gia đình, hồ sơ và khuyến nghị AI.</p>
        </div>
        <Button size="sm" appearance="outline" onPress={() => toast.success("Đã tạo bản xuất danh sách học sinh mô phỏng.")}><Download1 size={16} />Xuất danh sách</Button>
      </header>

      <StudentKpiStrip />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <Card className="flex min-w-0 flex-col gap-4 border-primary-200 bg-badge-primary-background p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card-background text-badge-primary-text" aria-hidden="true"><Sparkle size={18} /></span>
            <div><p className="text-sm font-semibold text-badge-primary-text">64 hồ sơ cần xử lý hôm nay</p><p className="mt-1 text-sm leading-5 text-text-secondary">18 hồ sơ đang giảm tương tác; 27 học sinh đã sẵn sàng trao đổi cùng phụ huynh.</p></div>
          </div>
          <Link href="/director/sla" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-button-primary-outline-text hover:text-button-primary-outline-hover-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">Mở trung tâm SLA <ArrowRight size={16} /></Link>
        </Card>
        <Card className="flex items-center justify-between gap-4 p-4 lg:p-5"><div><p className="text-xs text-text-tertiary">Tín hiệu tích cực</p><p className="mt-1 text-2xl font-semibold text-text-primary">486</p><p className="mt-1 text-xs text-text-secondary">hồ sơ có ý định cao</p></div><div className="flex size-12 items-center justify-center rounded-full border-8 border-badge-success-background text-sm font-semibold text-success-500" aria-label="Tỷ lệ hồ sơ có ý định cao 17 phần trăm">17%</div></Card>
      </section>

      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Danh sách học sinh</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Ưu tiên theo điểm tiềm năng, giai đoạn hành trình và hành động gần nhất.</p></div><Badge color="primary">{filteredStudents.length}/{studentListData.length} hồ sơ mock</Badge></CardHeader>
        <StudentListToolbar query={query} stage={stage} province={province} resultCount={filteredStudents.length} onQueryChange={setQuery} onStageChange={setStage} onProvinceChange={setProvince} onReset={resetFilters} />
        <div className="hidden grid-cols-[minmax(260px,1.3fr)_minmax(140px,0.65fr)_minmax(150px,0.75fr)_minmax(210px,1fr)_auto] gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid" aria-hidden="true"><span>Học sinh</span><span>Giai đoạn</span><span>Điểm tiềm năng</span><span>Hành động gần nhất</span><span /></div>
        <StudentList students={filteredStudents} />
      </Card>
    </main>
  );
}
