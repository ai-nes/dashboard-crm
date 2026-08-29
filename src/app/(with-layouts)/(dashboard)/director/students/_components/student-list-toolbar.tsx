"use client";

import { Filter, Search1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import { Select, SelectContent, SelectItem, SelectIndicator, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import type { StudentJourneyStage } from "@/services/api/students/types";

interface StudentListToolbarProps {
  query: string;
  stage: StudentJourneyStage | "all";
  province: string;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onStageChange: (value: StudentJourneyStage | "all") => void;
  onProvinceChange: (value: string) => void;
  onReset: () => void;
}

const stages: (StudentJourneyStage | "all")[] = ["all", "Quan tâm", "Tìm hiểu", "Tư vấn", "Ứng tuyển", "Nhập học"];
const provinces = ["all", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Nam Định", "Quảng Ninh"];

export default function StudentListToolbar({ query, stage, province, resultCount, onQueryChange, onStageChange, onProvinceChange, onReset }: StudentListToolbarProps) {
  const hasFilter = query.trim().length > 0 || stage !== "all" || province !== "all";

  return (
    <div className="border-b border-card-border p-4 lg:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row">
          <InputGroup className="min-w-0 md:max-w-md">
            <InputGroupAddon>
              <Search1 size={17} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput aria-label="Tìm học sinh" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm theo tên, mã, trường, tư vấn viên…" />
          </InputGroup>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Select className="min-w-0 sm:w-44" value={stage} onChange={(value) => onStageChange(value as StudentJourneyStage | "all")} aria-label="Lọc theo giai đoạn">
              <SelectTrigger size="sm" className="w-full">
                <Filter size={15} className="shrink-0 text-icon-tertiary" />
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {stages.map((item) => <SelectItem key={item} id={item} textValue={item === "all" ? "Tất cả giai đoạn" : item}>{item === "all" ? "Tất cả giai đoạn" : item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select className="min-w-0 sm:w-44" value={province} onChange={(value) => onProvinceChange(String(value))} aria-label="Lọc theo địa bàn">
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((item) => <SelectItem key={item} id={item} textValue={item === "all" ? "Tất cả địa bàn" : item}>{item === "all" ? "Tất cả địa bàn" : item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-xs text-text-tertiary"><span className="font-semibold text-text-primary">{resultCount}</span> hồ sơ hiển thị</p>
          {hasFilter && <Button size="sm" variant="ghost" appearance="ghost" onPress={onReset}>Xóa bộ lọc</Button>}
        </div>
      </div>
    </div>
  );
}
