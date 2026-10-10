import type {
  LeadRoutingLayerKey,
  LeadRoutingPolicy,
} from "@/services/api/lead-sale";

export const LEAD_ROUTING_MODES: Record<
  LeadRoutingLayerKey,
  { label: string; description: string }
> = {
  global: {
    label: "Chia đều cho toàn bộ Sales",
    description: "Sales trong cùng cơ sở.",
  },
  group: {
    label: "Theo team/tỉnh",
    description: "Chọn team theo tỉnh của Lead.",
  },
  campaign: {
    label: "Theo chiến dịch",
    description: "Dùng team đã chọn trong chiến dịch.",
  },
};

export function getLeadRoutingMode(
  policy: LeadRoutingPolicy,
): LeadRoutingLayerKey {
  return (
    policy.routingMode ??
    policy.layers.find((layer) => layer.enabled)?.key ??
    "group"
  );
}
