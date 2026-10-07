/**
 * `crm.api.action.*`, `crm.api.action_type.*` and the timing policy list served
 * by the NestJS next-best-action catalog. Responses keep Frappe's snake_case.
 */
import { nestRequest } from "./nest-client";
import {
  NOT_HANDLED,
  type Body,
  type MethodHandler,
  type Params,
} from "./nest-method-router";

const BASE = "/api/v1/nba";

const nameOf = (params: Params, body: Body) =>
  encodeURIComponent(String(body?.name ?? params.name ?? ""));

/** The write payload without the record name that identifies it. */
const valuesOf = (body: Body) => {
  const { name: _name, ...values } = body ?? {};
  return values;
};

export const nestNbaHandler: MethodHandler = async (method, params, body) => {
  const match =
    /^crm\.api\.(action|action_type|timing_policy)\.([a-z_]+)$/.exec(method);
  if (!match) return NOT_HANDLED;
  const [, module, fn] = match;

  if (module === "timing_policy") {
    if (fn !== "list_timing_policies") return NOT_HANDLED;
    // No timing policies exist in the migrated data.
    return {
      policies: [],
      total: 0,
      start: Number(params.start ?? 0),
      page_length: Number(params.page_length ?? 20),
    };
  }

  const resource = module === "action" ? "actions" : "action-types";
  switch (fn) {
    case "list_time_slots":
      return nestRequest(`${BASE}/time-slots`);
    case "list_actions":
    case "list_action_types":
      return nestRequest(`${BASE}/${resource}`, { query: params });
    case "get_action":
    case "get_action_type":
      return nestRequest(`${BASE}/${resource}/${nameOf(params, body)}`);
    case "create_action":
    case "create_action_type":
      return nestRequest(`${BASE}/${resource}`, {
        method: "POST",
        body: valuesOf(body),
      });
    case "update_action":
    case "update_action_type":
      return nestRequest(`${BASE}/${resource}/${nameOf(params, body)}`, {
        method: "PATCH",
        body: valuesOf(body),
      });
    case "delete_action":
    case "delete_action_type":
      return nestRequest(`${BASE}/${resource}/${nameOf(params, body)}`, {
        method: "DELETE",
      });
    default:
      return NOT_HANDLED;
  }
};
