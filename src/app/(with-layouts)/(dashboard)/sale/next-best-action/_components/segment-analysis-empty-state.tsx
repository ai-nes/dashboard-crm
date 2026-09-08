import { ChevronDown, InfoCircle } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";

import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";

const segmentUsage = [
  "Cá nhân hóa",
  "Giao tiếp",
  "Tự động hóa",
  "Phân tích",
  "Phân khúc",
] as const;

export default function SegmentAnalysisEmptyState() {
  return (
    <div className="space-y-5">
      <section aria-labelledby="segment-usage-heading">
        <h2
          id="segment-usage-heading"
          className="mb-4 text-xl leading-7 font-semibold tracking-[-0.2px] text-text-primary"
        >
          0 segment đang được sử dụng
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {segmentUsage.map((category) => (
            <SegmentUsageCard key={category} category={category} />
          ))}
        </div>
      </section>

      <Card className="min-h-[34rem] p-0">
        <div className="flex flex-col gap-4 border-b border-card-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="flex items-center gap-2 text-xl leading-7 font-semibold tracking-[-0.2px] text-text-primary">
            Segment overlap
            <InfoCircle
              size={16}
              className="text-text-tertiary"
              aria-hidden="true"
            />
          </h2>
          <Button
            variant="primary"
            appearance="ghost"
            size="sm"
            isDisabled
            className="w-fit shrink-0 gap-1.5 px-0"
          >
            Chọn segment (tối đa 5)
            <ChevronDown size={16} aria-hidden="true" />
          </Button>
        </div>

        <StudentCardEmptyState
          message="Chọn segment để bắt đầu."
          className="min-h-[27rem]"
        />
      </Card>

      <Card className="overflow-hidden p-5 sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl leading-7 font-semibold tracking-[-0.2px] text-text-primary">
          Segment cần chú ý
          <InfoCircle
            size={16}
            className="text-text-tertiary"
            aria-hidden="true"
          />
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-background-gray-primary text-text-secondary">
                <th className="border border-card-border px-4 py-3 font-semibold">
                  Tên segment
                </th>
                <th className="border border-card-border px-4 py-3 font-semibold">
                  Thay đổi 7 ngày
                </th>
                <th className="border border-card-border px-4 py-3 font-semibold">
                  Loại
                </th>
                <th className="border border-card-border px-4 py-3 font-semibold">
                  Đối tượng
                </th>
                <th className="border border-card-border px-4 py-3 font-semibold">
                  Cập nhật gần nhất
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-text-tertiary">
                {Array.from({ length: 5 }, (_, index) => (
                  <td
                    key={index}
                    className="border-x border-b border-card-border px-4 py-4"
                  >
                    —
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SegmentUsageCard({ category }: { category: string }) {
  return (
    <Card className="flex min-h-52 flex-col p-5 sm:p-6">
      <h3 className="flex items-center gap-1.5 text-base font-semibold text-text-primary">
        {category}
        <InfoCircle
          size={15}
          className="text-text-tertiary"
          aria-hidden="true"
        />
      </h3>
      <p className="mt-3 text-4xl leading-none font-semibold tracking-[-1px] text-text-primary">
        0
      </p>
      <p className="mt-3 text-sm text-text-secondary">Segment đang dùng</p>
      <Button
        variant="primary"
        appearance="outline"
        size="sm"
        isDisabled
        className="mt-auto w-fit"
      >
        Xem segments
      </Button>
    </Card>
  );
}
