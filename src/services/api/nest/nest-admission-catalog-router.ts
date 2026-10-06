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

const PROFILE = "/api/v1/admission-profile";

/** Application commands (`crm.api.admission_application.*`). */
async function applicationCommand(action: string, body: Body) {
  const application = encodeURIComponent(String(body?.application ?? ""));
  switch (action) {
    case "create_application":
      return nestRequest(`${PROFILE}/applications`, {
        method: "POST",
        body: {
          student: body?.student,
          values: body?.values,
          expectedRevision: body?.expected_revision,
          idempotencyKey: body?.idempotency_key,
        },
      });
    case "update_application":
      return nestRequest(`${PROFILE}/applications/${application}`, {
        method: "PUT",
        body: { values: body?.values },
      });
    case "update_preference":
      return nestRequest(`${PROFILE}/applications/${application}/preference`, {
        method: "PUT",
        body: { preference: body?.preference },
      });
    default:
      return NOT_HANDLED;
  }
}

/** Upload a profile document (`crm.api.student_documents.upload_document`). */
export function uploadProfileDocument(form: FormData): Promise<unknown> {
  return nestRequest(`${PROFILE}/documents`, { method: "POST", body: form });
}

export async function nestAdmissionCatalogHandler(
  method: string,
  params: Params,
  body: Body,
): Promise<unknown> {
  const parts = method.split(".");
  const moduleName = parts[parts.length - 2];
  const action = parts[parts.length - 1] ?? "";
  if (moduleName === "admission_application") {
    return applicationCommand(action, body);
  }
  if (!MODULES.includes(moduleName as (typeof MODULES)[number])) {
    return NOT_HANDLED;
  }
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
