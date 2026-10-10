/**
 * `crm.api.major_catalog.*` served by the NestJS major catalog. Responses are
 * already in the shape the dashboard's catalog types expect.
 */
import { nestRequest } from "./nest-client";
import {
  NOT_HANDLED,
  type Body,
  type MethodHandler,
  type Params,
} from "./nest-handler";

const BASE = "/api/v1/major-catalog";

const camel = (params: Params): Record<string, string | undefined> => ({
  search: params.search,
  group: params.group,
  enabled: params.enabled,
  isActive: params.is_active,
  includeDisabled: params.include_disabled,
  includeInactive: params.include_inactive,
  start: params.start,
  pageLength: params.page_length,
});

const dataOf = (body: Body) => (body?.data as Body) ?? {};
const expectedOf = (body: Body) =>
  typeof body?.expected_modified === "string"
    ? body.expected_modified
    : undefined;
const nameOf = (body: Body) => encodeURIComponent(String(body?.name ?? ""));

export const nestMajorCatalogHandler: MethodHandler = async (
  method,
  params,
  body,
) => {
  const match = /^crm\.api\.major_catalog\.([a-z_]+)$/.exec(method);
  if (!match) return NOT_HANDLED;
  switch (match[1]) {
    case "list_major_groups":
      return nestRequest(`${BASE}/groups`, { query: camel(params) });
    case "create_major_group":
      return nestRequest(`${BASE}/groups`, {
        method: "POST",
        body: dataOf(body),
      });
    case "update_major_group":
      return nestRequest(`${BASE}/groups/${nameOf(body)}`, {
        method: "PATCH",
        body: { data: dataOf(body), expectedModified: expectedOf(body) },
      });
    case "delete_major_group":
      return nestRequest(`${BASE}/groups/${nameOf(body)}`, {
        method: "DELETE",
        query: { expectedModified: expectedOf(body) },
      });
    case "list_majors":
      return nestRequest(`${BASE}/majors`, { query: camel(params) });
    case "create_major":
      return nestRequest(`${BASE}/majors`, {
        method: "POST",
        body: dataOf(body),
      });
    case "update_major":
      return nestRequest(`${BASE}/majors/${nameOf(body)}`, {
        method: "PATCH",
        body: { data: dataOf(body), expectedModified: expectedOf(body) },
      });
    case "delete_major":
      return nestRequest(`${BASE}/majors/${nameOf(body)}`, {
        method: "DELETE",
        query: { expectedModified: expectedOf(body) },
      });
    default:
      return NOT_HANDLED;
  }
};
