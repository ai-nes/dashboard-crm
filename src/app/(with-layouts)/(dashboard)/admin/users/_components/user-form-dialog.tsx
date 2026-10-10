"use client";

import { Eye, EyeDisabled } from "@tailgrids/icons";
import { useId, useState, type FormEvent } from "react";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import {
  CreateDialogField,
  CreateDialogInput,
  CreateDialogSelect,
} from "@/components/common/create-dialog-field";
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

const roleOptions = ASSIGNABLE_CRM_ROLES.map((role) => ({
  id: role,
  label: role,
}));

const passwordRequirement = "Mật khẩu phải có từ 6 đến 128 ký tự.";

interface UserFormValues {
  fullName: string;
  email: string;
  role: string;
  password: string;
}

interface UserFormDialogProps {
  isOpen: boolean;
  /** Present in edit mode; null when creating a new user. */
  user: CrmUser | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (fields: {
    email: string;
    fullName: string;
    password: string;
    role: string;
  }) => Promise<void>;
  onUpdate: (fields: {
    fullName: string;
    newPassword: string;
  }) => Promise<void>;
}

const emptyForm: UserFormValues = {
  fullName: "",
  email: "",
  role: ASSIGNABLE_CRM_ROLES[0] ?? "",
  password: "",
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
        }
      : emptyForm,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordHintId = useId();
  const hasPasswordError = submitError === passwordRequirement;

  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) return;
    if (!open) setShowPassword(false);
    onOpenChange(open);
  };

  const setField = <TField extends keyof UserFormValues>(
    field: TField,
    value: UserFormValues[TField],
  ) => {
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

    if (
      form.password &&
      (form.password.length < 6 || form.password.length > 128)
    ) {
      setSubmitError(passwordRequirement);
      return;
    }

    try {
      if (isEdit) {
        await onUpdate({
          fullName: form.fullName.trim(),
          newPassword: form.password,
        });
      } else {
        await onCreate({
          email: form.email.trim(),
          fullName: form.fullName.trim(),
          password: form.password,
          role: form.role,
        });
      }
      setShowPassword(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể lưu người dùng.",
      );
    }
  };

  return (
    <Backdrop
      isDismissable={!isSubmitting}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
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
                <CreateDialogField
                  className="sm:col-span-2"
                  label="Họ tên"
                  required
                >
                  <CreateDialogInput
                    autoFocus
                    label="Họ tên"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(event) =>
                      setField("fullName", event.target.value)
                    }
                  />
                </CreateDialogField>
                <CreateDialogField
                  className="sm:col-span-2"
                  label="Email"
                  required
                >
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
                <div className={isEdit ? "sm:col-span-2" : undefined}>
                  <div className="relative">
                    <CreateDialogField
                      label={
                        isEdit
                          ? "Mật khẩu mới (để trống nếu giữ nguyên)"
                          : "Mật khẩu"
                      }
                      required={!isEdit}
                    >
                      <CreateDialogInput
                        aria-describedby={passwordHintId}
                        autoComplete="new-password"
                        className="pr-11"
                        label="Mật khẩu"
                        placeholder={isEdit ? "Để trống nếu không đổi" : ""}
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) =>
                          setField("password", event.target.value)
                        }
                      />
                    </CreateDialogField>
                    <Button
                      appearance="ghost"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-1 bottom-1 size-8 text-text-tertiary"
                      iconOnly
                      isDisabled={isSubmitting}
                      onPress={() => setShowPassword((visible) => !visible)}
                      size="sm"
                      type="button"
                    >
                      {showPassword ? (
                        <EyeDisabled aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  <p
                    id={passwordHintId}
                    className={`mt-1.5 text-xs ${hasPasswordError ? "text-error-600" : "text-text-tertiary"}`}
                    role={hasPasswordError ? "alert" : undefined}
                  >
                    {passwordRequirement}
                  </p>
                </div>
              </div>

              {submitError && !hasPasswordError && (
                <p className="text-xs text-error-600" role="alert">
                  {submitError}
                </p>
              )}
            </DialogBody>

            <DialogFooter className="border-t border-card-border px-5 py-3">
              <Button
                appearance="outline"
                isDisabled={isSubmitting}
                onPress={() => handleOpenChange(false)}
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
