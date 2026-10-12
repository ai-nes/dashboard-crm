"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmDoctypePermissions } from "@/components/common/auth/permissions";
import { EditableDetailField } from "@/components/common/editable-detail-field";
import {
  useLeadSaleCampaignChannelTypesQuery,
  useLeadSaleCampaignSourceQuery,
} from "@/hooks/use-lead-sale-campaign-queries";
import type { LeadDetail } from "@/services/api/lead-sale";
import { getChannelTypeLabel } from "../../campaigns/_components/channel-types";

export default function LeadCampaignSource({ lead }: { lead: LeadDetail }) {
  const { user, isLoading } = useAuth();
  const canRead = getCrmDoctypePermissions(user, "CRM Campaign").canRead;
  const enabled = !isLoading && canRead && Boolean(lead.campaignId);
  const campaignQuery = useLeadSaleCampaignSourceQuery(
    lead.campaignId ?? "",
    enabled,
  );
  const channelTypesQuery = useLeadSaleCampaignChannelTypesQuery(
    { enabledOnly: false },
    { enabled: enabled && Boolean(campaignQuery.data?.channelType) },
  );
  let source = lead.source;
  if (lead.campaignId) {
    source =
      !canRead && !isLoading
        ? "Chưa có quyền xem kênh chiến dịch"
        : campaignQuery.isError
          ? "Không tải được kênh chiến dịch"
          : isLoading || campaignQuery.isLoading
            ? "Đang tải kênh chiến dịch…"
            : campaignQuery.data?.channelType
              ? getChannelTypeLabel(
                  channelTypesQuery.data?.channelTypes ?? [],
                  campaignQuery.data.channelType,
                )
              : "Chiến dịch chưa cấu hình kênh";
  }

  return (
    <>
      <EditableDetailField
        label="Chiến dịch tham gia"
        value={lead.campaign ?? ""}
        readOnly
      />
      <EditableDetailField label="Nguồn Lead" value={source} readOnly />
    </>
  );
}
