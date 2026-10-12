import {
  buildUrl,
  errorFrom,
  NestApiError,
  type NestRequestOptions,
} from "./nest-client";

export async function nestDownload(
  path: string,
  options: NestRequestOptions = {},
): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      credentials: "include",
      cache: "no-store",
      signal: options.signal,
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    if (error instanceof NestApiError) throw error;
    throw new NestApiError(
      503,
      "API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ CRM.",
    );
  }
  if (!response.ok)
    throw errorFrom(response.status, await response.json().catch(() => null));
  if (!response.headers.get("content-type")?.includes("spreadsheetml.sheet"))
    throw new NestApiError(
      502,
      "INVALID_EXPORT_RESPONSE",
      "Máy chủ chưa trả về file Excel hợp lệ.",
    );
  return response.blob();
}
