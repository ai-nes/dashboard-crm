"use client";

import { Link1AngularRight, Pencil1 } from "@tailgrids/icons";
import { useState } from "react";
import { DialogTrigger } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";
import { Input } from "@/components/tailgrids/core/input";
import { Popover } from "@/components/tailgrids/core/popover";

import { channelTypeLabel, channelTypeOptionsForMode, type ChannelTypeValue } from "./channel-types";
import type { CampaignMode } from "./types";

interface CampaignChannelCellProps {
  campaignName: string;
  mode: CampaignMode;
  channelType: ChannelTypeValue | "";
  channelUrl: string;
  onChannelTypeChange: (channelType: ChannelTypeValue | "") => void;
  onChannelUrlChange: (url: string) => void;
}

export default function CampaignChannelCell({
  campaignName,
  mode,
  channelType,
  channelUrl,
  onChannelTypeChange,
  onChannelUrlChange,
}: CampaignChannelCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingType, setPendingType] = useState(channelType);
  const [pendingUrl, setPendingUrl] = useState(channelUrl);

  const handleOpenChange = (open: boolean) => {
    setIsEditing(open);
    if (open) {
      setPendingType(channelType);
      setPendingUrl(channelUrl);
    }
  };

  const handleSave = () => {
    onChannelTypeChange(pendingType);
    onChannelUrlChange(pendingUrl.trim());
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <DialogTrigger isOpen={isEditing} onOpenChange={handleOpenChange}>
        <Button
          type="button"
          appearance="ghost"
          size="xs"
          className="group/channel min-w-0 max-w-full justify-start gap-1.5 truncate px-1 py-0.5 text-left text-xs font-medium hover:bg-background-soft-50"
          aria-label={channelType ? `Sửa loại kênh của ${campaignName}` : `Chọn loại kênh cho ${campaignName}`}
        >
          <span className={channelType ? "truncate text-text-primary" : "truncate text-text-tertiary italic"}>
            {channelType ? channelTypeLabel[channelType] : "Chọn loại kênh"}
          </span>
          <Pencil1
            size={12}
            className="shrink-0 text-icon-tertiary opacity-0 transition group-hover/channel:opacity-100"
            aria-hidden="true"
          />
        </Button>
        <Popover className="w-80 p-3">
          <p className="text-xs font-medium text-text-tertiary">Loại kênh</p>
          <Combobox
            value={pendingType || null}
            onChange={(key) => setPendingType((key as ChannelTypeValue) ?? "")}
            aria-label={`Loại kênh của ${campaignName}`}
            placeholder="Chọn loại kênh"
            className="mt-1.5"
          >
            {channelTypeOptionsForMode(mode).map((option) => (
              <ComboboxItem key={option.value} id={option.value} textValue={option.label}>
                {option.label}
              </ComboboxItem>
            ))}
          </Combobox>

          <p className="mt-3 text-xs font-medium text-text-tertiary">Channel URL</p>
          <Input
            value={pendingUrl}
            onChange={(event) => setPendingUrl(event.target.value)}
            placeholder={mode === "OFFLINE" ? "https://forms.gle/..." : "https://meet.google.com/..."}
            className="mt-1.5 h-9 w-full px-3 py-2 text-sm"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSave();
              }
            }}
          />

          <div className="mt-3 flex items-center justify-end gap-2">
            <Button type="button" appearance="outline" size="xs" onPress={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button type="button" size="xs" onPress={handleSave}>
              Lưu
            </Button>
          </div>
        </Popover>
      </DialogTrigger>

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
