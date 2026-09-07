"use client";

import { Link1AngularRight, Pencil1 } from "@tailgrids/icons";
import { useState } from "react";
import { DialogTrigger } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Popover } from "@/components/tailgrids/core/popover";

interface CampaignChannelCellProps {
  campaignName: string;
  channelUrl: string;
  onChange: (url: string) => void;
}

export default function CampaignChannelCell({ campaignName, channelUrl, onChange }: CampaignChannelCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(channelUrl);

  const handleOpenChange = (open: boolean) => {
    setIsEditing(open);
    if (open) setValue(channelUrl);
  };

  const handleSave = () => {
    onChange(value.trim());
    setIsEditing(false);
  };

  const handleClear = () => {
    onChange("");
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
          aria-label={channelUrl ? `Sửa liên kết kênh online của ${campaignName}` : `Thêm liên kết kênh online cho ${campaignName}`}
        >
          <span className={channelUrl ? "truncate text-primary-600" : "truncate text-text-tertiary italic"}>
            {channelUrl ? "Mở kênh" : "Thêm kênh"}
          </span>
          <Pencil1
            size={12}
            className="shrink-0 text-icon-tertiary opacity-0 transition group-hover/channel:opacity-100"
            aria-hidden="true"
          />
        </Button>
        <Popover className="w-80 p-3">
          <p className="text-xs font-medium text-text-tertiary">Channel URL</p>
          <Input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://meet.google.com/..."
            className="mt-1.5 h-9 w-full px-3 py-2 text-sm"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSave();
              }
            }}
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            {channelUrl && (
              <Button type="button" appearance="ghost" size="xs" variant="danger" onPress={handleClear}>
                Xóa liên kết
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" appearance="outline" size="xs" onPress={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button type="button" size="xs" onPress={handleSave}>
                Lưu
              </Button>
            </div>
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
