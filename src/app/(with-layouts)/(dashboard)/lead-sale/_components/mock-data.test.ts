import { describe, expect, it } from "vitest";

import {
  DEFAULT_LEAD_SALE_FILTERS,
  MOCK_LEAD_SALE_DASHBOARD,
  getLeadSaleDashboardData,
} from "./mock-data";

describe("Lead Sale dashboard mock snapshot", () => {
  it("keeps the team and rep target math consistent", () => {
    const { reps, summary } = MOCK_LEAD_SALE_DASHBOARD;

    expect(reps.reduce((sum, rep) => sum + rep.target, 0)).toBe(summary.target);
    expect(reps.reduce((sum, rep) => sum + rep.enrollment, 0)).toBe(summary.enrollment);
    expect(reps.reduce((sum, rep) => sum + rep.remaining, 0)).toBe(summary.remaining);
    expect(reps.reduce((sum, rep) => sum + rep.expected, 0)).toBe(summary.expected);
    expect(reps.reduce((sum, rep) => sum + rep.openOpportunities, 0)).toBe(summary.openOpportunities);
    expect(reps.reduce((sum, rep) => sum + rep.overdue, 0)).toBe(summary.overdue);
    expect(reps.reduce((sum, rep) => sum + rep.agingOverSlaCount, 0)).toBe(summary.agingOverSla);
  });

  it("gives every rep a Sales-specific drill-down", () => {
    for (const rep of MOCK_LEAD_SALE_DASHBOARD.reps) {
      const detail = MOCK_LEAD_SALE_DASHBOARD.details[rep.detailId];

      expect(detail.id).toBe(rep.detailId);
      expect(detail.records.some((record) => record.owner === rep.name)).toBe(true);
    }
  });

  it("keeps aggregate detail rows separate from record rows", () => {
    expect(MOCK_LEAD_SALE_DASHBOARD.details.enrollment.kind).toBe("sales-breakdown");
    expect(MOCK_LEAD_SALE_DASHBOARD.details.enrollment.records).toHaveLength(0);
    expect(MOCK_LEAD_SALE_DASHBOARD.details.forecast.kind).toBe("stage-breakdown");
    expect(MOCK_LEAD_SALE_DASHBOARD.details.forecast.records).toHaveLength(0);
  });

  it("applies one scope to all major dashboard sections", () => {
    const scoped = getLeadSaleDashboardData({
      ...DEFAULT_LEAD_SALE_FILTERS,
      program: "technology",
    });

    expect(scoped.activeFilters.program).toBe("technology");
    expect(scoped.summary.target).toBeLessThan(MOCK_LEAD_SALE_DASHBOARD.summary.target);
    expect(scoped.trend.at(-1)?.enrollment).toBe(scoped.summary.enrollment);
    expect(scoped.trend.at(-1)?.target).toBe(scoped.summary.target);
    expect(scoped.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(scoped.summary.openOpportunities);
    expect(scoped.stages.find((stage) => stage.id === "enrollment")?.volume).toBe(scoped.summary.enrollment);
  });

  it("scopes funnel, aging, actions and details to one Sales owner", () => {
    const scoped = getLeadSaleDashboardData({
      ...DEFAULT_LEAD_SALE_FILTERS,
      sales: "a",
    });
    const rep = scoped.reps[0];

    expect(scoped.reps).toHaveLength(1);
    expect(scoped.summary.openOpportunities).toBe(rep.openOpportunities);
    expect(scoped.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(rep.openOpportunities);
    expect(scoped.stages.find((stage) => stage.id === "enrollment")?.volume).toBe(scoped.summary.enrollment);
    expect(scoped.summary.newOpportunities).toBe(rep.pipeline.newOpportunities);
    expect(scoped.summary.followUpDue).toBe(rep.pipeline.followUpDue);
    expect(scoped.actions.find((action) => action.id === "unassigned")?.value).toBe(0);
    expect(scoped.details.enrollment.breakdown?.map((row) => row.label)).toEqual([rep.name]);
    expect(scoped.details.overdue.breakdown?.map((row) => row.label)).toEqual(
      scoped.reps.filter((item) => item.overdue > 0).map((item) => item.name),
    );
    expect(Object.values(scoped.details).every((detail) => detail.records.every((record) => record.owner === rep.name))).toBe(true);
  });

  it("keeps Sales scope consistent when combined with another filter", () => {
    const scoped = getLeadSaleDashboardData({
      ...DEFAULT_LEAD_SALE_FILTERS,
      sales: "d",
      program: "technology",
    });

    expect(scoped.reps).toHaveLength(1);
    expect(scoped.summary.target).toBeLessThan(MOCK_LEAD_SALE_DASHBOARD.summary.target);
    expect(scoped.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(scoped.summary.openOpportunities);
    expect(scoped.stages.find((stage) => stage.id === "enrollment")?.volume).toBe(scoped.summary.enrollment);
    expect(scoped.trend.at(-1)?.newOpportunities).toBe(scoped.summary.newOpportunities);
  });

  it("keeps priority queue and full trend history inside Sales scope", () => {
    const salesScoped = getLeadSaleDashboardData({
      ...DEFAULT_LEAD_SALE_FILTERS,
      sales: "a",
    });
    const teamScoped = getLeadSaleDashboardData(DEFAULT_LEAD_SALE_FILTERS);

    expect(salesScoped.priorityQueue).toHaveLength(0);
    expect(salesScoped.trend).toEqual(MOCK_LEAD_SALE_DASHBOARD.reps[0].pipeline.trend);

    teamScoped.trend.forEach((point, index) => {
      const expected = MOCK_LEAD_SALE_DASHBOARD.reps.reduce(
        (totals, rep) => ({
          enrollment: totals.enrollment + rep.pipeline.trend[index].enrollment,
          target: totals.target + rep.pipeline.trend[index].target,
          newOpportunities: totals.newOpportunities + rep.pipeline.trend[index].newOpportunities,
        }),
        { enrollment: 0, target: 0, newOpportunities: 0 },
      );

      expect(point.enrollment).toBe(expected.enrollment);
      expect(point.target).toBe(expected.target);
      expect(point.newOpportunities).toBe(expected.newOpportunities);
    });
  });

  it("calculates win rate from aggregate closed and won opportunities", () => {
    const scoped = getLeadSaleDashboardData(DEFAULT_LEAD_SALE_FILTERS);
    const closed = scoped.reps.reduce((sum, rep) => sum + rep.closedOpportunities, 0);
    const won = scoped.reps.reduce((sum, rep) => sum + rep.wonOpportunities, 0);

    expect(scoped.summary.winRate).toBe(Math.round((won / closed) * 100));
    expect(scoped.summary.winRate).toBe(35);
  });
});
