"use client";

import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";

export default function RegionalPerformanceHeader() {
  const [period, setPeriod] = useState("t7");
  return <header className="px-2 lg:px-5"><Card className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
    <div className="min-w-0"><p className="text-sm font-medium text-primary-500">Điều hành tuyển sinh</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.4px] text-text-primary">Hiệu suất khu vực</h1><p className="mt-1 text-sm text-text-secondary">So sánh kết quả, năng lực vận hành và điểm cần can thiệp theo vùng.</p></div>
    <div className="flex w-full flex-col gap-2 xl:w-auto xl:flex-row xl:items-center"><Select value={period} onChange={(value) => setPeriod(value as string)} aria-label="Chọn kỳ phân tích" className="w-full xl:w-auto"><SelectTrigger size="md" className="w-full min-w-52 xl:w-52"><SelectValue /><SelectIndicator /></SelectTrigger><SelectContent><SelectItem id="t7">Tháng 7, 2026</SelectItem><SelectItem id="q3">Quý 3, 2026</SelectItem><SelectItem id="year">Niên khóa 2026–2027</SelectItem></SelectContent></Select><div className="grid grid-cols-2 gap-2"><Button appearance="outline" size="md" className="w-full whitespace-nowrap">So sánh kỳ trước</Button><Button size="md" className="w-full whitespace-nowrap">Xuất báo cáo</Button></div></div>
  </Card></header>;
}
