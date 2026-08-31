import formatCurrency from "@/utils/format-currency";
import type { PlanKey, PlanMixRawResponse } from "@/services/api/saas";
import type { PlanMixViewModel } from "./types";

export const PLAN_COLOR_MAP: Record<PlanKey, string> = {
  free: "#3B82F6",
  basic: "#22C55E",
  pro: "#F37021",
  enterprise: "#F97316",
};

export function mapPlanMixResponse(raw: PlanMixRawResponse): PlanMixViewModel {
  return {
    totalSubscribers: raw.total_subscribers,
    slices: raw.plans.map((plan) => ({
      id: plan.id,
      planKey: plan.plan_key,
      name: plan.plan_name,
      subscribers: plan.subscriber_count,
      percentage: plan.percentage,
      mrr: plan.mrr_amount,
      color: PLAN_COLOR_MAP[plan.plan_key],
    })),
  };
}

export function formatMrr(value: number) {
  return value === 0 ? "$0" : formatCurrency(value);
}
