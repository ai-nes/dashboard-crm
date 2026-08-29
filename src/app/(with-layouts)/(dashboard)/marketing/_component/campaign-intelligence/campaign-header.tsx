"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Calendar, Filter } from "@tailgrids/icons";
import { toast } from "sonner";

export function CampaignHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[28px] sm:leading-8">
          Campaign Intelligence
        </h1>
        <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
          Đánh giá hiệu quả marketing bằng enrollment và doanh thu xác nhận thực tế.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          appearance="outline"
          size="sm"
          onPress={() => toast.message("Bộ chọn thời gian sẽ liên kết với API khi sẵn sàng.")}
        >
          <Calendar size={14} aria-hidden="true" />
          01–30 Thg 4, 2026
        </Button>
        <Button
          appearance="outline"
          size="sm"
          onPress={() => toast.message("Bộ lọc kênh sẽ khả dụng khi kết nối API.")}
        >
          Tất cả kênh
        </Button>
        <Button
          appearance="outline"
          size="sm"
          onPress={() => toast.message("Bộ lọc campus sẽ khả dụng khi kết nối API.")}
        >
          Tất cả campus
        </Button>
        <Button
          appearance="outline"
          size="sm"
          onPress={() => toast.message("Bộ lọc nâng cao sẽ khả dụng khi kết nối API.")}
        >
          <Filter size={14} aria-hidden="true" />
          Bộ lọc
        </Button>
      </div>
    </header>
  );
}

