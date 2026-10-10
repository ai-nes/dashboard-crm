/** Form dropdown options and the high school directory from the Nest API. */
import { nestRequest } from "./nest-client";

export interface NestFieldOption {
  value: string;
  label: string;
}

interface NestSchool {
  id: string;
  schoolCode: string;
  schoolName: string;
  province: string;
  ward: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  schoolTier: string | null;
}

export async function nestFieldOptions(params: {
  doctype: "CRM Lead" | "CRM Student" | "CRM High School";
  fieldname: string;
  search?: string;
  province?: string;
  filters?: Record<string, unknown>;
  limit?: number;
}, signal?: AbortSignal) {
  const filters = params.filters ?? {};
  const text = (value: unknown) =>
    typeof value === "string" && value ? value : undefined;
  const result = await nestRequest<{
    fieldtype: "Link" | "Select";
    options: NestFieldOption[];
  }>(`/api/v1/options/${encodeURIComponent(params.fieldname)}`, {
    signal,
    query: {
      search: params.search,
      limit: params.limit,
      province: params.province ?? text(filters.province),
      ward: text(filters.ward),
    },
  });
  return {
    doctype: params.doctype,
    fieldname: params.fieldname,
    fieldtype: result.fieldtype,
    target_doctype: result.fieldtype === "Link" ? params.fieldname : null,
    options: result.options,
  };
}

export async function nestSchools(params: {
  province?: string;
  ward?: string;
  search?: string;
  limit?: number;
}, signal?: AbortSignal) {
  const result = await nestRequest<{ schools: NestSchool[] }>(
    "/api/v1/schools",
    {
      query: params,
      signal,
    },
  );
  return {
    doctype: "CRM High School" as const,
    filters: Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    ),
    schools: result.schools.map((school) => ({
      name: school.id,
      fields: {
        school_name: school.schoolName,
        school_code: school.schoolCode,
        province: school.province,
        ward: school.ward,
        address: school.address,
        phone: school.phone,
        email: school.email,
        school_tier: school.schoolTier,
      },
    })),
  };
}
