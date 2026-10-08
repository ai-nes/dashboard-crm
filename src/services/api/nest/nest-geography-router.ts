/**
 * `crm.api.geography_catalog.*` served by the NestJS geography catalog.
 * Responses are already in the shape the reference catalog types expect.
 */
import { nestRequest } from "./nest-client";
import {
  NOT_HANDLED,
  type Body,
  type MethodHandler,
} from "./nest-handler";

const BASE = "/api/v1/geography-catalog";

const RESOURCES: Record<string, string> = {
  province: "provinces",
  ward: "wards",
  high_school: "high-schools",
  school_area: "school-areas",
};

const dataOf = (body: Body) => body?.data ?? {};
const nameOf = (body: Body) => encodeURIComponent(String(body?.name ?? ""));
const expectedOf = (body: Body) =>
  typeof body?.expected_modified === "string"
    ? body.expected_modified
    : undefined;

export const nestGeographyHandler: MethodHandler = async (
  method,
  params,
  body,
) => {
  const match = /^crm\.api\.geography_catalog\.([a-z_]+)$/.exec(method);
  if (!match) return NOT_HANDLED;
  const action = match[1]!;

  if (action === "list_geography_options") {
    return nestRequest(`${BASE}/options`, {
      query: { province: params.province },
    });
  }
  const list = /^list_(provinces|wards|high_schools|school_areas)$/.exec(
    action,
  );
  if (list) {
    return nestRequest(`${BASE}/${list[1]!.replace("_", "-")}`, {
      query: params,
    });
  }
  const write =
    /^(create|update|delete)_(province|ward|high_school|school_area)$/.exec(
      action,
    );
  if (!write) return NOT_HANDLED;
  const resource = RESOURCES[write[2]!]!;
  switch (write[1]) {
    case "create":
      return nestRequest(`${BASE}/${resource}`, {
        method: "POST",
        body: { data: dataOf(body) },
      });
    case "update":
      return nestRequest(`${BASE}/${resource}/${nameOf(body)}`, {
        method: "PATCH",
        body: { data: dataOf(body) },
        query: { expectedModified: expectedOf(body) },
      });
    default:
      return nestRequest(`${BASE}/${resource}/${nameOf(body)}`, {
        method: "DELETE",
      });
  }
};
