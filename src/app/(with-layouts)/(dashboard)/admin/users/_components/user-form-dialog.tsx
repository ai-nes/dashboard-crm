"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { CreateDialogField, CreateDialogInput, CreateDialogSelect } from "@/components/common/create-dialog-field";
import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type { CrmUser } from "@/services/api/user-management";

import { ASSIGNABLE_CRM_ROLES } from "./role-select-dropdown";
import { LEAD_RECIPIENT_ROLES } from "./users-table";

const roleOptions = ASSIGNABLE_CRM_ROLES.map((role) => ({ id: role, label: role }));

interface UserFormValues {
  fullName: string;
  email: string;
  role: string;
  password: string;
  capacity: string;
}

interface UserFormDialogProps {
  isOpen: boolean;
  /** Present in edit mode; null when creating a new user. */
  user: CrmUser | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: { email: string; fullName: string; password: string; role: string }) => Promise<void>;
  onUpdate: (fields: { fullName: string; newPassword: string; capacity: number | null }) => Promise<void>;
}

const emptyForm: UserFormValues = {
  fullName: "",
  email: "",
  role: ASSIGNABLE_CRM_ROLES[0] ?? "",
  password: "",
  capacity: "",
};

export default function UserFormDialog({
  isOpen,
  user,
  isSubmitting = false,
  onOpenChange,
  onCreate,
  onUpdate,
}: UserFormDialogProps) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState<UserFormValues>(() =>
    user
      ? {
          fullName: user.fullName,
          email: user.email,
          role: user.role ?? "",
          password: "",
          capacity: user.capacity?.limit != null ? String(user.capacity.limit) : "",
        }
      : emptyForm,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const showCapacityField = isEdit && LEAD_RECIPIENT_ROLES.has(user?.role ?? "");
  const hasStaffRecord = Boolean(user?.capacity);

  const setField = <TField extends keyof UserFormValues>(field: TField, value: UserFormValues[TField]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!form.fullName.trim()) {
      setSubmitError("Họ tên là bắt buộc.");
      return;
    }
    if (!isEdit) {
      if (!form.email.trim()) {
        setSubmitError("Email là bắt buộc.");
        return;
      }
      if (!form.password) {
        setSubmitError("Mật khẩu là bắt buộc.");
        return;
      }
    }

    let capacity: number | null = null;
    if (showCapacityField && form.capacity.trim()) {
      const parsed = Number(form.capacity.trim());
      if (!Number.isInteger(parsed) || parsed <= 0) {
        setSubmitError("Capacity phải là số nguyên lớn hơn 0.");
        return;
      }
      capacity = parsed;
    }

    try {
      if (isEdit) {
        await onUpdate({ fullName: form.fullName.trim(), newPassword: form.password, capacity });
      } else {
        await onCreate({
          email: form.email.trim(),
          fullName: form.fullName.trim(),
          password: form.password,
          role: form.role,
        });
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể lưu người dùng.");
    }
  };

  return (
    <Backdrop
      isDismissable={!isSubmitting}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (open || !isSubmitting) onOpenChange(open);
      }}
    >
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          aria-label={isEdit ? "Sửa người dùng" : "Tạo người dùng"}
          className="relative overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-card-border px-5 py-4 pr-11">
              <DialogTitle className="text-base leading-6">
                {isEdit ? "Sửa người dùng" : "Tạo người dùng"}
              </DialogTitle>
              <DialogDescription className="text-xs leading-5 text-text-tertiary">
                {isEdit
                  ? "Đổi tên hiển thị hoặc đặt lại mật khẩu đăng nhập."
                  : "Tạo tài khoản CRM mới với mật khẩu đăng nhập ngay, không cần gửi email mời."}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="max-h-[calc(100vh-11rem)] space-y-3 overflow-y-auto px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <CreateDialogField className="sm:col-span-2" label="Họ tên" required>
                  <CreateDialogInput
                    autoFocus
                    label="Họ tên"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(event) => setField("fullName", event.target.value)}
                  />
                </CreateDialogField>
                <CreateDialogField className="sm:col-span-2" label="Email" required>
                  <CreateDialogInput
                    disabled={isEdit}
                    label="Email"
                    placeholder="user@example.com"
                    type="email"
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                  />
                </CreateDialogField>
                {!isEdit && (
                  <CreateDialogField label="Vai trò">
                    <CreateDialogSelect
                      label="Vai trò"
                      options={roleOptions}
                      placeholder="Chọn vai trò"
                      value={form.role}
                      onChange={(value) => setField("role", value)}
                    />
                  </CreateDialogField>
                )}
                <CreateDialogField
                  className={isEdit ? "sm:col-span-2" : undefined}
                  label={isEdit ? "Mật khẩu mới (để trống nếu giữ nguyên)" : "Mật khẩu"}
                  required={!isEdit}
                >
                  <CreateDialogInput
                    label="Mật khẩu"
                    placeholder={isEdit ? "Để trống nếu không đổi" : ""}
                    type="password"
                    value={form.password}
                    onChange={(event) => setField("password", event.target.value)}
                  />
                </CreateDialogField>
                {showCapacityField && (
                  <CreateDialogField
                    className="sm:col-span-2"
                    label="Số Lead tối đa được nhận cùng lúc"
                  >
                    <CreateDialogInput
                      label="Capacity"
                      type="number"
                      min={1}
                      step={1}
                      disabled={!hasStaffRecord}
                      placeholder={hasStaffRecord ? "Để trống nếu không đổi" : "Chưa vào Team"}
                      value={form.capacity}
                      onChange={(event) => setField("capacity", event.target.value)}
                    />
                    <p className="mt-1 text-xs text-text-tertiary">
                      {hasStaffRecord
                        ? user?.capacity?.configured
                          ? `Đang nhận ${user.capacity.active} Lead / giới hạn ${user.capacity.limit}. Để trống nếu không muốn đổi giới hạn.`
                          : "Chưa được thiết lập capacity nên hiện KHÔNG nhận Lead nào. Nhập số để bắt đầu nhận Lead."
                        : "Người dùng chưa thuộc Team Sales nào nên chưa thể đặt capacity. Hãy thêm vào Team trước."}
                    </p>
                  </CreateDialogField>
                )}
              </div>

              {submitError && (
                <p className="text-xs text-error-600" role="alert">
                  {submitError}
                </p>
              )}
            </DialogBody>

            <DialogFooter className="border-t border-card-border px-5 py-3">
              <Button
                appearance="outline"
                isDisabled={isSubmitting}
                onPress={() => onOpenChange(false)}
                size="sm"
                type="button"
              >
                Hủy
              </Button>
              <Button isDisabled={isSubmitting} size="sm" type="submit">
                {isSubmitting ? "Đang lưu…" : isEdit ? "Lưu" : "Tạo người dùng"}
              </Button>
            </DialogFooter>
          </form>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
