/**
 * Admission catalog calls (`crm.api.admission_catalog.*` and
 * `crm.api.admission_profile_templates.*`) served by the NestJS API. The Nest
 * payloads keep the shapes Frappe returned, so results pass straight through.
 */
import { nestRequest } from "./nest-client";
import { NOT_HANDLED } from "./nest-admin-catalog-router";

type Params = Record<string, string | undefined>;
type Body = Record<string, unknown> | undefined;

const BASE = "/api/v1/admission-catalog";

const MODULES = ["admission_catalog", "admission_profile_templates"] as const;

/** Frappe action -> Nest resource. */
const RESOURCES: Record<string, string> = {
  admission_document_type: "document-types",
  admission_document_types: "document-types",
  admission_method: "methods",
  admission_methods: "methods",
  admission_profile_template: "profile-templates",
  admission_profile_templates: "profile-templates",
};

export async function nestAdmissionCatalogHandler(
  method: string,
  params: Params,
  body: Body,
): Promise<unknown> {
  const parts = method.split(".");
  if (!MODULES.includes(parts[parts.length - 2] as (typeof MODULES)[number])) {
    return NOT_HANDLED;
  }
  const action = parts[parts.length - 1] ?? "";
  if (action === "get_admission_profile_catalog") {
    return nestRequest(`${BASE}/profile-catalog`, { query: params });
  }
  const match = /^(list|create|update|delete|transition)_(.+)$/.exec(action);
  const resource = match ? RESOURCES[match[2]] : undefined;
  if (!match || !resource) return NOT_HANDLED;

  const verb = match[1];
  const id = encodeURIComponent(String(body?.name ?? ""));
  const expectedModified =
    typeof body?.expected_modified === "string"
      ? body.expected_modified
      : undefined;
  switch (verb) {
    case "list":
      return nestRequest(`${BASE}/${resource}`, { query: params });
    case "create":
      return nestRequest(`${BASE}/${resource}`, {
        method: "POST",
        body: { data: body?.data },
      });
    case "update":
      return nestRequest(`${BASE}/${resource}/${id}`, {
        method: "PATCH",
        body: { data: body?.data, expectedModified },
      });
    case "transition":
      return nestRequest(`${BASE}/${resource}/${id}/transition`, {
        method: "POST",
        body: { status: body?.status, expectedModified },
      });
    default:
      return nestRequest(`${BASE}/${resource}/${id}`, {
        method: "DELETE",
        query: { expectedModified },
      });
  }
}
