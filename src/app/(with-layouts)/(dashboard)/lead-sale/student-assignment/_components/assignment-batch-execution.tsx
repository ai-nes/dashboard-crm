"use client";

import {
  ArrowRight,
  InfoCircle,
  Play,
  RefreshCircle1Clockwise,
  Search1,
} from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { useBatchAssignment } from "../../_shared/lead-assignment-batch/batch-assignment-context";
import {
  batchStatusColors,
  batchStatusLabels,
  formatCount,
  formatDateTime,
  itemStatusColors,
  itemStatusLabels,
  assignmentReasonLabel,
  summaryCards,
} from "../../_shared/lead-assignment-batch/batch-assignment-mappings";
import AssignmentBatchItemDrawer from "./assignment-batch-item-drawer";

const retryableStatuses = ["deferred", "manual_review", "failed"] as const;

export default function AssignmentBatchExecution({
  readOnly = false,
}: {
  readOnly?: boolean;
}) {
  const {
    activeBatch,
    items,
    isDetailLoading,
    isPreviewing,
    isRunning,
    isRetrying,
    previewBatch,
    runBatch,
    retryBatch,
    inspectItem,
  } = useBatchAssignment();

  if (!activeBatch) return null;
  const retryableItems = items.filter((item) =>
    retryableStatuses.includes(
      item.status as (typeof retryableStatuses)[number],
    ),
  );
  const cards = summaryCards(activeBatch.summary);

  return (
    <>
      <Card className="p-0">
        <CardHeader className="border-b border-card-border px-5 py-4">
          <div>
            <CardTitle className="text-base">Kết quả phân công</CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Hệ thống sẽ phân công hồ sơ đủ điều kiện và đóng hồ sơ không hợp
              lệ, kèm lý do rõ ràng để người vận hành xử lý.
            </p>
          </div>
          <Badge color={batchStatusColors[activeBatch.status]}>
            {batchStatusLabels[activeBatch.status]}
          </Badge>
        </CardHeader>

        <div className="grid gap-px bg-card-border sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.key} className="bg-card-background px-5 py-4">
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  card.tone === "warning" && "text-badge-warning-text",
                  card.tone === "success" && "text-badge-success-text",
                )}
              >
                {formatCount(card.value)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border px-5 py-4">
          <div className="flex items-start gap-2 text-xs leading-5 text-text-tertiary">
            <InfoCircle
              size={15}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>
              Tỉnh, Team, Sale/CTV và tải nhận Lead lấy từ kết quả hệ thống.
              Bước này chưa tạo hồ sơ Student.
            </span>
          </div>
          {!readOnly && <div className="flex flex-wrap gap-2">
            {(activeBatch.status === "draft" ||
              activeBatch.status === "ready") && (
              <>
                {activeBatch.status === "draft" && (
                  <Button
                    appearance="outline"
                    size="md"
                    onPress={() => void previewBatch()}
                    isDisabled={isPreviewing || isRunning}
                  >
                    <Search1 size={15} aria-hidden="true" />
                    {isPreviewing ? "Đang xem trước…" : "Xem trước"}
                  </Button>
                )}
                <Button
                  size="md"
                  onPress={() => void runBatch()}
                  isDisabled={isRunning || isPreviewing}
                >
                  <Play size={15} aria-hidden="true" />
                  {isRunning ? "Đang phân công…" : "Phân công Lead"}
                </Button>
              </>
            )}
            {retryableItems.length > 0 && activeBatch.status !== "running" && (
              <Button
                appearance="outline"
                size="md"
                onPress={() =>
                  void retryBatch(retryableItems.map((item) => item.id))
                }
                isDisabled={isRetrying}
              >
                {isRetrying && (
                  <RefreshCircle1Clockwise
                    size={15}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                )}
                Xử lý lại {retryableItems.length} hồ sơ
              </Button>
            )}
          </div>}
        </div>

        <div className="border-t border-card-border">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Lead đã được xử lý trong lần chạy
              </h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Cập nhật lúc: {formatDateTime(activeBatch.updatedAt)}
              </p>
            </div>
            {isDetailLoading && (
              <span className="text-xs text-text-tertiary" aria-live="polite">
                Đang cập nhật…
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <caption className="sr-only">
                Danh sách Lead trong lần chạy {activeBatch.batchName}
              </caption>
              <thead className="border-y border-card-border bg-background-gray-secondary/60 text-xs text-text-tertiary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Hồ sơ Lead
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Thông tin phân công
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Lý do
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Chi tiết</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="align-top hover:bg-background-gray-secondary/30"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring/30"
                        onClick={() => inspectItem(item.id)}
                      >
                        <span className="block font-medium text-text-primary">
                          {item.studentName}
                        </span>
                        <span className="mt-1 block text-xs text-text-tertiary">
                          {item.phone || "Chưa có số điện thoại"} ·{" "}
                          {item.highSchoolLabel ?? item.highSchool ?? "Chưa có trường THPT"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs leading-5 text-text-secondary">
                      <span className="block">
                        {item.ownerStaff ?? "Chưa có tư vấn viên"}
                      </span>
                      <span className="block text-text-tertiary">
                        {item.team ?? "Chưa tìm được Team theo tỉnh"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge color={itemStatusColors[item.status]}>
                        {itemStatusLabels[item.status]}
                      </Badge>
                    </td>
                    <td className="max-w-[280px] px-4 py-4 text-xs leading-5 text-text-secondary">
                      {assignmentReasonLabel(item)}
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        appearance="ghost"
                        size="sm"
                        aria-label={`Xem chi tiết ${item.studentName}`}
                        onPress={() => inspectItem(item.id)}
                      >
                        Chi tiết <ArrowRight size={14} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isDetailLoading && !items.length && (
            <div className="px-5 py-10 text-center text-sm text-text-secondary">
              Đợt chưa có hồ sơ để hiển thị.
            </div>
          )}
        </div>
      </Card>
      <AssignmentBatchItemDrawer />
    </>
  );
}
