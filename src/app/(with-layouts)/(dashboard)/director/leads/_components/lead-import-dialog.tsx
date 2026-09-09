"use client";

import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { MultiStepDialog } from "@/components/common/multi-step-dialog";
import { useLeadSaleCampaignsQuery } from "@/hooks/use-lead-sale-campaign-queries";
import type {
  LeadImportMapping,
  LeadImportResponse,
} from "@/services/api/lead-sale";

import QuickCreateLeadImportPanel, {
  type QuickCreateLeadImportPanelHandle,
} from "./quick-create-lead-import-panel";

interface LeadImportDialogProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    file: File,
    campaignCode: string,
    mapping: LeadImportMapping[],
  ) => Promise<LeadImportResponse>;
}

const STEPS = ["File & campaign", "Cột & xem trước", "Xác nhận nhập"];

export default function LeadImportDialog({
  isOpen,
  isSubmitting = false,
  onOpenChange,
  onImport,
}: LeadImportDialogProps) {
  const campaignsQuery = useLeadSaleCampaignsQuery({});
  const panelRef = useRef<QuickCreateLeadImportPanelHandle>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const campaigns = campaignsQuery.data?.campaigns ?? [];
  const campaignOptions = campaigns
    .filter((campaign) => {
      const status = campaign.status.trim().toUpperCase();
      return (
        (status === "ACTIVE" || status === "CLOSED") &&
        Boolean(campaign.stableCode)
      );
    })
    .map((campaign) => ({
      id: campaign.stableCode,
      label: `${campaign.stableCode} — ${campaign.title}`,
    }));

  const handleOpenChange = (open: boolean) => {
    if (!open) setCurrentStep(0);
    onOpenChange(open);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void panelRef.current?.submit();
  };

  return (
    <MultiStepDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="Import Lead từ file"
      description="Kiểm tra cột và dữ liệu trước khi tạo Lead. Backend sẽ đọc lại file gốc khi nhập."
      ariaLabel="Import Lead từ file"
      steps={STEPS}
      currentStep={currentStep}
      size="wide"
      isBusy={isSubmitting}
      onSubmit={handleSubmit}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            size="sm"
            appearance="outline"
            isDisabled={currentStep === 0 || isSubmitting}
            onPress={() => panelRef.current?.goBack()}
          >
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              appearance="outline"
              isDisabled={isSubmitting}
              onPress={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
            <Button type="submit" size="sm" isDisabled={isSubmitting}>
              {isSubmitting
                ? "Đang nhập…"
                : currentStep === STEPS.length - 1
                  ? "Nhập Lead"
                  : "Tiếp tục"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {campaignsQuery.isPending && (
          <p className="text-sm text-text-secondary" role="status">
            Đang tải danh sách campaign…
          </p>
        )}
        {campaignsQuery.isError && (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-card-border px-3 py-2"
            role="alert"
          >
            <p className="text-xs text-error-600">
              {campaignsQuery.error.message || "Chưa thể tải danh sách campaign."}
            </p>
            <Button
              type="button"
              size="sm"
              appearance="outline"
              onPress={() => void campaignsQuery.refetch()}
            >
              Thử lại
            </Button>
          </div>
        )}
        {!campaignsQuery.isPending &&
          !campaignsQuery.isError &&
          campaignOptions.length === 0 && (
            <p className="text-sm text-text-secondary" role="alert">
              Chưa có campaign ACTIVE hoặc CLOSED để import Lead.
            </p>
          )}
        <QuickCreateLeadImportPanel
          key={isOpen ? "open" : "closed"}
          ref={panelRef}
          campaignOptions={campaignOptions}
          isSubmitting={isSubmitting}
          onStepChange={setCurrentStep}
          onImport={onImport}
        />
      </div>
    </MultiStepDialog>
  );
}
