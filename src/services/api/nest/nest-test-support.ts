/**
 * Test helpers that drive the domain adapters the way a service does, so
 * adapter tests assert the REST calls without going through any other layer.
 */
import { NestApiError } from "./nest-client";
import { NOT_HANDLED, type MethodHandler } from "./nest-handler";

/** Tries each adapter in order; the first one that owns the operation answers. */
export function chainHandlers(...handlers: MethodHandler[]): MethodHandler {
  return async (method, params, body) => {
    for (const handler of handlers) {
      const result = await handler(method, params, body);
      if (result !== NOT_HANDLED) return result;
    }
    throw new NestApiError(
      501,
      "FEATURE_NOT_MIGRATED",
      "Chức năng này chưa có trên máy chủ CRM.",
    );
  };
}

/** Calls an operation written as `<base>/<operation>?<query>` with a JSON body. */
export function operationCaller(...handlers: MethodHandler[]) {
  const handler = chainHandlers(...handlers);
  return (url: string, init: RequestInit = {}) => {
    const parsed = new URL(url);
    const method = parsed.pathname.split("/api/method/")[1] ?? "";
    const params = Object.fromEntries(parsed.searchParams);
    const body =
      typeof init.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : undefined;
    return handler(method, params, body);
  };
}
