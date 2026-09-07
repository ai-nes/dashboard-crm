export type CampaignChannelTypeMode = "ONLINE" | "OFFLINE";

export interface CampaignChannelType {
  code: string;
  displayName: string;
  modes: CampaignChannelTypeMode[];
  enabled: boolean;
  sortOrder: number;
  description: string;
}

export interface CampaignChannelTypeListResponse {
  channelTypes: CampaignChannelType[];
  total: number;
}

export interface CampaignChannelTypeListParams {
  mode?: CampaignChannelTypeMode;
  search?: string;
  enabledOnly?: boolean;
  start?: number;
  pageLength?: number;
}

export interface CampaignChannelTypeRequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class CampaignChannelTypeApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CampaignChannelTypeApiError";
  }
}

const LIST_METHOD = "crm.api.campaign_channel_type.list_campaign_channel_types";
const DEFAULT_PAGE_LENGTH = 100;
const CHANNEL_MODES = ["ONLINE", "OFFLINE"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function count(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

function checked(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function normalizeModes(row: Record<string, unknown>): CampaignChannelTypeMode[] {
  const modes = Array.isArray(row.modes)
    ? row.modes.filter(
        (mode): mode is CampaignChannelTypeMode =>
          typeof mode === "string" && CHANNEL_MODES.includes(mode as CampaignChannelTypeMode),
      )
    : [];
  if (modes.length) return modes;

  return [
    ...(checked(row.isOnline ?? row.is_online) ? (["ONLINE"] as const) : []),
    ...(checked(row.isOffline ?? row.is_offline) ? (["OFFLINE"] as const) : []),
  ];
}

function normalizeCampaignChannelType(value: unknown): CampaignChannelType | null {
  const row = asRecord(value);
  const code = text(row?.code);
  if (!code) return null;
  return {
    code,
    displayName: text(row?.displayName ?? row?.display_name, code),
    modes: normalizeModes(row ?? {}),
    enabled: checked(row?.enabled),
    sortOrder: count(row?.sortOrder ?? row?.sort_order),
    description: text(row?.description),
  };
}

export function normalizeCampaignChannelTypeList(
  value: unknown,
): CampaignChannelTypeListResponse {
  const payload = asRecord(unwrapMessage(value));
  const rawRows = payload?.channelTypes ?? payload?.channel_types;
  if (!payload || !Array.isArray(rawRows)) {
    throw new Error("Invalid campaign channel type list response");
  }

  const channelTypes = rawRows
    .map(normalizeCampaignChannelType)
    .filter((row): row is CampaignChannelType => row !== null);
  if (channelTypes.length !== rawRows.length) {
    throw new Error("Invalid campaign channel type list response");
  }

  return {
    channelTypes,
    total: count(payload.total),
  };
}

function resolveBaseUrl(options: CampaignChannelTypeRequestOptions): string {
  return (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: CampaignChannelTypeRequestOptions,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Contract tests and non-request contexts do not have Next headers.
    }
  }
  return headers;
}

function errorDetails(
  value: unknown,
  status: number,
): { code: string; message: string } {
  const root = asRecord(value);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);
  return {
    code:
      text(error?.code) ||
      (status === 401
        ? "UNAUTHENTICATED"
        : status === 403
          ? "FORBIDDEN"
          : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(message?.message) ||
      text(root?.message) ||
      text(root?.exception) ||
      `Không thể tải loại kênh campaign (${status}).`,
  };
}

export async function getCampaignChannelTypes(
  params: CampaignChannelTypeListParams = {},
  options: CampaignChannelTypeRequestOptions = {},
): Promise<CampaignChannelTypeListResponse> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new CampaignChannelTypeApiError(
      503,
      "CAMPAIGN_CHANNEL_TYPE_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  const pageLength = Math.max(
    1,
    Math.floor(Number.isFinite(params.pageLength) ? params.pageLength! : DEFAULT_PAGE_LENGTH),
  );
  let nextStart = Math.max(
    0,
    Math.floor(Number.isFinite(params.start) ? params.start! : 0),
  );
  const channelTypes: CampaignChannelType[] = [];
  let total = 0;

  while (true) {
    const searchParams = new URLSearchParams({
      start: String(nextStart),
      page_length: String(pageLength),
    });
    if (params.mode) searchParams.set("mode", params.mode);
    if (params.search?.trim()) searchParams.set("search", params.search.trim());
    if (params.enabledOnly === false) searchParams.set("enabled_only", "0");

    const url = `${baseUrl}/api/method/${LIST_METHOD}?${searchParams.toString()}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: await requestHeaders(options),
        ...(typeof window !== "undefined"
          ? { credentials: "include" as RequestCredentials }
          : {}),
        cache: "no-store",
      });
    } catch {
      throw new CampaignChannelTypeApiError(
        503,
        "CAMPAIGN_CHANNEL_TYPE_API_UNAVAILABLE",
        "Không thể kết nối đến máy chủ loại kênh campaign.",
      );
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = errorDetails(payload, response.status);
      throw new CampaignChannelTypeApiError(response.status, details.code, details.message);
    }

    let page: CampaignChannelTypeListResponse;
    try {
      page = normalizeCampaignChannelTypeList(payload);
    } catch {
      throw new CampaignChannelTypeApiError(
        502,
        "INVALID_CAMPAIGN_CHANNEL_TYPE_RESPONSE",
        "Phản hồi danh sách loại kênh campaign không hợp lệ.",
      );
    }

    channelTypes.push(...page.channelTypes);
    total = page.total;
    if (
      page.channelTypes.length < pageLength ||
      nextStart + page.channelTypes.length >= total
    ) {
      break;
    }
    nextStart += page.channelTypes.length;
  }

  return { channelTypes, total };
}
