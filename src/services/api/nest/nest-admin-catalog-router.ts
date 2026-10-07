/**
 * Admin catalog calls (`crm.api.admin_catalog.*`) served by the NestJS API:
 * admission years (reference data) and admission offerings. Methods without a
 * Nest equivalent resolve to `NOT_HANDLED` so callers keep their old route.
 */
import { nestRequest } from "./nest-client";

export const NOT_HANDLED = Symbol("not-handled");

type Params = Record<string, string | undefined>;
type Body = Record<string, unknown> | undefined;

interface Page<T> {
  data: T[];
  meta: { pagination: { total: number } };
}

interface NestYear {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  updatedAt?: string;
}

const YEARS = "/api/v1/reference-data/admission-years";
const OFFERINGS = "/api/v1/admission-offerings";
const CHANNEL_TYPES = "/api/v1/campaign-channel-types";
const SCORE = "/api/v1/score-config";
const GOVERNED = "/api/v1/governed-values";
const YEAR_CONFIGS = "/api/v1/academic-year-configs";

const GOVERNED_CATALOGS: Record<string, { path: string; valueField: string }> =
  {
    "CRM Campus": { path: "campus", valueField: "campus_name" },
    "CRM Lead Source": { path: "lead-source", valueField: "source_name" },
    "CRM Platform": { path: "platform", valueField: "platform_name" },
  };

function governedCatalog(doctype: unknown) {
  const catalog = GOVERNED_CATALOGS[String(doctype ?? "")];
  if (!catalog) throw new Error("Unsupported governed catalog.");
  return catalog;
}

interface NestChannelType {
  code: string;
  displayName: string;
  modes: string[];
  enabled: boolean;
  sortOrder: number;
  description: string;
}

function channelDto(row: NestChannelType) {
  return {
    code: row.code,
    display_name: row.displayName,
    is_online: row.modes.includes("ONLINE") ? 1 : 0,
    is_offline: row.modes.includes("OFFLINE") ? 1 : 0,
    modes: row.modes,
    enabled: row.enabled ? 1 : 0,
    sort_order: row.sortOrder,
    description: row.description,
  };
}
const day = (value: string | null) => (value ? value.slice(0, 10) : null);

function yearDto(year: NestYear) {
  return {
    name: year.id,
    year_name: year.name,
    start_date: day(year.startDate),
    end_date: day(year.endDate),
    is_active: year.isActive ? 1 : 0,
  };
}

function yearBody(data: Record<string, unknown>) {
  const body: Record<string, unknown> = {};
  if (typeof data.year_name === "string") body.name = data.year_name;
  if (typeof data.start_date === "string" && data.start_date) {
    body.startDate = data.start_date.slice(0, 10);
  }
  if (typeof data.end_date === "string" && data.end_date) {
    body.endDate = data.end_date.slice(0, 10);
  }
  if (data.is_active !== undefined) {
    body.isActive = data.is_active === 1 || data.is_active === true;
  }
  return body;
}

function dataOf(body: Body): Record<string, unknown> {
  const data = body?.data;
  return data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
}

export async function nestAdminCatalogRequest(
  method: string,
  params: Params,
  body: Body,
): Promise<unknown> {
  const action = method.split(".").pop() ?? "";
  const id = encodeURIComponent(String(body?.name ?? params.name ?? ""));
  const expected =
    typeof body?.expected_modified === "string"
      ? body.expected_modified
      : undefined;
  const paging = {
    search: params.search,
    start: params.start,
    page_length: params.page_length,
  };

  switch (action) {
    case "list_admission_years": {
      const page = await nestRequest<Page<NestYear>>(YEARS, {
        query: { q: params.search, pageSize: params.page_length ?? 50 },
      });
      return {
        years: page.data.map(yearDto),
        total: page.meta.pagination.total,
        start: Number(params.start ?? 0),
        page_length: Number(params.page_length ?? 50),
      };
    }
    case "create_admission_year": {
      const created = await nestRequest<{ data: NestYear }>(YEARS, {
        method: "POST",
        body: yearBody(dataOf(body)),
      });
      return yearDto(created.data);
    }
    case "update_admission_year": {
      const updated = await nestRequest<{ data: NestYear }>(`${YEARS}/${id}`, {
        method: "PATCH",
        body: yearBody(dataOf(body)),
      });
      return yearDto(updated.data);
    }
    case "delete_admission_year":
      await nestRequest(`${YEARS}/${id}`, { method: "DELETE" });
      return { deleted: decodeURIComponent(id) };

    case "list_academic_year_configs":
      return nestRequest(YEAR_CONFIGS, { query: paging });
    case "create_academic_year_config":
      return nestRequest(YEAR_CONFIGS, {
        method: "POST",
        body: { data: dataOf(body) },
      });
    case "update_academic_year_config":
      return nestRequest(`${YEAR_CONFIGS}/${id}`, {
        method: "PATCH",
        body: { data: dataOf(body), expected_modified: expected },
      });
    case "delete_academic_year_config":
      return nestRequest(`${YEAR_CONFIGS}/${id}`, {
        method: "DELETE",
        query: { expectedModified: expected },
      });

    case "list_governed_values":
      return nestRequest(
        `${GOVERNED}/${governedCatalog(params.doctype).path}`,
        {
          query: { ...paging, include_retired: params.include_retired },
        },
      );
    case "create_governed_value": {
      const catalog = governedCatalog(body?.doctype);
      const data = dataOf(body);
      return nestRequest(`${GOVERNED}/${catalog.path}`, {
        method: "POST",
        body: {
          value: data[catalog.valueField],
          lead_source: data.lead_source,
          reason: data.reason,
          idempotency_key: data.idempotency_key,
        },
      });
    }
    case "propose_governed_change":
      return nestRequest(
        `${GOVERNED}/${governedCatalog(body?.doctype).path}/changes`,
        {
          method: "POST",
          body: {
            docname: body?.docname,
            action: body?.action,
            reason: body?.reason,
            new_value: body?.new_value ?? undefined,
            expected_version: body?.expected_version ?? undefined,
          },
        },
      );
    case "list_governed_changes":
      return nestRequest(
        `${GOVERNED}/${governedCatalog(params.doctype).path}/changes`,
      );
    case "approve_governed_change":
      return nestRequest(
        `${GOVERNED}/changes/${encodeURIComponent(String(body?.change_log_name ?? ""))}/approve`,
        { method: "POST" },
      );

    case "list_admission_offerings":
      return nestRequest(OFFERINGS, {
        query: { ...paging, status: params.status },
      });
    case "create_admission_offering":
      return nestRequest(OFFERINGS, { method: "POST", body: dataOf(body) });
    case "update_admission_offering":
      return nestRequest(`${OFFERINGS}/${id}`, {
        method: "PATCH",
        body: { data: dataOf(body), expectedModified: expected },
      });
    case "transition_admission_offering":
      return nestRequest(`${OFFERINGS}/${id}/transition`, {
        method: "POST",
        body: { status: body?.status, expectedModified: expected },
      });
    case "delete_admission_offering":
      return nestRequest(`${OFFERINGS}/${id}`, {
        method: "DELETE",
        query: { expectedModified: expected },
      });
    case "list_campaign_channel_types": {
      const page = await nestRequest<{
        channelTypes: NestChannelType[];
        total: number;
      }>(CHANNEL_TYPES, {
        query: {
          search: params.search,
          start: params.start,
          pageLength: params.page_length ?? 50,
          enabledOnly: "false",
        },
      });
      return {
        channel_types: page.channelTypes.map(channelDto),
        total: page.total,
      };
    }
    case "create_campaign_channel_type":
      return channelDto(
        await nestRequest<NestChannelType>(CHANNEL_TYPES, {
          method: "POST",
          body: dataOf(body),
        }),
      );
    case "update_campaign_channel_type":
      return channelDto(
        await nestRequest<NestChannelType>(`${CHANNEL_TYPES}/${id}`, {
          method: "PATCH",
          body: dataOf(body),
        }),
      );
    case "delete_campaign_channel_type":
      await nestRequest(`${CHANNEL_TYPES}/${id}`, { method: "DELETE" });
      return { deleted: decodeURIComponent(id) };
    case "list_score_templates":
      return nestRequest(`${SCORE}/templates`, { query: paging });
    case "get_score_template":
      return nestRequest(`${SCORE}/templates/${id}`);
    case "list_score_signals":
      return nestRequest(`${SCORE}/signals`, {
        query: { ...paging, active_only: params.active_only },
      });
    case "create_score_template":
      return nestRequest(`${SCORE}/templates`, {
        method: "POST",
        body: { data: dataOf(body) },
      });
    case "update_score_template":
      return nestRequest(`${SCORE}/templates/${id}`, {
        method: "PATCH",
        body: { data: dataOf(body), expected_modified: expected },
      });
    case "delete_score_template":
      return nestRequest(`${SCORE}/templates/${id}`, {
        method: "DELETE",
        query: { expectedModified: expected },
      });

    default:
      return NOT_HANDLED;
  }
}
