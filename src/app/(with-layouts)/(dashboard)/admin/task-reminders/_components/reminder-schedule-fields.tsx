"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { EditableDetailField } from "@/components/common/editable-detail-field";
import ReminderField from "./reminder-field";
import type { ReminderSectionProps } from "./reminder-form-types";

export default function ReminderScheduleFields({
  form,
  errors,
  disabled,
  onChange,
}: ReminderSectionProps) {
  return (
    <Card className="h-full p-5">
      <CardHeader className="mb-5">
        <CardTitle>Lịch gửi</CardTitle>
        <Badge color="primary" className="text-primary-700">
          Hằng ngày
        </Badge>
      </CardHeader>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <ReminderField
          appearance="inline"
          label="Gửi mỗi ngày lúc"
          type="time"
          required
          step={60}
          value={form.sendTime}
          onChange={(event) => onChange("sendTime", event.target.value)}
          error={errors.sendTime}
          disabled={disabled}
        />
        <ReminderField
          appearance="inline"
          label="Nhắc trước hạn (giờ)"
          type="number"
          required
          min={1}
          max={168}
          step={1}
          value={Number.isNaN(form.hoursBefore) ? "" : form.hoursBefore}
          onChange={(event) =>
            onChange(
              "hoursBefore",
              event.target.value === "" ? NaN : Number(event.target.value),
            )
          }
          error={errors.hoursBefore}
          disabled={disabled}
        />
        <dl>
          <EditableDetailField label="Múi giờ" value="Asia/Ho_Chi_Minh" />
        </dl>
        <div>
          <p className="text-xs text-text-tertiary">Gửi email tự động</p>
          <div className="mt-1 flex min-h-8 items-center gap-3">
            <Toggle
              checked={form.enabled}
              onChange={(event) => onChange("enabled", event.target.checked)}
              disabled={disabled}
              aria-label="Bật gửi email tự động"
            />
            <Badge color={form.enabled ? "success" : "gray"}>
              {form.enabled ? "Đang bật" : "Tạm tắt"}
            </Badge>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-text-tertiary">
        Nhắc task sắp đến hạn và quá hạn của người phụ trách. Lưu cấu hình áp
        dụng từ lần chạy lịch kế tiếp.
      </p>
    </Card>
  );
}
