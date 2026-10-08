import { NestApiError, nestRequest } from "../nest/nest-client";

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

function normalizeModes(
  row: Record<string, unknown>,
): CampaignChannelTypeMode[] {
  const modes = Array.isArray(row.modes)
    ? row.modes.filter(
        (mode): mode is CampaignChannelTypeMode =>
          typeof mode === "string" &&
          CHANNEL_MODES.includes(mode as CampaignChannelTypeMode),
      )
    : [];
  if (modes.length) return modes;

  return [
    ...(checked(row.isOnline) ? (["ONLINE"] as const) : []),
    ...(checked(row.isOffline) ? (["OFFLINE"] as const) : []),
  ];
}

function normalizeCampaignChannelType(
  value: unknown,
): CampaignChannelType | null {
  const row = asRecord(value);
  const code = text(row?.code);
  if (!code) return null;
  return {
    code,
    displayName: text(row?.displayName, code),
    modes: normalizeModes(row ?? {}),
    enabled: checked(row?.enabled),
    sortOrder: count(row?.sortOrder),
    description: text(row?.description),
  };
}

export function normalizeCampaignChannelTypeList(
  value: unknown,
): CampaignChannelTypeListResponse {
  const payload = asRecord(value);
  const rawRows = payload?.channelTypes;
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

async function getNestCampaignChannelTypes(
  params: CampaignChannelTypeListParams,
): Promise<CampaignChannelTypeListResponse> {
  try {
    const payload = await nestRequest<unknown>(
      "/api/v1/campaign-channel-types",
      {
        query: {
          mode: params.mode,
          search: params.search?.trim(),
          enabledOnly: params.enabledOnly === false ? "0" : undefined,
          start: params.start,
          pageLength: params.pageLength ?? DEFAULT_PAGE_LENGTH,
        },
      },
    );
    return normalizeCampaignChannelTypeList(payload);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new CampaignChannelTypeApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw new CampaignChannelTypeApiError(
      502,
      "INVALID_CAMPAIGN_CHANNEL_TYPE_RESPONSE",
      "Phản hồi danh sách loại kênh campaign không hợp lệ.",
    );
  }
}

export async function getCampaignChannelTypes(
  params: CampaignChannelTypeListParams = {},
): Promise<CampaignChannelTypeListResponse> {
  return getNestCampaignChannelTypes(params);
}
