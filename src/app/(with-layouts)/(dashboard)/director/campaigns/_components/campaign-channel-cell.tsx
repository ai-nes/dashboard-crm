"use client";

import { Link1AngularRight, Pencil1 } from "@tailgrids/icons";
import { useRef, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Popover } from "@/components/tailgrids/core/popover";

import {
  getChannelTypeLabel,
  channelTypeOptionsForMode,
  type ChannelTypeOption,
  type ChannelTypeValue,
  validateChannelUrl,
} from "./channel-types";
import CampaignChannelTypeDropdown from "./campaign-channel-type-dropdown";
import type { CampaignMode } from "./types";

interface CampaignChannelCellProps {
  campaignName: string;
  mode: CampaignMode;
  channelTypes: readonly ChannelTypeOption[];
  channelType: ChannelTypeValue | "";
  channelUrl: string;
  onSave: (
    channelType: ChannelTypeValue | "",
    url: string,
  ) => void | Promise<void>;
}

export default function CampaignChannelCell({
  campaignName,
  mode,
  channelTypes,
  channelType,
  channelUrl,
  onSave,
}: CampaignChannelCellProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingType, setPendingType] = useState(channelType);
  const [pendingUrl, setPendingUrl] = useState(channelUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsEditing(open);
    if (open) {
      setPendingType(channelType);
      setPendingUrl(channelUrl);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setError(null);

    const urlError = validateChannelUrl(pendingUrl);
    if (urlError) {
      setError(urlError);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(pendingType, pendingUrl.trim());
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể lưu thông tin kênh.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={triggerRef} className="flex items-center gap-1.5">
      <Button
        type="button"
        appearance="ghost"
        size="xs"
        className="group/channel min-w-0 max-w-full justify-start gap-1.5 truncate px-1 py-0.5 text-left text-xs font-medium hover:bg-background-soft-50"
        aria-label={
          channelType
            ? `Sửa loại kênh của ${campaignName}`
            : `Chọn loại kênh cho ${campaignName}`
        }
        aria-haspopup="dialog"
        aria-expanded={isEditing}
        onPress={() => handleOpenChange(!isEditing)}
      >
        <span
          className={
            channelType
              ? "truncate text-text-primary"
              : "truncate text-text-tertiary italic"
          }
        >
          {channelType
            ? getChannelTypeLabel(channelTypes, channelType)
            : "Chọn loại kênh"}
        </span>
        <Pencil1
          size={12}
          className="shrink-0 text-icon-tertiary opacity-0 transition group-hover/channel:opacity-100"
          aria-hidden="true"
        />
      </Button>
      <Popover
        aria-label={`Chỉnh sửa loại kênh của ${campaignName}`}
        className="z-40 w-80 p-3"
        isNonModal
        isOpen={isEditing}
        onOpenChange={handleOpenChange}
        placement="bottom start"
        shouldCloseOnInteractOutside={(element) =>
          !element.closest("[data-campaign-channel-type-dropdown]")
        }
        triggerRef={triggerRef}
      >
        <p className="text-xs font-medium text-text-tertiary">Loại kênh</p>
        <CampaignChannelTypeDropdown
          ariaLabel={`Loại kênh của ${campaignName}`}
          isDisabled={isSaving}
          onChange={setPendingType}
          options={channelTypeOptionsForMode(channelTypes, mode)}
          value={pendingType}
        />

        <p className="mt-3 text-xs font-medium text-text-tertiary">
          Channel URL
        </p>
        <Input
          value={pendingUrl}
          onChange={(event) => setPendingUrl(event.target.value)}
          placeholder={
            mode === "OFFLINE"
              ? "https://forms.gle/..."
              : "https://meet.google.com/..."
          }
          className="mt-1.5 h-9 w-full px-3 py-2 text-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSave();
            }
          }}
        />

        {error && (
          <p className="mt-2 text-xs text-badge-error-text">{error}</p>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            appearance="outline"
            size="xs"
            isDisabled={isSaving}
            onPress={() => setIsEditing(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="xs"
            isDisabled={isSaving}
            onPress={() => void handleSave()}
          >
            Lưu
          </Button>
        </div>
      </Popover>

      {channelUrl && (
        <a
          href={channelUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Mở liên kết kênh online của ${campaignName}`}
          className="shrink-0 text-icon-tertiary transition-colors hover:text-primary-500"
        >
          <Link1AngularRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
