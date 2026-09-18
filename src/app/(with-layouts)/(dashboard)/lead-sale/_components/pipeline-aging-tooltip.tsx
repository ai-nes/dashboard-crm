interface PipelineAgingTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      label?: string;
      count?: number;
      percentage?: number;
      note?: string;
    };
  }>;
}

export default function PipelineAgingTooltip({ active, payload }: PipelineAgingTooltipProps) {
  const bucket = payload?.[0]?.payload;

  if (!active || !bucket?.label) return null;

  return (
    <div className="w-60 rounded-xl border border-card-border bg-dropdowns-background p-3 shadow-xl">
      <p className="text-xs font-semibold text-text-primary">{bucket.label}</p>
      <dl className="mt-2 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-text-tertiary">Hồ sơ</dt>
          <dd className="font-semibold text-text-primary">{bucket.count} hồ sơ</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-text-tertiary">Tỷ trọng pipeline mở</dt>
          <dd className="font-semibold text-text-primary">{bucket.percentage}%</dd>
        </div>
      </dl>
      <p className="mt-2 border-t border-card-border pt-2 text-[11px] leading-4 text-text-secondary">
        {bucket.note}. Khoảng thời gian này dùng để ưu tiên hồ sơ cần cập nhật.
      </p>
    </div>
  );
}
