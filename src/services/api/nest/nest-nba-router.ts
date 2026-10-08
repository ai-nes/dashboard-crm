/**
 * `crm.api.action.*`, `crm.api.action_type.*` and the recommendation queues served
 * by the NestJS next-best-action catalog. Responses keep Frappe's snake_case.
 */
import { nestRequest } from "./nest-client";
import {
  NOT_HANDLED,
  type Body,
  type MethodHandler,
  type Params,
} from "./nest-handler";

const BASE = "/api/v1/nba";

const nameOf = (params: Params, body: Body) =>
  encodeURIComponent(String(body?.name ?? params.name ?? ""));

/** The write payload without the record name that identifies it. */
const valuesOf = (body: Body) => {
  const { name: _name, ...values } = body ?? {};
  return values;
};

/** The recommendation queues and decisions, backed by the cards crm-ai writes. */
const nestQueueHandler: MethodHandler = async (method, params, body) => {
  switch (method) {
    case "crm.api.student_worklist.list_student_worklist":
      return nestRequest(`${BASE}/worklist`, { query: params });
    case "crm.api.director_next_best_action.get_director_recommendations":
      return nestRequest(`${BASE}/director-recommendations`, { query: params });
    case "crm.api.student_decision.decide_recommendation":
      return nestRequest(`${BASE}/decisions`, { method: "POST", body });
    case "crm.api.copilot_delegation.run_student_nba_evaluation":
      return nestRequest(`${BASE}/evaluations`, { method: "POST", body });
    default:
      return NOT_HANDLED;
  }
};

export const nestNbaHandler: MethodHandler = async (method, params, body) => {
  const queued = await nestQueueHandler(method, params, body);
  if (queued !== NOT_HANDLED) return queued;
  const match = /^crm\.api\.(action|action_type)\.([a-z_]+)$/.exec(method);
  if (!match) return NOT_HANDLED;
  const [, module, fn] = match;

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
