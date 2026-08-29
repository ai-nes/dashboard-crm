"use client";

import { Bookmark1, Calendar, Download1, Sparkle } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { initialFilters } from "./data";
import OverviewCharts from "./overview-charts";
import SegmentAnalysis from "./segment-analysis";
import SegmentBuilder from "./segment-builder";
import SegmentComparison from "./segment-comparison";

export default function DemographicExplorerDashboard() {
  const [filters, setFilters] = useState(initialFilters);
  const addAcademicFilter = () => {
    if (filters.some((filter) => filter.id === "academic")) {
      toast.message("Điều kiện học lực đã có trong phân khúc.");
      return;
    }
    setFilters((current) => [...current, { id: "academic", label: "Học lực", value: "GPA từ 8,0" }]);
  };

  return <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"><header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h1 className="text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Khám phá người học</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Nhận diện các phân khúc có nhu cầu và tiềm năng chuyển đổi để ưu tiên địa bàn, trường THPT và nguồn lực tuyển sinh.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" appearance="outline" onPress={() => toast.message("Dữ liệu đang hiển thị cho kỳ tuyển sinh 2026.")}><Calendar size={16} />Kỳ tuyển sinh 2026</Button><Button size="sm" appearance="outline" onPress={() => toast.success("Đã tạo báo cáo phân khúc để xuất.")}><Download1 size={16} />Xuất báo cáo</Button><Button size="sm" appearance="outline" onPress={() => toast.success("Đã lưu phân khúc hiện tại.")}><Bookmark1 size={16} />Lưu phân khúc</Button></div></header><section aria-label="Phát hiện AI" className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-badge-primary-background p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card-background text-badge-primary-text" aria-hidden="true"><Sparkle size={17} /></span><div><p className="text-sm font-semibold text-badge-primary-text">Cơ hội mới nổi</p><p className="mt-0.5 text-sm text-text-secondary">Học sinh nữ quan tâm AI tại Đồng Nai tăng 31% so với tháng trước.</p></div></div><a href="#opportunity-detail" className="shrink-0 text-sm font-medium text-button-primary-outline-text hover:text-button-primary-outline-hover-text focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring">Xem bằng chứng</a></section><SegmentBuilder filters={filters} onAdd={addAcademicFilter} onApply={() => toast.success(`Đã cập nhật phân tích cho ${filters.length} điều kiện.`)} onRemove={(id) => setFilters((current) => current.filter((filter) => filter.id !== id))} onReset={() => { setFilters([]); toast.success("Đã đặt lại điều kiện phân khúc."); }} /><div id="opportunity-detail"><SegmentAnalysis /></div><OverviewCharts /><SegmentComparison /></main>;
}
