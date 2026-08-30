"use client";

import { Calendar, Download1, Filter } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";

interface OverviewHeaderProps {
  onExport: () => void;
  onPeriodPress: () => void;
}

export default function OverviewHeader({ onExport, onPeriodPress }: OverviewHeaderProps) {
  return (
    <header className="flex flex-col gap-4 px-2 lg:flex-row lg:items-start lg:justify-between lg:px-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-500"><span className="size-1.5 rounded-full bg-brand-500" />TỔNG QUAN NGƯỜI HỌC</div>
        <h1 className="text-balance text-[30px] leading-9 font-semibold tracking-[-0.7px] text-text-primary">Khám phá người học</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Theo dõi quy mô, nhu cầu, chất lượng và chuyển đổi của toàn bộ thị trường trước khi đi sâu vào từng phân khúc.</p>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap lg:min-w-[420px] lg:justify-end">
        <Button className="w-full sm:w-auto" size="sm" appearance="outline" onPress={onPeriodPress}><Calendar size={16} aria-hidden="true" />Kỳ tuyển sinh 2026</Button>
        <Button className="w-full sm:w-auto" size="sm" appearance="outline" onPress={onPeriodPress}><Filter size={16} aria-hidden="true" />Toàn quốc</Button>
        <Button className="col-span-2 w-full sm:w-auto" size="sm" appearance="outline" onPress={onExport}><Download1 size={16} aria-hidden="true" />Xuất báo cáo</Button>
      </div>
    </header>
  );
}
