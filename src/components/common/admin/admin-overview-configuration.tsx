import Link from "next/link";

import {
  ArrowRight,
  CheckCircle1,
  ErrorCircle1,
  Gear1,
} from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type {
  AdminOverviewLink,
  AdminOverviewModule,
  AdminOverviewStatus,
} from "./admin-overview-types";

const STATUS_CONFIG: Record<
  AdminOverviewStatus,
  { label: string; color: string; icon: typeof CheckCircle1 }
> = {
  ready: { label: "Đang dùng", color: "text-success-500", icon: CheckCircle1 },
  empty: { label: "Chưa có dữ liệu", color: "text-warning-500", icon: Gear1 },
  loading: { label: "Đang tải", color: "text-info-500", icon: Gear1 },
  error: {
    label: "Không phản hồi",
    color: "text-error-500",
    icon: ErrorCircle1,
  },
};

export default function AdminOverviewConfiguration({
  modules,
}: {
  modules: readonly AdminOverviewModule[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Trạng thái cấu hình</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Các khu vực quan trọng và tín hiệu mới nhất từ hệ thống.
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Gear1 size={18} aria-hidden="true" />
        </span>
      </CardHeader>

      <div className="divide-y divide-card-border">
        {modules.map((module) => {
          const status = STATUS_CONFIG[module.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={module.label}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background-soft-100 text-text-secondary">
                {module.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-medium text-text-primary">
                    {module.label}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${status.color}`}
                  >
                    <StatusIcon size={13} aria-hidden="true" />
                    {status.label}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-tertiary">
                  {module.description}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-text-primary">
                  {module.value}
                </p>
                <p className="mt-1 max-w-28 text-[11px] leading-4 text-text-tertiary">
                  {module.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AdminOverviewQuickLinks({
  links,
}: {
  links: readonly AdminOverviewLink[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Lối tắt quản trị</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Đi thẳng đến màn hình cần kiểm tra hoặc cập nhật.
          </p>
        </div>
        <span className="text-xs text-text-tertiary">
          {links.length} mô-đun
        </span>
      </CardHeader>

      <div className="grid gap-x-6 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex min-w-0 items-center gap-3 border-t border-card-border py-3 transition-colors first:border-t-0 hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-text-primary group-hover:text-primary-600">
                {link.label}
              </span>
              <span className="mt-1 block truncate text-xs text-text-tertiary">
                {link.description}
              </span>
            </span>
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500"
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}
