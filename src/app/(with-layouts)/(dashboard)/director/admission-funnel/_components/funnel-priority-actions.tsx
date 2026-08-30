import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const actions = [
  { title: "Cải thiện bước Tiềm năng → Tương tác", detail: "32.240 hồ sơ chưa chuyển bước.", tone: "error" },
  { title: "Xử lý hồ sơ chờ trên 14 ngày", detail: "7.272 hồ sơ đang tồn đọng.", tone: "warning" },
  { title: "Nhân rộng nguồn có tỷ lệ nhập học cao", detail: "Nguồn Giới thiệu đang dẫn đầu với 23,6%.", tone: "success" },
] as const;

const toneStyles = {
  error: "bg-badge-error-background text-badge-error-text",
  warning: "bg-badge-warning-background text-badge-warning-text",
  success: "bg-badge-success-background text-badge-success-text",
};

export default function FunnelPriorityActions() {
  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Việc cần ưu tiên</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Việc có thể cải thiện số hồ sơ nhập học.</p>
        </div>
      </CardHeader>

      <ol className="grid gap-3 md:grid-cols-3">
        {actions.map((action, index) => (
          <li key={action.title} className="rounded-lg bg-background-soft-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card-background text-xs font-semibold text-text-tertiary">{index + 1}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${toneStyles[action.tone]}`}>{action.tone === "error" ? "Ưu tiên cao" : action.tone === "warning" ? "Cần xử lý" : "Nên nhân rộng"}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-5 text-text-primary">{action.title}</p>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">{action.detail}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
