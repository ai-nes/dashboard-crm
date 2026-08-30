import { NextRequest, NextResponse } from "next/server";

import {
  getAiAgentsData,
  getAiCostAnalyticsData,
  getAiProviderDistributionData,
  getRecentActivitiesData as getAiRecentActivitiesData,
  getTopUsageData,
  getWeeklyAiActivityData,
} from "@/services/api/ai";
import {
  getTopChannelsData,
  getTopContentData,
  getTopCountriesData,
  getUsedDevicesData,
  getVisitorsAnalyticsData,
} from "@/services/api/analytics";
import { getCampaignIntelligence } from "@/services/api/campaign-intelligence";
import {
  getLeadGrowthData,
  getLeadsReportData,
  getRecentActivitiesData as getCrmRecentActivitiesData,
  getUpcomingTasksData,
} from "@/services/api/crm";
import {
  getHomeOverviewStats,
  getInventoryOverviewData,
  getLastTransactionsData,
  getSalesChartData,
  getTopProductsData,
  getTrafficSourcesData,
} from "@/services/api/home";
import {
  getAudienceInsightsData,
  getCampaignVisitorsData,
  getChannelPerformanceData,
  getConversionFunnelData,
  getMarketingOverviewStats,
  getRecentActivitiesData as getMarketingRecentActivitiesData,
} from "@/services/api/marketing";
import {
  getCustomerGrowthData,
  getPlanMixData,
  getRecentActivitiesData as getSaasRecentActivitiesData,
  getRecentSignupsData,
  getRevenueOverviewData,
} from "@/services/api/saas";
import {
  getExchangeStockData,
  getLastStockTransactionsData,
  getMarketNewsData,
  getMarketOverviewData,
  getPortfolioPerformanceData,
  getWatchlistData,
} from "@/services/api/stocks";
import { computeDirectorStudents, getStudent360 } from "@/services/api/students";
import { studentListData } from "@/services/api/students/data";
import { getSchoolById, getSchoolReport, getSchoolDirectory, searchSchools } from "@/services/api/schools/school-directory";
import {
  computeDirectorDemographicsOverview,
  computeDirectorDemographicsSegment,
} from "@/services/api/demographics";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);

function enumParam<T extends string>(
  request: NextRequest,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = request.nextUrl.searchParams.get(name);
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function numberParam(request: NextRequest, name: string, fallback: number, max: number) {
  const value = Number(request.nextUrl.searchParams.get(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), 1), max);
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLocaleLowerCase("vi-VN");
}

async function getDashboardResponse(request: NextRequest, resource: string[]) {
  const key = resource.join("/");
  const granularity = enumParam(request, "granularity", ["monthly", "yearly"] as const, "monthly");
  const period = enumParam(request, "period", ["7d", "30d", "90d"] as const, "7d");

  switch (key) {
    case "ai/cost-analytics":
      return getAiCostAnalyticsData(granularity);
    case "ai/weekly-activity":
      return getWeeklyAiActivityData();
    case "ai/top-usage":
      return getTopUsageData();
    case "ai/agents":
      return getAiAgentsData();
    case "ai/recent-activities":
      return getAiRecentActivitiesData();
    case "ai/provider-distribution":
      return getAiProviderDistributionData();
    case "analytics/visitors":
      return getVisitorsAnalyticsData(enumParam(request, "granularity", ["weekly", "monthly"] as const, "monthly"));
    case "analytics/used-devices":
      return getUsedDevicesData();
    case "analytics/top-countries":
      return getTopCountriesData();
    case "analytics/top-content":
      return getTopContentData();
    case "analytics/top-channels":
      return getTopChannelsData();
    case "campaign-intelligence":
      return getCampaignIntelligence();
    case "crm/lead-growth":
      return getLeadGrowthData(enumParam(request, "granularity", ["7d", "30d", "90d"] as const, "7d"));
    case "crm/leads-report":
      return getLeadsReportData();
    case "crm/upcoming-tasks":
      return getUpcomingTasksData();
    case "crm/recent-activities":
      return getCrmRecentActivitiesData();
    case "home/overview-stats":
      return getHomeOverviewStats();
    case "home/sales-chart":
      return getSalesChartData(granularity);
    case "home/inventory-overview":
      return getInventoryOverviewData();
    case "home/top-products":
      return getTopProductsData();
    case "home/traffic-sources":
      return getTrafficSourcesData();
    case "home/last-transactions":
      return getLastTransactionsData();
    case "marketing/overview-stats":
      return getMarketingOverviewStats(period);
    case "marketing/campaign-visitors":
      return getCampaignVisitorsData(period);
    case "marketing/audience-insights":
      return getAudienceInsightsData();
    case "marketing/conversion-funnel":
      return getConversionFunnelData();
    case "marketing/channel-performance":
      return getChannelPerformanceData();
    case "marketing/recent-activities":
      return getMarketingRecentActivitiesData();
    case "saas/revenue-overview":
      return getRevenueOverviewData(granularity);
    case "saas/customer-growth":
      return getCustomerGrowthData(granularity);
    case "saas/plan-mix":
      return getPlanMixData();
    case "saas/recent-signups":
      return getRecentSignupsData();
    case "saas/recent-activities":
      return getSaasRecentActivitiesData();
    case "stocks/portfolio-performance":
      return getPortfolioPerformanceData(enumParam(request, "range", ["1W", "1M", "3M", "1Y", "All"] as const, "1M"));
    case "stocks/watchlist":
      return getWatchlistData();
    case "stocks/exchange":
      return getExchangeStockData();
    case "stocks/market-overview":
      return getMarketOverviewData();
    case "stocks/last-transactions":
      return getLastStockTransactionsData();
    case "stocks/market-news":
      return getMarketNewsData();
    default:
      return null;
  }
}

async function getStudentResponse(request: NextRequest, resource: string[]) {
  const [, identifier] = resource;
  const query = normalizeSearchValue(request.nextUrl.searchParams.get("q")?.trim() ?? "");

  if (!identifier) {
    const admissionYear = numberParam(request, "admissionYear", 2026, 3000);
    const page = numberParam(request, "page", 1, 10000);
    const pageSize = numberParam(request, "pageSize", 20, 100);
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const stage = request.nextUrl.searchParams.get("stage") ?? undefined;
    const province = request.nextUrl.searchParams.get("province") ?? undefined;
    const sort = request.nextUrl.searchParams.get("sort") ?? undefined;
    const order = (request.nextUrl.searchParams.get("order") as "asc" | "desc") ?? undefined;

    return json(
      computeDirectorStudents({
        admissionYear,
        page,
        pageSize,
        q,
        stage,
        province,
        sort,
        order,
      }),
    );
  }

  if (identifier === "suggestions") {
    const limit = numberParam(request, "limit", 8, 20);
    const data = studentListData
      .filter((student) =>
        !query || normalizeSearchValue(
          [student.name, student.code, student.school, student.province, student.major].join(" "),
        ).includes(query),
      )
      .slice(0, limit);
    return json({ data, meta: { total: data.length, query } });
  }

  const data = await getStudent360(identifier);
  return data ? json(data) : json({ error: { code: "STUDENT_NOT_FOUND", message: "Không tìm thấy hồ sơ học sinh." } }, { status: 404 });
}

async function getSchoolResponse(request: NextRequest, resource: string[]) {
  const [, identifier] = resource;
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!identifier) {
    const limit = numberParam(request, "limit", 50, 100);
    const data = query ? await searchSchools(query) : (await getSchoolDirectory()).slice(0, limit);
    return json({ data: data.slice(0, limit), meta: { total: data.length, query: query ?? "" } });
  }

  if (identifier === "suggestions") {
    const data = (await searchSchools(query)).slice(0, numberParam(request, "limit", 8, 20));
    return json({ data, meta: { total: data.length, query: query ?? "" } });
  }

  if (identifier === "report") return json(await getSchoolReport());

  const data = await getSchoolById(identifier);
  return data ? json(data) : json({ error: { code: "SCHOOL_NOT_FOUND", message: "Không tìm thấy trường trong danh mục." } }, { status: 404 });
}

async function getDemographicsResponse(request: NextRequest, resource: string[]) {
  const [, identifier] = resource;
  const admissionYear = numberParam(request, "admissionYear", 2026, 3000);

  if (!identifier || identifier === "overview") {
    const period = request.nextUrl.searchParams.get("period") ?? "6m";
    const scope = request.nextUrl.searchParams.get("scope") ?? "all";
    return json(
      computeDirectorDemographicsOverview({
        admissionYear,
        period,
        scope,
      }),
    );
  }

  const segmentId = request.nextUrl.searchParams.get("segment_id") || (identifier !== "segments" && identifier !== "segment" ? identifier : null);
  if (segmentId) {
    const data = computeDirectorDemographicsSegment({
      segment_id: segmentId,
      admissionYear,
    });
    return data
      ? json(data)
      : json(
          {
            error: {
              code: "SEGMENT_NOT_FOUND",
              message: "Không tìm thấy phân khúc hoặc phân khúc không đủ dữ liệu để hiển thị.",
            },
          },
          { status: 404 },
        );
  }

  return json(
    computeDirectorDemographicsOverview({
      admissionYear,
    }),
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { resource = [] } = await context.params;
  const [domain] = resource;

  if (domain === "students") return getStudentResponse(request, resource);
  if (domain === "schools") return getSchoolResponse(request, resource);
  if (domain === "demographics") return getDemographicsResponse(request, resource);

  const data = await getDashboardResponse(request, resource);
  return data === null
    ? json({ error: { code: "MOCK_ENDPOINT_NOT_FOUND", message: "Mock endpoint không tồn tại." } }, { status: 404 })
    : json(data);
}
