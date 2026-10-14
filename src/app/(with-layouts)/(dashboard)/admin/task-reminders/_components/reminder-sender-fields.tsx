"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { EditableDetailField } from "@/components/common/editable-detail-field";
import { requiresAppPassword } from "./form-model";
import ReminderField from "./reminder-field";
import type { ReminderSectionProps } from "./reminder-form-types";

export default function ReminderSenderFields({
  form,
  settings,
  errors,
  disabled,
  onChange,
}: ReminderSectionProps) {
  const passwordRequired = requiresAppPassword(form, settings);
  return (
    <Card className="h-full p-5">
      <CardHeader className="mb-5">
        <CardTitle>Gmail gửi thông báo</CardTitle>
        <Badge color={passwordRequired ? "warning" : "success"}>
          {passwordRequired ? "Cần mật khẩu ứng dụng" : "Đã cấu hình"}
        </Badge>
      </CardHeader>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <ReminderField
          appearance="inline"
          label="Địa chỉ Gmail gửi"
          type="email"
          required
          maxLength={254}
          value={form.senderEmail}
          onChange={(event) => onChange("senderEmail", event.target.value)}
          error={errors.senderEmail}
          disabled={disabled}
          autoComplete="off"
          placeholder="Nhập Gmail gửi"
        />
        <ReminderField
          appearance="inline"
          label="Tên hiển thị"
          required
          maxLength={191}
          value={form.senderName}
          onChange={(event) => onChange("senderName", event.target.value)}
          error={errors.senderName}
          disabled={disabled}
          autoComplete="off"
          placeholder="Hệ thống CRM FPTU"
        />
        <ReminderField
          appearance="inline"
          label="Mật khẩu ứng dụng Gmail"
          name="appPassword"
          type="password"
          required={passwordRequired}
          maxLength={256}
          value={form.appPassword}
          onChange={(event) => onChange("appPassword", event.target.value)}
          error={errors.appPassword}
          disabled={disabled}
          autoComplete="new-password"
          placeholder={
            passwordRequired ? "Nhập mật khẩu ứng dụng" : "Giữ mật khẩu đã lưu"
          }
        />
        <dl>
          <EditableDetailField
            label="Máy chủ Gmail SMTP"
            value="smtp.gmail.com"
          />
        </dl>
      </div>
      <p className="mt-4 text-xs leading-5 text-text-tertiary">
        Không hiển thị lại mật khẩu đã lưu. Khi đổi Gmail gửi, cần nhập mật khẩu
        ứng dụng mới.
      </p>
    </Card>
  );
}
