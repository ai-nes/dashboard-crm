"use client";

import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";

export function SegmentFilterPreview() {
  return (
    <div
      className="h-full w-full overflow-y-auto p-6"
      aria-label="Xem trước segment"
    >
      <div className="rounded-lg border border-badge-warning-icon-color bg-badge-warning-background p-4 text-sm text-text-primary">
        <strong>Kết quả ước tính.</strong> Lưu segment để xử lý kết quả đầy đủ.
      </div>
      <h2 className="mt-6 text-lg font-semibold">Xem trước</h2>
      <div className="my-8 grid grid-cols-2 gap-4 text-center">
        <div>
          <h3 className="text-xs font-semibold uppercase">Quy mô ước tính</h3>
          <p className="my-3 text-3xl font-semibold">--</p>
          <p className="text-sm text-text-secondary">Học sinh</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase">Tỷ lệ dữ liệu</h3>
          <p className="my-3 text-3xl font-semibold">--</p>
          <p className="text-sm text-text-secondary">trên tổng số học sinh</p>
        </div>
      </div>
      <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-card-border px-5 py-10 text-center">
        <StudentCardEmptyState
          message="Segment hiện chưa có dữ liệu."
          className="[&>div]:mb-6 [&>div]:size-36 [&>p]:text-lg [&>p]:font-semibold [&>p]:text-text-primary"
        />
        <p className="text-sm leading-6 text-text-secondary">
          Chưa có học sinh phù hợp với bộ lọc để hiển thị.
        </p>
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Xem trước tối đa 25 kết quả đầu tiên.
      </p>
    </div>
  );
}
