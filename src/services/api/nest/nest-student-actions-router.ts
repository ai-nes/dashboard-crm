/**
 * The student action worklist (`list_actions_for_record`, `transition_action`,
 * `complete_action_manually`) served by the NestJS student actions module.
 */
import { nestRequest } from "./nest-client";
import { NOT_HANDLED, type MethodHandler } from "./nest-method-router";

const id = (value: unknown) => encodeURIComponent(String(value ?? ""));

export const nestStudentActionsHandler: MethodHandler = async (
  method,
  params,
  body,
) => {
  switch (method) {
    case "crm.api.student_worklist.list_actions_for_record":
      if (params.doctype && params.doctype !== "CRM Student") {
        return NOT_HANDLED;
      }
      return nestRequest(`/api/v1/students/${id(params.name)}/actions`, {
        query: { page_size: params.page_size },
      });
    case "crm.api.student_decision.transition_action":
      return nestRequest(
        `/api/v1/student-actions/${id(body?.name)}/transition`,
        {
          method: "POST",
          body: { status: body?.status },
        },
      );
    case "crm.api.action_workbench.complete_action_manually":
      return nestRequest(
        `/api/v1/student-actions/${id(body?.action)}/complete`,
        {
          method: "POST",
          body: {
            outcome_code: body?.outcome_code,
            outcome_evidence: body?.outcome_evidence,
            outcome_notes: body?.outcome_notes,
          },
        },
      );
    default:
      return NOT_HANDLED;
  }
};
