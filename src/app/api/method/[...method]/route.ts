import { NextRequest, NextResponse } from "next/server";

import { computeDirectorOverview } from "@/services/api/director-overview";
import type { TrendRange } from "@/services/api/director-overview/types";
import { computeDirectorStudents, computeStudent360 } from "@/services/api/students";
import type { DirectorStudentsParams } from "@/services/api/students/types";

type RouteContext = {
  params: Promise<{ method?: string[] }>;
};

const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);

function numberParam(request: NextRequest, name: string, fallback: number, max: number) {
  const value = Number(request.nextUrl.searchParams.get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), 1), max);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { method = [] } = await context.params;
  const methodName = method.join(".");

  if (methodName === "crm.api.director_dashboard.get_director_overview") {
    const admissionYear = numberParam(request, "admissionYear", 2026, 3000);
    const scope = request.nextUrl.searchParams.get("scope") ?? "all";
    const trendRangeParam = request.nextUrl.searchParams.get("trendRange");
    const trendRange: TrendRange =
      trendRangeParam === "7d" || trendRangeParam === "30d" || trendRangeParam === "year"
        ? trendRangeParam
        : "30d";

    const result = computeDirectorOverview({
      admissionYear,
      scope,
      trendRange,
    });

    return json({
      message: result,
      ...result,
    });
  }

  if (methodName === "crm.api.director_students.get_director_students") {
    const admissionYear = numberParam(request, "admissionYear", 2026, 3000);
    const page = numberParam(request, "page", 1, 10000);
    const pageSize = numberParam(request, "pageSize", 20, 100);
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const stage = request.nextUrl.searchParams.get("stage") ?? undefined;
    const province = request.nextUrl.searchParams.get("province") ?? undefined;
    const sort = request.nextUrl.searchParams.get("sort") ?? undefined;
    const order = (request.nextUrl.searchParams.get("order") as "asc" | "desc") ?? undefined;

    const params: DirectorStudentsParams = {
      admissionYear,
      page,
      pageSize,
      q,
      stage,
      province,
      sort,
      order,
    };

    const result = computeDirectorStudents(params);
    return json({
      message: result,
      ...result,
    });
  }

  if (methodName === "crm.api.director_students.get_director_student") {
    const studentId =
      request.nextUrl.searchParams.get("student_id") ||
      request.nextUrl.searchParams.get("studentId") ||
      "";

    if (!studentId.trim()) {
      return json(
        { error: { code: "INVALID_STUDENT_ID", message: "Thiếu tham số student_id." } },
        { status: 400 },
      );
    }

    const data = computeStudent360(studentId.trim());
    if (!data) {
      return json(
        { error: { code: "STUDENT_NOT_FOUND", message: "Không tìm thấy hồ sơ học sinh." } },
        { status: 404 },
      );
    }

    return json({
      message: data,
      ...data,
    });
  }

  return json(
    { error: { code: "METHOD_NOT_FOUND", message: `Method '${methodName}' không tồn tại.` } },
    { status: 404 },
  );
}
