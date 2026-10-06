/**
 * Transitional transport: while the dashboard still has services written for
 * Frappe (`<FRAPPE_URL>/api/method/<method>`), this wraps `fetch` so a call
 * the Nest backend can serve is answered by Nest in Frappe's response shape.
 * Anything Nest does not handle goes to Frappe unchanged. Delete this file,
 * `nest-method-router.ts` and the services' Frappe branches together once the
 * last Frappe call-site is gone (plan phase 8).
 */
import { isNestApiEnabled, NestApiError } from "./nest-client";
import { NOT_HANDLED, nestMethodRequest } from "./nest-method-router";

const INSTALLED = "__crmLegacyMethodShim";
const METHOD_PATTERN = /\/api\/method\/([A-Za-z0-9_.]+)/;

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export function createLegacyFetch(
  original: typeof fetch,
  frappeBase: string,
): typeof fetch {
  return async (input, init) => {
    const url = urlOf(input);
    const match = METHOD_PATTERN.exec(url);
    if (!match || !frappeBase || !url.startsWith(frappeBase)) {
      return original(input, init);
    }
    const parsed = new URL(url);
    const params = Object.fromEntries(parsed.searchParams) as Record<
      string,
      string
    >;
    let body: Record<string, unknown> | undefined;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body) as Record<string, unknown>;
      } catch {
        body = undefined;
      }
    }
    try {
      const result = await nestMethodRequest(match[1]!, params, body);
      if (result === NOT_HANDLED) return original(input, init);
      return json({ message: result }, 200);
    } catch (error) {
      if (error instanceof NestApiError) {
        return json(
          { error: { code: error.code, message: error.message } },
          error.status,
        );
      }
      throw error;
    }
  };
}

export function installLegacyMethodShim(): void {
  if (typeof window === "undefined" || !isNestApiEnabled()) return;
  const flagged = window as unknown as Record<string, boolean>;
  if (flagged[INSTALLED]) return;
  flagged[INSTALLED] = true;
  const base = (process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(/\/+$/, "");
  window.fetch = createLegacyFetch(window.fetch.bind(window), base);
}
