import { ArrowUpward, CheckCircle1 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const ACTIVITIES = [
  { id: "source-opened", title: "Mở nguồn tuyển sinh mới", date: "Hôm nay, 11:15", value: "+8 trường", status: "Đã đồng bộ", positive: true },
  { id: "forecast-updated", title: "AI cập nhật dự báo niên khóa", date: "Hôm nay, 10:55", value: "+4.2%", status: "Đã phân tích", positive: true },
  { id: "reconciled", title: "Đối soát tự động hoàn tất", date: "Hôm nay, 10:20", value: "1,284 hồ sơ", status: "Đã hoàn tất", positive: true },
  { id: "scholarship-approved", title: "Danh mục học bổng được phê duyệt", date: "Hôm qua, 16:35", value: "3 yêu cầu", status: "Đã duyệt", positive: false },
];

export default function RevenueActivity() {
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các biến động doanh thu mới nhất</p>
        </div>
        <span className="rounded-full bg-badge-success-background px-2 py-1 text-[11px] font-semibold text-badge-success-text">Trực tiếp</span>
      </CardHeader>

      <div className="mt-5 divide-y divide-card-border">
        {ACTIVITIES.map((activity) => {
          return (
            <div key={activity.id} className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0">
              <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${activity.positive ? "bg-badge-success-background text-badge-success-text" : "bg-badge-warning-background text-badge-warning-text"}`}>
                {activity.positive ? <ArrowUpward size={12} aria-hidden="true" /> : <span className="text-xs font-semibold">•</span>}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-text-secondary">{activity.title}</p>
                  <span className={`shrink-0 text-[11px] font-semibold ${activity.positive ? "text-success-500" : "text-warning-500"}`}>{activity.value}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-tertiary">
                  <span>{activity.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-badge-success-text">
                    <CheckCircle1 size={11} aria-hidden="true" />
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-card-border pt-4 text-xs">
        <span className="font-semibold text-brand-500">Xem toàn bộ giao dịch →</span>
      </div>
    </Card>
  );
}
