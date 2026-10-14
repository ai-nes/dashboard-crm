"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/common/auth/auth-provider";
import { canReadCrmPath } from "@/components/common/auth/permissions";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { Button } from "@/components/tailgrids/core/button";
import { Badge } from "@/components/tailgrids/core/badge";
import { NestApiError } from "@/services/api/nest/nest-client";
import {
  getTaskReminderSettings,
  updateTaskReminderSettings,
  type TaskReminderForm,
} from "@/services/api/task-reminder-settings";
import { formatReminderDate, reminderError } from "./form-model";
import ReminderAlert from "./reminder-alert";
import ReminderSettingsForm from "./reminder-settings-form";
import ReminderTemplateDialog from "./reminder-template-dialog";
import ReminderSkeleton from "./reminder-skeleton";

export default function TaskReminderSettingsPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <ReminderSkeleton />;
  if (!canReadCrmPath("/admin/task-reminders", user))
    return (
      <div className="p-4 sm:p-6">
        <ReminderAlert
          failure={{ message: "Tài khoản không có quyền cấu hình hệ thống." }}
        />
      </div>
    );
  return <SettingsWorkspace />;
}

function SettingsWorkspace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [templateOpen, setTemplateOpen] = useState(false);
  const queryKey = ["task-reminder-settings", user?.user] as const;
  const [state, setState] = useState({ dirty: false, busy: false });
  const query = useQuery({
    queryKey,
    queryFn: getTaskReminderSettings,
    retry: false,
    staleTime: Infinity,
    enabled: !state.dirty && !state.busy,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: "always",
  });
  const onStateChange = useCallback(
    (next: { dirty: boolean; busy: boolean }) => setState(next),
    [],
  );
  const save = useCallback(
    async (form: TaskReminderForm) => {
      // Keep the password out of query and mutation caches.
      const saved = await updateTaskReminderSettings(form);
      queryClient.setQueryData(["task-reminder-settings", user?.user], saved);
      return saved;
    },
    [queryClient, user?.user],
  );
  if (query.isPending) return <ReminderSkeleton />;
  const failure = query.error
    ? {
        ...reminderError(query.error),
        loginRequired:
          query.error instanceof NestApiError && query.error.status === 401,
      }
    : undefined;
  return (
    <main className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6">
      <AdminPageHeader
        section="Cấu hình hệ thống"
        title="Email nhắc task cho Sales"
        description="Gửi email tự động khi task sắp đến hạn hoặc đã quá hạn."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              appearance="outline"
              size="sm"
              onPress={() => setTemplateOpen(true)}
              isDisabled={!query.data || state.busy}
            >
              Sửa mẫu email
            </Button>
          </div>
        }
        details={
          query.data ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-tertiary">
              <Badge color={query.data.enabled ? "success" : "gray"}>
                {query.data.enabled ? "Tự động đang bật" : "Tự động tạm tắt"}
              </Badge>
              <Badge
                color={query.data.passwordConfigured ? "success" : "warning"}
              >
                {query.data.passwordConfigured
                  ? "Gmail đã cấu hình"
                  : "Gmail chưa cấu hình"}
              </Badge>
              <span>
                Cập nhật lần cuối: {formatReminderDate(query.data.updatedAt)}
              </span>
              <span role="status">
                {state.busy
                  ? "Đang xử lý…"
                  : state.dirty
                    ? "Chờ tự động lưu…"
                    : "Đã lưu"}
              </span>
            </div>
          ) : undefined
        }
      />
      {failure ? (
        <div className="mt-3">
          <ReminderAlert failure={failure} />
        </div>
      ) : null}
      {query.data ? (
        <ReminderSettingsForm
          settings={query.data}
          refreshing={query.isFetching}
          onSave={save}
          onStateChange={onStateChange}
        />
      ) : null}
      {templateOpen && query.data ? (
        <ReminderTemplateDialog
          sender={query.data}
          onClose={() => setTemplateOpen(false)}
        />
      ) : null}
    </main>
  );
}
