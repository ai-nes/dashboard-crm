"use client";

import { CheckCircle1, InfoTriangle } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { useBatchAssignment } from "../../_shared/lead-assignment-batch/batch-assignment-context";
import {
  itemStatusColors,
  itemStatusLabels,
} from "../../_shared/lead-assignment-batch/batch-assignment-mappings";
import DetailDrawer from "../../_shared/student-assignment/detail-drawer";

export default function AssignmentBatchItemDrawer() {
  const { selectedItemId, items, inspectItem } = useBatchAssignment();
  const item = items.find((candidate) => candidate.id === selectedItemId);
  if (!item) return null;

  const hasIssue = item.status === "manual_review" || item.status === "failed";
  return (
    <DetailDrawer
      title={item.studentName}
      subtitle={`CHI TIẾT HỒ SƠ LEAD · ${item.leadId}`}
      onClose={() => inspectItem(null)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={itemStatusColors[item.status]}>
          {itemStatusLabels[item.status]}
        </Badge>
        <span className="text-xs text-text-tertiary">Mã hồ sơ: {item.id}</span>
      </div>

      <dl className="mt-5 grid grid-cols-[126px_1fr] gap-x-3 gap-y-3 text-sm">
        <dt className="text-text-tertiary">Số điện thoại</dt>
        <dd className="text-text-primary">{item.phone ?? "—"}</dd>
        <dt className="text-text-tertiary">CCCD</dt>
        <dd className="text-text-primary">{item.idNumber ?? "—"}</dd>
        <dt className="text-text-tertiary">Tỉnh/Thành phố</dt>
        <dd className="text-text-primary">{item.province ?? "—"}</dd>
        <dt className="text-text-tertiary">Trường THPT</dt>
        <dd className="text-text-primary">{item.highSchool ?? "—"}</dd>
        <dt className="text-text-tertiary">Ngành quan tâm</dt>
        <dd className="text-text-primary">{item.major ?? "—"}</dd>
        <dt className="text-text-tertiary">Nguồn Lead</dt>
        <dd className="text-text-primary">{item.source ?? "—"}</dd>
      </dl>

      {hasIssue && (
        <div className="mt-6 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <InfoTriangle size={17} aria-hidden="true" />
            Cần kiểm tra trước khi xử lý lại
          </p>
          {item.missingFields.length > 0 && (
            <p className="mt-2 text-sm leading-6">
              Chưa có: {item.missingFields.join(", ")}.
            </p>
          )}
          {item.reason && (
            <p className="mt-2 text-sm leading-6">{item.reason}</p>
          )}
          {item.errorCode && (
            <code className="mt-2 block text-xs">{item.errorCode}</code>
          )}
        </div>
      )}

      <section className="mt-6" aria-labelledby="routing-context-heading">
        <h2
          id="routing-context-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Thông tin tuyến phân công
        </h2>
        <dl className="mt-3 grid grid-cols-[126px_1fr] gap-x-3 gap-y-3 text-sm">
          <dt className="text-text-tertiary">Cách tìm Team</dt>
          <dd className="text-text-primary">
            {item.province ? `Theo tỉnh ${item.province}` : "—"}
          </dd>
          <dt className="text-text-tertiary">Đội</dt>
          <dd className="text-text-primary">{item.team ?? "—"}</dd>
          <dt className="text-text-tertiary">Tư vấn viên</dt>
          <dd className="text-text-primary">{item.ownerStaff ?? "Chưa có"}</dd>
          <dt className="text-text-tertiary">Tải hiện tại</dt>
          <dd className="text-text-primary">
            {item.activeLoad !== null && item.capacityLimit !== null
              ? `${item.activeLoad}/${item.capacityLimit} · còn ${item.remainingCapacity ?? "—"}`
              : "—"}
          </dd>
          <dt className="text-text-tertiary">Lý do chọn</dt>
          <dd className="text-text-primary">{item.reason ?? "—"}</dd>
        </dl>
      </section>

      {item.status === "assigned" && (
        <div className="mt-6 flex gap-3 rounded-xl bg-badge-success-background p-4 text-badge-success-text">
          <CheckCircle1
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm leading-6">
            Đã ghi nhận người phụ trách. Bước này chưa tạo hoặc chuyển hồ sơ
            sang Student.
          </p>
        </div>
      )}
    </DetailDrawer>
  );
}
