import { NestApiError } from "../nest/nest-client";
import {
  nestCampaignCreate,
  nestCampaignDelete,
  nestCampaignGet,
  nestCampaignList,
  nestCampaignRoutingOptions,
  nestCampaignUpdate,
} from "./campaigns-nest";

export interface LeadSaleCampaign {
  name: string;
  stableCode: string;
  title: string;
  status: string;
  campus?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelType?: string;
  channelUrl?: string;
  leadRoutingEnabled?: boolean;
  leadRoutingTargetType?: CampaignRoutingTargetType;
  leadRoutingTargetTeam?: string;
  leadRoutingTargetGroup?: string;
}

export type CampaignRoutingTargetType = "" | "Team" | "Team Group";

export interface CampaignRoutingOption {
  id: string;
  label: string;
  campus?: string;
  group?: string;
  province?: string;
}

export interface CampaignRoutingOptions {
  teams: CampaignRoutingOption[];
  groups: CampaignRoutingOption[];
}

export interface CampaignListResponse {
  campaigns: LeadSaleCampaign[];
  total: number;
}

export interface CampaignListParams {
  search?: string;
  start?: number;
  pageLength?: number;
  leadOnly?: boolean;
  channelType?: string;
}

export interface CreateCampaignPayload {
  title: string;
  campus: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelType?: string;
  channelUrl?: string;
  leadRoutingEnabled?: boolean;
  leadRoutingTargetType?: CampaignRoutingTargetType;
  leadRoutingTargetTeam?: string;
  leadRoutingTargetGroup?: string;
}

export interface UpdateCampaignPayload {
  name: string;
  stableCode?: string;
  title?: string;
  campus?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelType?: string;
  channelUrl?: string;
  leadRoutingEnabled?: boolean;
  leadRoutingTargetType?: CampaignRoutingTargetType;
  leadRoutingTargetTeam?: string;
  leadRoutingTargetGroup?: string;
}

export class CampaignApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CampaignApiError";
  }
}

/** Run a Nest call and surface its failures as `CampaignApiError`. */
async function viaNest<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new CampaignApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function normalizeCampaign(value: unknown): LeadSaleCampaign | null {
  const row = asRecord(value);
  const name = text(row?.name);
  if (!name) return null;
  const startDate = text(row?.startDate ?? row?.start_date);
  const endDate = text(row?.endDate ?? row?.end_date);
  const channelBoundary = text(row?.channelBoundary ?? row?.channel_boundary);
  const channelType = text(row?.channelType ?? row?.channel_type);
  const channelUrl = text(row?.channelUrl ?? row?.channel_url);
  const rawRoutingEnabled =
    row?.leadRoutingEnabled ?? row?.lead_routing_enabled;
  const rawTargetType =
    row?.leadRoutingTargetType ?? row?.lead_routing_target_type;
  const targetType = text(rawTargetType) as CampaignRoutingTargetType;
  const rawTargetTeam =
    row?.leadRoutingTargetTeam ?? row?.lead_routing_target_team;
  const rawTargetGroup =
    row?.leadRoutingTargetGroup ?? row?.lead_routing_target_group;
  return {
    name,
    stableCode: text(row?.stableCode ?? row?.stable_code),
    title: text(row?.title, name),
    status: text(row?.status),
    ...(text(row?.campus) ? { campus: text(row?.campus) } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(channelBoundary ? { channelBoundary } : {}),
    ...(channelType ? { channelType } : {}),
    ...(channelUrl ? { channelUrl } : {}),
    ...(rawRoutingEnabled !== undefined
      ? { leadRoutingEnabled: Boolean(rawRoutingEnabled) }
      : {}),
    ...(rawTargetType !== undefined
      ? {
          leadRoutingTargetType:
            targetType === "Team" || targetType === "Team Group"
              ? targetType
              : "",
        }
      : {}),
    ...(text(rawTargetTeam)
      ? { leadRoutingTargetTeam: text(rawTargetTeam) }
      : {}),
    ...(text(rawTargetGroup)
      ? { leadRoutingTargetGroup: text(rawTargetGroup) }
      : {}),
  };
}

export function normalizeCampaignList(value: unknown): CampaignListResponse {
  const payload = asRecord(value);
  if (!payload || !Array.isArray(payload.campaigns)) {
    throw new Error("Invalid Campaign list response");
  }

  const campaigns = payload.campaigns
    .map(normalizeCampaign)
    .filter((campaign): campaign is LeadSaleCampaign => campaign !== null);

  if (campaigns.length !== payload.campaigns.length) {
    throw new Error("Invalid Campaign list response");
  }

  return {
    campaigns,
    total: count(payload.total),
  };
}

function normalizeCampaignRecord(value: unknown): LeadSaleCampaign {
  const campaign = normalizeCampaign(value);
  if (!campaign) throw new Error("Invalid campaign response");
  return campaign;
}

export async function getCampaignList(
  params: CampaignListParams = {},
): Promise<CampaignListResponse> {
  return viaNest(async () =>
    normalizeCampaignList(await nestCampaignList({ search: params.search })),
  );
}

export async function createCampaign(
  payload: CreateCampaignPayload,
): Promise<LeadSaleCampaign> {
  return viaNest(async () =>
    normalizeCampaignRecord(await nestCampaignCreate(payload)),
  );
}

export async function getCampaign(
  code: string,
): Promise<LeadSaleCampaign | null> {
  const campaignCode = code.trim();
  if (!campaignCode) {
    throw new CampaignApiError(
      400,
      "INVALID_CAMPAIGN_CODE",
      "Mã campaign không được để trống.",
    );
  }
  try {
    return await viaNest(async () =>
      normalizeCampaignRecord(await nestCampaignGet(campaignCode)),
    );
  } catch (error) {
    if (error instanceof CampaignApiError && error.status === 404) return null;
    throw error;
  }
}

function normalizeCampaignRoutingOption(
  value: unknown,
  labelField: "team_name" | "group_name",
): CampaignRoutingOption | null {
  const row = asRecord(value);
  const id = text(row?.name);
  if (!id) return null;
  return {
    id,
    label: text(row?.[labelField], id),
    ...(text(row?.campus) ? { campus: text(row?.campus) } : {}),
    ...(text(row?.group) ? { group: text(row?.group) } : {}),
    ...(text(row?.province) ? { province: text(row?.province) } : {}),
  };
}

export async function getCampaignRoutingOptions(): Promise<CampaignRoutingOptions> {
  const payload = asRecord(await viaNest(() => nestCampaignRoutingOptions()));
  if (
    !payload ||
    !Array.isArray(payload.teams) ||
    !Array.isArray(payload.groups)
  ) {
    throw new CampaignApiError(
      502,
      "INVALID_CAMPAIGN_ROUTING_OPTIONS",
      "Phản hồi cấu hình phân bổ Campaign không hợp lệ.",
    );
  }
  return {
    teams: payload.teams.flatMap((value) => {
      const option = normalizeCampaignRoutingOption(value, "team_name");
      return option ? [option] : [];
    }),
    groups: payload.groups.flatMap((value) => {
      const option = normalizeCampaignRoutingOption(value, "group_name");
      return option ? [option] : [];
    }),
  };
}

export async function updateCampaign(
  payload: UpdateCampaignPayload,
): Promise<LeadSaleCampaign> {
  return viaNest(async () =>
    normalizeCampaignRecord(await nestCampaignUpdate(payload.name, payload)),
  );
}

export async function deleteCampaign(
  name: string,
): Promise<{ deleted: string }> {
  if (!name.trim()) {
    throw new CampaignApiError(
      400,
      "INVALID_CAMPAIGN_NAME",
      "Mã campaign không được để trống.",
    );
  }
  await viaNest(() => nestCampaignDelete(name));
  return { deleted: name };
}
