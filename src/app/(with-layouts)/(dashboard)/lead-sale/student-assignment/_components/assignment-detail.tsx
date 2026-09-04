"use client";

import { ArrowRight, Check, CheckCircle1, InfoTriangle } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { useAssignment } from "./assignment-context";
import AssignmentForm from "./assignment-form";
import { candidates } from "./data";
import DetailDrawer from "./detail-drawer";
import { statusColors, statusLabels } from "./mappings";

const issueDescriptions = {
  no_match:
    "Chưa có nhân sự đạt điều kiện phụ trách khu vực này. Bạn có thể thống nhất với nhân sự và phân công thủ công.",
  missing_data:
    "Thiếu khu vực của học sinh nên chưa thể tìm người phù hợp. Bổ sung thông tin trước khi phân công.",
};

export default function AssignmentDetail() {
  const { inspectedId, inspect, records } = useAssignment();
  const record = records.find((item) => item.id === inspectedId);
  if (!record) return null;
  const owner = candidates.find((person) => person.id === record.ownerId);
  const waiting = records.filter(
    (item) => item.status !== "assigned" && item.id !== record.id,
  );

  return (
    <DetailDrawer
      title={record.name}
      subtitle={`CHI TIẾT PHÂN CÔNG · ${record.id}`}
      onClose={() => inspect(null)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={statusColors[record.status]}>
          {statusLabels[record.status]}
        </Badge>
        <span className="text-xs text-text-tertiary">
          Tiếp nhận lúc {record.time}
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-[100px_1fr] gap-x-3 gap-y-3 text-sm">
        <dt className="text-text-tertiary">Trường</dt>
        <dd className="text-text-primary">{record.school}</dd>
        <dt className="text-text-tertiary">Khu vực</dt>
        <dd
          className={
            record.region ? "text-text-primary" : "text-badge-warning-text"
          }
        >
          {record.region || "Chưa có thông tin"}
        </dd>
        <dt className="text-text-tertiary">Quan tâm</dt>
        <dd className="text-text-primary">{record.interest}</dd>
        <dt className="text-text-tertiary">Nguồn</dt>
        <dd className="text-text-primary">{record.source}</dd>
      </dl>

      {record.status !== "assigned" && (
        <div className="mt-6 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <InfoTriangle size={17} aria-hidden="true" />
            {statusLabels[record.status]}
          </p>
          <p className="mt-2 text-sm leading-6">
            {issueDescriptions[record.status]}
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
                  {record.method === "manual"
                    ? "Trưởng nhóm phân công"
                    : "Hệ thống tự động phân công"}
                </p>
              </div>
              {record.score !== undefined && (
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-badge-success-text">
                    {record.score}
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
              {(record.method === "manual"
                ? [record.reason || "Do trưởng nhóm lựa chọn."]
                : [
                    `Phụ trách khu vực ${record.region}.`,
                    `Nhận tư vấn nhóm ngành ${record.interest.toLocaleLowerCase("vi")}.`,
                    `Đang phụ trách ${owner.workload} học sinh, còn khả năng tiếp nhận.`,
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
        <AssignmentForm key={record.id} record={record} />
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
