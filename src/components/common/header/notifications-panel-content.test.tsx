import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NotificationsButton } from "./notifications";
import * as notificationModule from "./notifications";

interface TestNotification {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  isUnread?: boolean;
}

interface TestNotificationGroup {
  title: string;
  items: TestNotification[];
}

interface NotificationPanelContentProps {
  notifications: TestNotificationGroup[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const moduleWithPanel = notificationModule as unknown as {
  NotificationPanelContent?: React.ComponentType<NotificationPanelContentProps>;
};

function renderPanel(notifications: TestNotificationGroup[]) {
  const Panel = moduleWithPanel.NotificationPanelContent;
  if (!Panel) return "";

  return renderToStaticMarkup(
    <Panel
      notifications={notifications}
      unreadCount={
        notifications
          .flatMap((group) => group.items)
          .filter((item) => item.isUnread).length
      }
      onMarkAsRead={() => undefined}
      onMarkAllAsRead={() => undefined}
    />,
  );
}

describe("notification panel empty state", () => {
  it("uses Vietnamese copy for the panel heading", () => {
    const html = renderToStaticMarkup(<NotificationsButton />);

    expect(html).toContain("Thông báo");
  });

  it("shows Vietnamese empty guidance and hides actions when there are no notifications", () => {
    const html = renderPanel([]);

    expect(html).toContain("Bạn chưa có thông báo nào");
    expect(html).toContain('role="status"');
    expect(html).not.toContain("Đánh dấu tất cả đã đọc");
    expect(html).not.toContain("Xem tất cả");
  });

  it("keeps notification items and available actions when notifications exist", () => {
    const html = renderPanel([
      {
        title: "Hôm nay",
        items: [
          {
            id: "n-1",
            icon: <span aria-hidden="true">•</span>,
            title: "Bạn được giao một task",
            description: "Task đã được giao cho bạn.",
            timestamp: "14/10/2026",
            isUnread: true,
          },
        ],
      },
    ]);

    expect(html).toContain("Bạn được giao một task");
    expect(html).toContain("Đánh dấu tất cả đã đọc");
    expect(html).toContain("Xem tất cả");
  });

  it("hides mark-all when every notification is already read", () => {
    const html = renderPanel([
      {
        title: "Hôm nay",
        items: [
          {
            id: "n-2",
            icon: <span aria-hidden="true">•</span>,
            title: "Thông báo đã đọc",
            description: "Nội dung thông báo.",
            timestamp: "14/10/2026",
            isUnread: false,
          },
        ],
      },
    ]);

    expect(html).not.toContain("Đánh dấu tất cả đã đọc");
    expect(html).toContain("Xem tất cả");
  });
});
