"use client";

import {
  BellIcon,
  CreditCardIcon,
  LetterIcon,
  PrinterIcon,
  SettingIcon,
} from "@/components/common/header/icons";
import { Button } from "@/components/tailgrids/core/button";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";
import { cn } from "@/utils/cn";
import {
  getCrmNotifications,
  markAllCrmNotificationsRead,
  markCrmNotificationRead,
  type CrmNotification,
} from "@/services/api/notifications";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Header, Heading } from "react-aria-components";

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  isUnread?: boolean;
}

interface NotificationGroup {
  title: string;
  items: Notification[];
}

interface NotificationPanelContentProps {
  notifications: NotificationGroup[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const defaultNotifications: NotificationGroup[] = [
  {
    title: "Hôm nay",
    items: [
      {
        id: "1",
        icon: <LetterIcon />,
        title: "New Message Arrived",
        description: "Elsie McElroy sent you new message",
        timestamp: "5h ago",
        isUnread: true,
      },
      {
        id: "2",
        icon: <CreditCardIcon />,
        title: "Transaction Approved",
        description: "Your payment of $75.00 to Chad Hurley was successful.",
        timestamp: "10h ago",
        isUnread: true,
      },
      {
        id: "3",
        icon: <PrinterIcon />,
        title: "Upcoming Bill",
        description:
          "Reminder: Invoice EST-INV012 is due in 3 days. Please submit payment.",
        timestamp: "12h ago",
        isUnread: false,
      },
    ],
  },
  {
    title: "Hôm qua",
    items: [
      {
        id: "4",
        icon: <CreditCardIcon />,
        title: "Transaction Approved",
        description: "Your payment of $75.00 to Chad Hurley was successful.",
        timestamp: "10h ago",
        isUnread: true,
      },
      {
        id: "5",
        icon: <LetterIcon />,
        title: "New Message Arrived",
        description: "Elsie McElroy sent you new message",
        timestamp: "5h ago",
        isUnread: true,
      },
      {
        id: "6",
        icon: <PrinterIcon />,
        title: "Upcoming Bill",
        description:
          "Reminder: Invoice EST-INV012 is due in 3 days. Please submit payment.",
        timestamp: "12h ago",
        isUnread: false,
      },
    ],
  },
];

export function NotificationPanelContent({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelContentProps) {
  const hasNotifications = notifications.some(
    (group) => group.items.length > 0,
  );

  return (
    <>
      <ScrollArea className="h-100 max-h-100">
        <ScrollAreaViewport>
          {hasNotifications ? (
            notifications.map((group) => (
              <section key={group.title}>
                <div className="border-t border-b border-border-primary bg-background-gray-secondary px-5 py-2">
                  <p className="text-xs leading-4 text-text-tertiary uppercase">
                    {group.title}
                  </p>
                </div>
                <ul className="flex-1 overflow-y-auto px-3 py-2">
                  {group.items.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        aria-label={`Mở thông báo: ${notification.title}`}
                        className="group flex w-full cursor-pointer gap-3.5 rounded-lg px-3 py-3 text-left transition-colors duration-300 hover:bg-background-gray-secondary_alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-background-gray-primary text-icon-secondary transition-all duration-300 group-hover:bg-brand-500 group-hover:text-base-white group-hover:shadow-[0_1px_3px_0.5px_rgba(13,13,18,0.08)]">
                          {notification.icon}
                        </span>
                        <div className="min-w-0 flex-1 text-start">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm leading-5 font-semibold text-text-primary">
                              {notification.title}
                            </p>
                            {notification.isUnread && (
                              <span
                                aria-label="Chưa đọc"
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                              />
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-text-secondary">
                            {notification.description}
                          </p>
                          <p className="mt-2 text-xs leading-4 text-text-tertiary">
                            {notification.timestamp}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <div
              className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center"
              role="status"
            >
              <BellIcon />
              <p className="mt-3 text-sm font-semibold text-text-primary">
                Bạn chưa có thông báo nào
              </p>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                Thông báo mới sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </ScrollAreaViewport>
        <ScrollBar />
      </ScrollArea>

      {hasNotifications && (
        <div className="flex items-center justify-between border-t border-border-secondary-alt px-5 py-4">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-xs font-medium text-text-secondary underline transition-colors hover:text-text-primary"
            >
              Đánh dấu tất cả đã đọc
            </button>
          ) : (
            <span />
          )}
          <Button variant="primary" size="sm" className="bg-brand-500 py-1.5">
            Xem tất cả
          </Button>
        </div>
      )}
    </>
  );
}

export function NotificationsButton() {
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      try {
        const result = await getCrmNotifications({ limit: 50 });
        if (!result || disposed) return;
        setNotifications(groupCrmNotifications(result.notifications));
      } catch {
        // Keep the existing empty/mock state when the local API is unavailable.
      }
    };
    void load();
    return () => {
      disposed = true;
    };
  }, []);

  const unreadCount = notifications
    .flatMap((n) => n.items)
    .filter((n) => n.isUnread).length;

  const handleMarkAsRead = (notificationId: string) => {
    void markCrmNotificationRead(notificationId).catch(() => undefined);
    setNotifications((prevNotifications) =>
      prevNotifications.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === notificationId ? { ...item, isUnread: false } : item,
        ),
      })),
    );
  };

  const handleMarkAllAsRead = () => {
    void markAllCrmNotificationsRead().catch(() => undefined);
    setNotifications(
      notifications.map((n) => ({
        ...n,
        items: n.items.map((i) => ({ ...i, isUnread: false })),
      })),
    );
  };

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        iconOnly
        appearance="outline"
        aria-label="Thông báo"
        className="relative size-8.5 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 [&>svg]:size-4"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute top-1.5 right-2 z-1 size-2 rounded-full bg-red-400",
            )}
          >
            <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-400 opacity-75" />
          </span>
        )}
      </Button>

      <Popover
        placement="bottom end"
        className="w-84.5 overflow-hidden rounded-2xl border border-border-secondary-alt bg-background-white-secondary p-0 shadow-3xl"
      >
        {/* Header */}
        <Header className="flex items-center justify-between border-b border-border-secondary-alt px-5 pt-5 pb-4">
          <Heading
            level={4}
            className="leading-6 font-semibold text-text-primary"
          >
            Thông báo
          </Heading>

          <Link
            className="p-1 text-icon-secondary transition-colors hover:text-icon-primary"
            href="/profile/notification"
            onClick={() => setIsOpen(false)}
          >
            <SettingIcon />
          </Link>
        </Header>

        <NotificationPanelContent
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </Popover>
    </OverlayWrapper>
  );
}

function groupCrmNotifications(notifications: CrmNotification[]) {
  const groups = new Map<string, Notification[]>();
  for (const notification of notifications) {
    const date = new Date(notification.createdAt);
    const group =
      date.toDateString() === new Date().toDateString()
        ? "Hôm nay"
        : "Trước đó";
    const item: Notification = {
      id: notification.id,
      icon: <LetterIcon />,
      title: notification.title,
      description: notification.message,
      timestamp: date.toLocaleString("vi-VN"),
      isUnread: !notification.read,
    };
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }
  return [...groups.entries()].map(([title, items]) => ({ title, items }));
}
