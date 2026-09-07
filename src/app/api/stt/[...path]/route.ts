import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const CALL_UUID_PATTERN = /^\d+\.\d+$/;
const STT_BASE_URL = "https://stt.faip.pro";

function json(data: unknown, status: number): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getConfiguredBaseUrl(): URL | null {
  const raw = (process.env.STT_BASE_URL ?? STT_BASE_URL).trim();
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function isProxyEnabled(): boolean {
  const configured = process.env.STT_PROXY_ENABLED?.trim().toLowerCase();
  if (configured) return configured === "true";

  // This bridge is intentionally opt-in for production until the dashboard's
  // cross-origin Frappe session can be enforced at this server boundary.
  return process.env.NODE_ENV !== "production";
}

function resolvePath(path: string[]): { endpoint: string; callUuid?: string } | null {
  if (path.length === 1 && path[0] === "health") {
    return { endpoint: "health" };
  }

  if (
    path.length === 2 &&
    (path[0] === "transcribe" || path[0] === "summarize" || path[0] === "status")
  ) {
    const callUuid = path[1];
    return CALL_UUID_PATTERN.test(callUuid) ? { endpoint: path[0], callUuid } : null;
  }

  return null;
}

async function forward(
  context: RouteContext,
  method: "GET" | "POST",
): Promise<NextResponse> {
  const { path = [] } = await context.params;
  const resolved = resolvePath(path);
  if (!resolved) return json({ error: "STT endpoint not found" }, 404);

  if (resolved.endpoint !== "health" && !isProxyEnabled()) {
    return json({ error: "STT proxy is disabled" }, 404);
  }

  if (resolved.endpoint === "health" && method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (resolved.endpoint === "status" && method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (resolved.endpoint === "transcribe" && method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (resolved.endpoint === "summarize" && method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const baseUrl = getConfiguredBaseUrl();
  if (!baseUrl) return json({ error: "STT_BASE_URL is invalid" }, 503);

  const secret = process.env.STT_API_SECRET?.trim();
  if (resolved.endpoint !== "health" && !secret) {
    return json({ error: "STT_API_SECRET is not configured" }, 503);
  }

  const target = new URL(baseUrl.toString());
  target.pathname = [
    baseUrl.pathname.replace(/\/+$/, ""),
    resolved.endpoint,
    resolved.callUuid,
  ]
    .filter(Boolean)
    .join("/");
  if (secret && resolved.endpoint !== "health") target.searchParams.set("secret", secret);

  try {
    const upstream = await fetch(target, {
      method,
      headers: { Accept: "application/json, text/plain" },
      cache: "no-store",
      redirect: "error",
    });
    const headers = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch {
    return json({ error: "Không kết nối được STT Bridge." }, 502);
  }
}

export function GET(_request: NextRequest, context: RouteContext) {
  return forward(context, "GET");
}

export function POST(_request: NextRequest, context: RouteContext) {
  return forward(context, "POST");
}
