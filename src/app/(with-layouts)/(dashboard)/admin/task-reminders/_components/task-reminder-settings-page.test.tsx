import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import TaskReminderSettingsPage from "./task-reminder-settings-page";
import ReminderStatus from "./reminder-status";
import type { TaskReminderSettings } from "@/services/api/task-reminder-settings";

const auth = vi.hoisted(() => ({
  user: null as CurrentUser | null,
  isLoading: false,
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => auth,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useQueryClient: () => ({}),
  useQuery: () => ({ isPending: true }),
}));

describe("reminder UI permissions and state", () => {
  it("allows backend identity administrators even without profile capabilities", () => {
    auth.user = {
      roles: ["Administrator"],
      crm_capabilities: [],
      crm_is_administrator: true,
    } as unknown as CurrentUser;
    expect(renderToStaticMarkup(<TaskReminderSettingsPage />)).toContain(
      "Đang tải cấu hình email nhắc task",
    );
  });
  it("does not render configuration or send actions without capability", () => {
    auth.user = {
      roles: ["Administrator"],
      crm_capabilities: [],
    } as unknown as CurrentUser;
    const html = renderToStaticMarkup(<TaskReminderSettingsPage />);
    expect(html).toContain("không có quyền");
    expect(html).not.toContain("Lưu cấu hình");
    expect(html).not.toContain("Gửi email thử");
    expect(html).not.toContain("Làm mới trạng thái");
  });
  it("renders loading UI for a permitted account while fetching", () => {
    auth.user = {
      roles: ["Sale"],
      crm_capabilities: ["system.configure"],
    } as unknown as CurrentUser;
    expect(renderToStaticMarkup(<TaskReminderSettingsPage />)).toContain(
      "Đang tải cấu hình email nhắc task",
    );
  });
  it.each([
    [null, "Chưa từng chạy"],
    ["running", "Đang xử lý"],
    ["succeeded", "Hoàn tất"],
    ["failed", "Có email gửi lỗi"],
  ] as const)("renders the recorded run status %s", (lastRunStatus, label) => {
    const html = renderToStaticMarkup(
      <ReminderStatus
        settings={
          {
            enabled: true,
            lastRunStatus,
            lastRunAt: "2026-10-12T01:00:00Z",
            updatedAt: "2026-10-12T01:00:00Z",
          } as TaskReminderSettings
        }
      />,
    );
    expect(html).toContain(label);
    expect(html).toContain("08:00");
    expect(html).toContain("Đang bật");
    expect(html).not.toContain("12 email");
  });
});
