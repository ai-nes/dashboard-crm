"use client";

import { Calendar, CheckCircle1, Message1, Phone } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import type { ChannelChartItem, TrendChartItem } from "./student-chart-types";

interface StudentChartInspectorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: ChannelChartItem | null;
  milestone?: TrendChartItem | null;
  studentName: string;
  studentMajor?: string;
}

export default function StudentChartInspectorSheet({
  isOpen,
  onOpenChange,
  channel,
  milestone,
  studentName,
  studentMajor,
}: StudentChartInspectorSheetProps) {
  if (!isOpen) return null;

  const isChannelView = Boolean(channel);
  const isEventChannel = channel?.channel.toLowerCase().includes("sự kiện") ?? false;
  const isCallChannel = channel?.channel.toLowerCase().includes("cuộc gọi") ?? false;
  const isZaloChannel = channel?.channel.toLowerCase().includes("zalo") ?? false;

  return (
    <SheetOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg">
        {/* Header */}
        <SheetHeader className="border-b border-card-border pb-4 pr-12">
          {isChannelView && channel ? (
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: channel.fill || "var(--primary-500)" }}
                  aria-hidden="true"
                />
                <SheetTitle className="text-xl font-bold text-text-primary">
                  {isEventChannel
                    ? "Chi tiết sự kiện trải nghiệm"
                    : `Chi tiết kênh: ${channel.channel}`}
                </SheetTitle>
              </div>
              <SheetDescription className="mt-1 text-xs text-text-tertiary">
                Hồ sơ học sinh: <strong className="text-text-primary">{studentName}</strong>
                {studentMajor && ` · Ngành ${studentMajor}`}
              </SheetDescription>
            </div>
          ) : milestone ? (
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-bold text-text-primary">
                  Mốc hành trình: {milestone.date}
                </SheetTitle>
              </div>
              <SheetDescription className="mt-1 text-xs text-text-tertiary">
                Đánh giá khả năng nhập học của <strong className="text-text-primary">{studentName}</strong>
              </SheetDescription>
            </div>
          ) : null}
        </SheetHeader>

        {/* Body */}
        <SheetBody className="flex-1 space-y-5 overflow-y-auto py-4">
          {/* KPI Cards */}
          {isChannelView && channel ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-card-border/60 bg-background-soft-50/70 p-3.5 dark:bg-card-background/50">
                <p className="text-xs text-text-tertiary">Lượt tương tác</p>
                <p className="mt-1 text-xl font-bold text-text-primary">
                  {channel.touches}
                </p>
                <p className="mt-0.5 text-[11px] text-text-tertiary">Điểm chạm đã ghi nhận</p>
              </div>
              <div className="rounded-xl border border-card-border/60 bg-background-soft-50/70 p-3.5 dark:bg-card-background/50">
                <p className="text-xs text-text-tertiary">Tỷ lệ phản hồi</p>
                <p className="mt-1 text-xl font-bold text-info-500">
                  {channel.response ?? 80}%
                </p>
                <p className="mt-0.5 text-[11px] text-text-tertiary">Mức độ đón nhận</p>
              </div>
            </div>
          ) : milestone ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-card-border/60 bg-background-soft-50/70 p-3.5 dark:bg-card-background/50">
                <p className="text-xs text-text-tertiary">Xác suất nhập học</p>
                <p className="mt-1 text-2xl font-bold text-success-500">
                  {milestone.score}%
                </p>
                <p className="mt-0.5 text-[11px] text-text-tertiary">Tại mốc thời gian này</p>
              </div>
              <div className="rounded-xl border border-card-border/60 bg-background-soft-50/70 p-3.5 dark:bg-card-background/50">
                <p className="text-xs text-text-tertiary">Đánh giá ngưỡng</p>
                <div className="mt-1">
                  <Badge color={(milestone.score ?? 0) >= 70 ? "success" : "warning"} size="sm">
                    {(milestone.score ?? 0) >= 70 ? "Vượt ngưỡng ưu tiên (70%)" : "Cần nuôi dưỡng thêm"}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-text-tertiary">Mục tiêu tuyển sinh</p>
              </div>
            </div>
          ) : null}

          {/* Detailed Activity List */}
          {isChannelView && channel ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {isEventChannel ? "Các sự kiện đã tham gia" : "Nhật ký chăm sóc chi tiết"}
                </h4>
                <span className="text-[11px] text-text-tertiary">
                  {channel.activities?.length || 0} hoạt động
                </span>
              </div>

              {channel.activities && channel.activities.length > 0 ? (
                <div className="space-y-3">
                  {channel.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-card-border/70 bg-card-background p-4 shadow-2xs transition-colors hover:border-card-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background-soft-100 text-text-primary dark:bg-card-background"
                            aria-hidden="true"
                          >
                            {isCallChannel ? (
                              <Phone size={14} className="text-success-500" />
                            ) : isZaloChannel ? (
                              <Message1 size={14} className="text-primary-500" />
                            ) : isEventChannel ? (
                              <Calendar size={14} className="text-warning-500" />
                            ) : (
                              <CheckCircle1 size={14} className="text-info-500" />
                            )}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-text-primary">
                              {act.title}
                            </p>
                            {act.time && (
                              <p className="text-[11px] text-text-tertiary">{act.time}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {act.description && (
                        <p className="mt-2.5 pl-9 text-xs leading-relaxed text-text-secondary">
                          {act.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-text-tertiary">
                  Chưa có ghi nhận hoạt động nào cho kênh này.
                </p>
              )}
            </div>
          ) : milestone ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-card-border/70 bg-card-background p-4 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {milestone.eventTitle || "Ghi nhận tương tác quan trọng"}
                  </h4>
                  {milestone.channel && (
                    <Badge color="primary" size="sm">
                      {milestone.channel}
                    </Badge>
                  )}
                </div>

                {milestone.eventDetail && (
                  <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                    {milestone.eventDetail}
                  </p>
                )}

                {milestone.touches != null && (
                  <div className="mt-3 border-t border-card-border/40 pt-2 text-[11px] text-text-tertiary">
                    Tổng số điểm chạm tại thời điểm này: <strong>{milestone.touches}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SheetBody>

        {/* Footer */}
        <SheetFooter className="border-t border-card-border pt-4">
          <Button
            appearance="outline"
            size="sm"
            onPress={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Đóng bảng kiểm tra
          </Button>
        </SheetFooter>
      </SheetContent>
    </SheetOverlay>
  );
}
