"use client";

import { InfoCircle } from "@tailgrids/icons";

import { Alert, AlertContent, AlertDescription, AlertIndicator } from "@/components/tailgrids/core/alert";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { ActionTimeSlot, NbaAction } from "@/services/api/nba-actions";

import ActionMetaGrid from "./action-meta-grid";
import NbaTimeWindowEditor from "./nba-time-window-editor";
import { getActionPurpose } from "./types";

interface NbaActionConfigPanelProps {
  action: NbaAction | null;
  availableTimeSlots: ActionTimeSlot[];
  canEdit: boolean;
  isLoading: boolean;
  isTimeSlotsReady: boolean;
  timeSlotsError: boolean;
  isSaving: boolean;
  saveError: string | null;
  onUnlimitedChange: (isUnlimited: boolean) => void;
  onSlotChange: (slot: ActionTimeSlot, isSelected: boolean) => void;
}

export default function NbaActionConfigPanel({
  action,
  availableTimeSlots,
  canEdit,
  isLoading,
  isTimeSlotsReady,
  timeSlotsError,
  isSaving,
  saveError,
  onUnlimitedChange,
  onSlotChange,
}: NbaActionConfigPanelProps) {
  if (isLoading) return <ConfigPanelSkeleton />;

  if (!action) {
    return (
      <Card className="flex min-h-96 items-center justify-center text-center">
        <div className="max-w-sm px-6">
          <p className="text-base font-semibold text-text-primary">
            Chọn một Action để cấu hình
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Danh sách bên trái giúp bạn chọn Action và xem chính sách khung giờ hiện tại.
          </p>
        </div>
      </Card>
    );
  }

  const editorDisabled = !canEdit || !isTimeSlotsReady || timeSlotsError;

  return (
    <Card className="min-w-0 space-y-6 p-4 lg:p-5">
      <header className="flex flex-col gap-3 border-b border-card-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">{action.code}</Badge>
            <Badge color={canEdit ? "gray" : "warning"}>
              {canEdit ? "Có thể chỉnh sửa" : "Chỉ xem"}
            </Badge>
          </div>
          <h2 className="mt-3 truncate text-xl font-semibold tracking-[-0.3px] text-text-primary">
            {action.displayName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            {getActionPurpose(action)}
          </p>
        </div>
        <span className="shrink-0 text-xs text-text-tertiary">
          Cấu hình theo Action
        </span>
      </header>

      <ActionMetaGrid action={action} />

      <section className="space-y-3" aria-labelledby="nba-time-window-heading">
        <div>
          <h3 id="nba-time-window-heading" className="text-base font-semibold text-text-primary">
            Khung giờ được phép
          </h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Xác định thời điểm AI được phép tạo đề xuất NBA cho Action này.
          </p>
        </div>

        {timeSlotsError && (
          <Alert status="error" className="max-w-none">
            <AlertIndicator />
            <AlertContent>
              <AlertDescription>
                Không tải được danh sách khung giờ. Vui lòng thử tải lại trang trước khi chỉnh sửa.
              </AlertDescription>
            </AlertContent>
          </Alert>
        )}

        {!canEdit && (
          <Alert status="info" className="max-w-none">
            <AlertIndicator>
              <InfoCircle aria-hidden="true" />
            </AlertIndicator>
            <AlertContent>
              <AlertDescription>
                Tài khoản của bạn có quyền xem. Chỉ System Manager mới có thể thay đổi cấu hình.
              </AlertDescription>
            </AlertContent>
          </Alert>
        )}

        {saveError && (
          <Alert status="error" className="max-w-none">
            <AlertIndicator />
            <AlertContent>
              <AlertDescription>{saveError}</AlertDescription>
            </AlertContent>
          </Alert>
        )}

        <NbaTimeWindowEditor
          availableTimeSlots={availableTimeSlots}
          allowedTimeSlots={action.allowedTimeSlots}
          disabled={editorDisabled}
          isSaving={isSaving}
          onUnlimitedChange={onUnlimitedChange}
          onSlotChange={onSlotChange}
        />
      </section>
    </Card>
  );
}

function ConfigPanelSkeleton() {
  return (
    <Card className="min-w-0 space-y-6 p-4 lg:p-5" aria-busy="true">
      <div className="space-y-3 border-b border-card-border pb-5">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-7 w-64 rounded-lg" />
        <Skeleton className="h-4 w-[min(34rem,80%)]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-card-border p-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-[min(32rem,85%)]" />
        <div className="space-y-2 rounded-lg border border-card-border p-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </Card>
  );
}
