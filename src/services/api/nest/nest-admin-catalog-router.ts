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
      // Not ported; the table is empty in production.
      return { configs: [], total: 0 };

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
    default:
      return NOT_HANDLED;
  }
}
