import PeriodSelector from "./period-selector";

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div>
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Campaign Intelligence</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          Đánh giá hiệu quả marketing bằng enrollment và doanh thu xác nhận.
        </p>
      </div>

      <PeriodSelector />
    </div>
  );
}
