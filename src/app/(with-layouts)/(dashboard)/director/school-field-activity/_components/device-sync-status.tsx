import Link from "next/link";

import { deviceSyncStatuses } from "./data";

export default function DeviceSyncStatus() {
  return (
    <div className="min-w-0 border-t-[0.5px] border-card-border pt-6 xl:border-t-0 xl:border-l-[0.5px] xl:pt-0 xl:pl-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Đồng bộ thiết bị</h3>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">Dữ liệu ngoại tuyến sẽ tự đồng bộ khi có mạng.</p>
      </div>

      <div className="mt-4 space-y-3">
        {deviceSyncStatuses.map((device) => {
          const total = device.synced + device.pending + device.errors;
          const syncRate = total > 0 ? (device.synced / total) * 100 : 0;

          return (
            <div key={device.device} className="rounded-lg bg-background-soft-50 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{device.device}</p>
                  <p className="mt-1 truncate text-xs text-text-tertiary">{device.activity}</p>
                </div>
                <span className="shrink-0 text-xs text-text-tertiary">{device.lastUpdated}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-soft-200" role="img" aria-label={`${device.device}: đã đồng bộ ${device.synced}, đang chờ ${device.pending}, lỗi ${device.errors}`}>
                <div className={`h-full rounded-full ${device.errors > 0 ? "bg-error-500" : device.pending > 0 ? "bg-warning-500" : "bg-success-500"}`} style={{ width: `${Math.max(syncRate, 2)}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
                <span>Đã đồng bộ {device.synced}</span>
                <span className={device.pending > 0 ? "font-medium text-warning-500" : undefined}>Đang chờ {device.pending}</span>
                <span className={device.errors > 0 ? "font-medium text-error-500" : undefined}>Lỗi {device.errors}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-badge-warning-background p-3.5">
        <p className="text-sm font-semibold text-badge-warning-text">184 hồ sơ chưa về hệ thống</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">Máy 04 mất kết nối. Chưa dùng dữ liệu này để đánh giá cho đến khi đồng bộ xong.</p>
      </div>

      <Link href="/director/data-health" className="mt-4 inline-flex text-sm font-semibold text-brand-500 hover:text-brand-600">
        Mở tình trạng dữ liệu
        <span className="ml-1" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
