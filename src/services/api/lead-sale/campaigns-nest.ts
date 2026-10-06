/**
 * Campaigns against the NestJS reference-data API, reshaped for the existing
 * campaign screens. Lead routing maps onto the campaign's owning team.
 */
import { NestApiError, nestRequest } from "../nest/nest-client";

interface Page<T> {
  data: T[];
  meta: { pagination: { total: number } };
}

interface NestCampaign {
  id: string;
  title: string;
  stableCode: string | null;
  status: string;
  campusId: string;
  startDate: string | null;
  endDate: string | null;
  channelBoundary: string | null;
  channelUrl: string | null;
  owningTeamId: string | null;
}

interface NestNamed {
  id: string;
  name: string;
  campusId?: string;
}

const PAGE_SIZE = 500;

async function nameMaps() {
  const [campuses, teams] = await Promise.all([
    nestRequest<Page<NestNamed>>("/api/v1/reference-data/campuses", {
      query: { pageSize: PAGE_SIZE },
    }),
    nestRequest<Page<NestNamed>>("/api/v1/reference-data/teams", {
      query: { pageSize: PAGE_SIZE },
    }),
  ]);
  return {
    campusName: new Map(campuses.data.map((row) => [row.id, row.name])),
    campusId: new Map(campuses.data.map((row) => [row.name, row.id])),
    teams: teams.data,
  };
}

const isoDay = (value: string | null) => (value ? value.slice(0, 10) : "");

function toDashboard(
  campaign: NestCampaign,
  campusName: Map<string, string>,
): Record<string, unknown> {
  return {
    name: campaign.id,
    stableCode: campaign.stableCode ?? "",
    title: campaign.title,
    status: campaign.status,
    campus: campusName.get(campaign.campusId) ?? campaign.campusId,
    start_date: isoDay(campaign.startDate),
    end_date: isoDay(campaign.endDate),
    channel_boundary: campaign.channelBoundary ?? "",
    channel_url: campaign.channelUrl ?? "",
    lead_routing_enabled: campaign.owningTeamId !== null,
    lead_routing_target_type: campaign.owningTeamId ? "Team" : "",
    lead_routing_target_team: campaign.owningTeamId ?? "",
  };
}

export async function nestCampaignList(params: {
  search?: string;
}): Promise<unknown> {
  const [result, maps] = await Promise.all([
    nestRequest<Page<NestCampaign>>("/api/v1/reference-data/campaigns", {
      query: { pageSize: PAGE_SIZE, q: params.search },
    }),
    nameMaps(),
  ]);
  return {
    campaigns: result.data.map((row) => toDashboard(row, maps.campusName)),
    total: result.meta.pagination.total,
  };
}

/** Look a campaign up by id, then by stable code or title. */
export async function nestCampaignGet(code: string): Promise<unknown> {
  const maps = await nameMaps();
  try {
    const result = await nestRequest<{ data: NestCampaign }>(
      `/api/v1/reference-data/campaigns/${encodeURIComponent(code)}`,
    );
    return toDashboard(result.data, maps.campusName);
  } catch (error) {
    if (!(error instanceof NestApiError) || error.status !== 404) throw error;
  }
  const found = await nestRequest<Page<NestCampaign>>(
    "/api/v1/reference-data/campaigns",
    { query: { pageSize: PAGE_SIZE, q: code } },
  );
  const match = found.data.find(
    (row) => row.stableCode === code || row.title === code,
  );
  if (!match) {
    throw new NestApiError(404, "NOT_FOUND", "Không tìm thấy campaign.");
  }
  return toDashboard(match, maps.campusName);
}

export async function nestCampaignRoutingOptions(): Promise<unknown> {
  const maps = await nameMaps();
  return {
    teams: maps.teams.map((team) => ({
      name: team.id,
      team_name: team.name,
      campus: maps.campusName.get(team.campusId ?? "") ?? "",
    })),
    groups: [],
  };
}

interface CampaignInput {
  title?: string;
  campus?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  channelBoundary?: string;
  channelUrl?: string;
  leadRoutingEnabled?: boolean;
  leadRoutingTargetTeam?: string;
  stableCode?: string;
}

async function toBody(input: CampaignInput): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.status) body.status = input.status;
  if (input.startDate) body.startDate = input.startDate.slice(0, 10);
  if (input.endDate) body.endDate = input.endDate.slice(0, 10);
  if (input.channelBoundary) body.channelBoundary = input.channelBoundary;
  if (input.channelUrl) body.channelUrl = input.channelUrl;
  if (input.stableCode) body.stableCode = input.stableCode;
  if (input.campus) {
    const maps = await nameMaps();
    body.campusId = maps.campusId.get(input.campus) ?? input.campus;
  }
  if (input.leadRoutingEnabled === false) body.owningTeamId = null;
  else if (input.leadRoutingTargetTeam) {
    body.owningTeamId = input.leadRoutingTargetTeam;
  }
  return body;
}

export async function nestCampaignCreate(
  input: CampaignInput,
): Promise<unknown> {
  const created = await nestRequest<{ data: NestCampaign }>(
    "/api/v1/reference-data/campaigns",
    {
      method: "POST",
      body: { status: "DRAFT", ...(await toBody(input)) },
    },
  );
  return nestCampaignGet(created.data.id);
}

export async function nestCampaignUpdate(
  id: string,
  input: CampaignInput,
): Promise<unknown> {
  await nestRequest(
    `/api/v1/reference-data/campaigns/${encodeURIComponent(id)}`,
    { method: "PATCH", body: await toBody(input) },
  );
  return nestCampaignGet(id);
}

export async function nestCampaignDelete(id: string): Promise<void> {
  await nestRequest(
    `/api/v1/reference-data/campaigns/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
