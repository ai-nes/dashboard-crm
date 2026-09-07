"use client";

import { ArrowRight, Check, CheckCircle1, InfoTriangle } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { useAssignment } from "./assignment-context";
import AssignmentForm from "./assignment-form";
import DetailDrawer from "./detail-drawer";
import { statusColors, statusLabels } from "./mappings";

const issueDescriptions = {
  no_match:
    "Chưa có nhân sự đạt điều kiện phụ trách khu vực này. Bạn có thể thống nhất với nhân sự và phân công thủ công.",
  missing_data:
    "Thiếu khu vực của học sinh nên chưa thể tìm người phù hợp. Bổ sung thông tin trước khi phân công.",
  error:
    "Luồng tự động gặp lỗi kỹ thuật. Kiểm tra thông tin và xử lý thủ công nếu phù hợp.",
};

function initials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function timeOf(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function AssignmentDetail() {
  const { inspectedId, inspect, records, detail, detailLoading, detailError } = useAssignment();
  const record = records.find((item) => item.id === inspectedId);
  if (!inspectedId) return null;
  if (!record && !detailLoading) return null;
  const item = detail?.item
      ? {
        id: detail.item.studentId,
        name: detail.item.name,
        initials: initials(detail.item.name),
        school: detail.item.school,
        region: detail.item.region ?? "",
        interest: detail.item.interest ?? "Chưa xác định",
        source: detail.item.source ?? "Chưa xác định",
        receivedAt: detail.item.receivedAt,
        time: timeOf(detail.item.receivedAt),
        status: detail.item.status,
        ownerId: detail.item.owner?.id,
        ownerName: detail.item.owner?.displayName,
        score: detail.item.matchScore ?? undefined,
        method: detail.item.method,
        reason: detail.item.reason ?? undefined,
        revision: detail.item.revision,
      }
    : record;
  if (!item) {
    return (
      <DetailDrawer title="Chi tiết học sinh" subtitle="CHI TIẾT PHÂN CÔNG" onClose={() => inspect(null)}>
        <p className="text-sm text-text-secondary">{detailError?.message ?? "Đang tải dữ liệu…"}</p>
      </DetailDrawer>
    );
  }
  const owner = item.ownerName
    ? { name: item.ownerName, initials: initials(item.ownerName) }
    : null;
  const waiting = records.filter(
    (waitingItem) => waitingItem.status !== "assigned" && waitingItem.id !== item.id,
  );

  return (
    <DetailDrawer
      title={item.name}
      subtitle={`CHI TIẾT PHÂN CÔNG · ${item.id}`}
      onClose={() => inspect(null)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={statusColors[item.status]}>
          {statusLabels[item.status]}
        </Badge>
        <span className="text-xs text-text-tertiary">
          Tiếp nhận lúc {item.time}
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-[100px_1fr] gap-x-3 gap-y-3 text-sm">
        <dt className="text-text-tertiary">Trường</dt>
        <dd className="text-text-primary">{item.school}</dd>
        <dt className="text-text-tertiary">Khu vực</dt>
        <dd
          className={
            item.region ? "text-text-primary" : "text-badge-warning-text"
          }
        >
          {item.region || "Chưa có thông tin"}
        </dd>
        <dt className="text-text-tertiary">Quan tâm</dt>
        <dd className="text-text-primary">{item.interest}</dd>
        <dt className="text-text-tertiary">Nguồn</dt>
        <dd className="text-text-primary">{item.source}</dd>
      </dl>

      {item.status !== "assigned" && (
        <div className="mt-6 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <InfoTriangle size={17} aria-hidden="true" />
            {statusLabels[item.status]}
          </p>
          <p className="mt-2 text-sm leading-6">
            {issueDescriptions[item.status]}
          </p>
        </div>
      )}

      {owner ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-card-border p-4">
            <p className="text-xs text-text-tertiary">Người phụ trách</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-badge-sky-background text-sm font-semibold text-badge-sky-text">
                {owner.initials}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  {owner.name}
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {item.method === "manual"
                    ? "Trưởng nhóm phân công"
                    : "Hệ thống tự động phân công"}
                </p>
              </div>
              {item.score !== undefined && (
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-badge-success-text">
                    {item.score}
                    <span className="text-xs font-normal text-text-tertiary">
                      /100
                    </span>
                  </p>
                  <p className="text-xs text-text-tertiary">Điểm phù hợp</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Lý do phân công
            </h3>
            <ul className="mt-3 space-y-2.5">
              {(item.method === "manual"
                ? [item.reason || "Do trưởng nhóm lựa chọn."]
                : [
                    ...(detail?.explainability.reasons ?? [
                      `Phụ trách khu vực ${item.region || "chưa xác định"}.`,
                      `Nhận tư vấn nhóm ngành ${item.interest?.toLocaleLowerCase("vi") || "chung"}.`,
                    ]),
                  ]
              ).map((reason) => (
                <li
                  key={reason}
                  className="flex gap-2 text-sm leading-6 text-text-secondary"
                >
                  <Check
                    size={16}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-badge-success-text"
                  />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3 rounded-xl bg-badge-success-background p-4 text-badge-success-text">
            <CheckCircle1
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">Đã phân công thành công</p>
              <p className="mt-1 text-sm">
                Người phụ trách đã được ghi nhận và có thể bắt đầu chăm sóc học sinh.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AssignmentForm key={item.id} record={item} />
      )}

      {waiting.length > 0 && (
        <Button
          appearance="ghost"
          className="mt-2 w-full text-text-secondary"
          onPress={() => inspect(waiting[0].id)}
        >
          Xử lý học sinh tiếp theo ({waiting.length})
          <ArrowRight size={15} aria-hidden="true" />
        </Button>
      )}
    </DetailDrawer>
  );
}
