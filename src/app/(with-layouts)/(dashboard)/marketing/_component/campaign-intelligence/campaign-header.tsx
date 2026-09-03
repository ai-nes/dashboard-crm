const PRIORITY_PROVINCES = [
  "Khánh Hòa",
  "Đắk Lắk",
  "Lâm Đồng",
  "TP. Hồ Chí Minh",
  "Đồng Nai",
  "Đồng Tháp",
  "Tây Ninh",
] as const;

export function CampaignHeader({ generatedAt }: { generatedAt: string }) {
  const updatedAt = new Date(generatedAt);
  const updatedAtLabel = Number.isNaN(updatedAt.valueOf())
    ? "Dữ liệu đối soát mới nhất"
    : `Cập nhật ${new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(updatedAt)}`;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[28px] sm:leading-8">
          Hiệu quả chiến dịch tuyển sinh
        </h1>
        <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
          Đánh giá hiệu quả kênh tuyển sinh dựa trên số học sinh nhập học và
          khoản thu đã đối soát.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-card-border bg-card-background px-3 py-2 text-xs font-medium text-text-secondary">
          {updatedAtLabel}
        </span>
        <span
          className="rounded-lg border border-card-border bg-card-background px-3 py-2 text-xs font-medium text-text-secondary"
          title={PRIORITY_PROVINCES.join(", ")}
        >
          Phạm vi: 7 tỉnh trọng điểm
        </span>
        <span className="rounded-lg border border-card-border bg-card-background px-3 py-2 text-xs font-medium text-text-secondary">
          Kênh: tổng hợp
        </span>
      </div>
    </header>
  );
}
