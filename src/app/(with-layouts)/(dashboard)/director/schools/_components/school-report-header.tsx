import { Badge } from "@/components/tailgrids/core/badge";
import { Select, SelectContent, SelectIndicator, SelectItem, SelectTrigger, SelectValue } from "@/components/tailgrids/core/select";
import type { SchoolRegion } from "@/services/api/schools/types";

interface SchoolReportHeaderProps {
  region: SchoolRegion | "all";
  onRegionChange: (region: SchoolRegion | "all") => void;
}

export default function SchoolReportHeader({ region, onRegionChange }: SchoolReportHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div>
        <Badge color="primary">FAIP</Badge>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Báo cáo trường THPT</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Ưu tiên địa bàn và nhóm trường có tiềm năng cao để phân bổ nguồn lực tuyển sinh.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select className="w-auto" value={region} onChange={(value) => onRegionChange(value as SchoolRegion | "all")} aria-label="Lọc báo cáo theo miền">
          <SelectTrigger size="sm" className="min-w-36"><SelectValue /><SelectIndicator /></SelectTrigger>
          <SelectContent>
            <SelectItem id="all" textValue="Toàn quốc">Toàn quốc</SelectItem>
            <SelectItem id="Miền Bắc" textValue="Miền Bắc">Miền Bắc</SelectItem>
            <SelectItem id="Miền Trung" textValue="Miền Trung">Miền Trung</SelectItem>
            <SelectItem id="Miền Nam" textValue="Miền Nam">Miền Nam</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
