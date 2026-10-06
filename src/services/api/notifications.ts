import { isNestApiEnabled, nestRequest } from "@/services/api/nest/nest-client";

export interface CrmNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  fromUserId?: string | null;
  referenceDoctype?: string | null;
  referenceName?: string | null;
  read: boolean;
  createdAt: string;
}

export interface CrmNotificationsResponse {
  notifications: CrmNotification[];
  unreadCount: number;
}

export async function getCrmNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<CrmNotificationsResponse | null> {
  if (!isNestApiEnabled()) return null;
  const result = await nestRequest<{
    data: CrmNotificationsResponse;
  }>("/api/v1/notifications", {
    query: {
      unreadOnly:
        options?.unreadOnly === undefined
          ? undefined
          : String(options.unreadOnly),
      limit: options?.limit,
    },
  });
  return result.data;
}

export async function markCrmNotificationRead(id: string): Promise<void> {
  if (!isNestApiEnabled()) return;
  await nestRequest(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
  });
}

export async function markAllCrmNotificationsRead(): Promise<void> {
  if (!isNestApiEnabled()) return;
  await nestRequest("/api/v1/notifications/read-all", { method: "POST" });
}
