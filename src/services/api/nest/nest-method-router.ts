/**
 * Maps the Frappe method calls (`crm.api.<module>.<function>`) that dashboard
 * services still make onto NestJS endpoints. A handler returns `NOT_HANDLED`
 * for a method it does not serve, so the call keeps its Frappe route. Add one
 * handler per backend domain; the shim in `legacy-method-shim.ts` calls this.
 */
import { nestGetCurrentUser } from "./nest-auth";
import { nestMajorCatalogHandler } from "./nest-catalog-router";
import {
  NOT_HANDLED,
  nestAdminCatalogRequest,
} from "./nest-admin-catalog-router";
import { nestUserManagementHandler } from "./nest-user-management-router";
import { nestAdmissionCatalogHandler } from "./nest-admission-catalog-router";

export { NOT_HANDLED };

export type Params = Record<string, string | undefined>;
export type Body = Record<string, unknown> | undefined;
export type MethodHandler = (
  method: string,
  params: Params,
  body: Body,
) => Promise<unknown>;

/** `session.me` is answered by the signed-in Nest session, not Frappe. */
const sessionHandler: MethodHandler = async (method) => {
  if (!method.endsWith(".session.me")) return NOT_HANDLED;
  const user = await nestGetCurrentUser();
  return user ? { ...user, csrf_token: null } : NOT_HANDLED;
};

const HANDLERS: MethodHandler[] = [
  sessionHandler,
  nestAdminCatalogRequest,
  nestMajorCatalogHandler,
  nestUserManagementHandler,
  nestAdmissionCatalogHandler,
];

/** Register another domain handler (kept in order; first match wins). */
export function registerMethodHandler(handler: MethodHandler): void {
  HANDLERS.push(handler);
}

export async function nestMethodRequest(
  method: string,
  params: Params,
  body: Body,
): Promise<unknown> {
  for (const handler of HANDLERS) {
    const result = await handler(method, params, body);
    if (result !== NOT_HANDLED) return result;
  }
  return NOT_HANDLED;
}
