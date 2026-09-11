"use client";

import { ChevronDown } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { DialogTrigger } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

type MessageTemplateTokenType = "student" | "leads" | "sender" | "placeholder";

interface MessageTemplateTokenOption {
  id: string;
  label: string;
  value: string;
}

const tokenTypes: Array<{ id: MessageTemplateTokenType; label: string }> = [
  { id: "student", label: "Student" },
  { id: "leads", label: "Leads" },
  { id: "sender", label: "Sender" },
  { id: "placeholder", label: "Placeholder" },
];

const tokenOptions: Record<MessageTemplateTokenType, MessageTemplateTokenOption[]> = {
  student: [
    { id: "student-first-name", label: "First Name", value: "student.first_name" },
    { id: "student-last-name", label: "Last Name", value: "student.last_name" },
    { id: "student-full-name", label: "Full Name", value: "student.full_name" },
    { id: "student-email", label: "Email", value: "student.email" },
    { id: "student-phone", label: "Phone Number", value: "student.phone" },
  ],
  leads: [
    { id: "lead-source", label: "Source", value: "lead.source" },
    { id: "lead-status", label: "Status", value: "lead.status" },
    { id: "lead-campaign", label: "Campaign", value: "lead.campaign" },
    { id: "lead-created-at", label: "Created At", value: "lead.created_at" },
  ],
  sender: [
    { id: "sender-full-name", label: "Full Name", value: "owner.full_name" },
    { id: "sender-email", label: "Email", value: "owner.email" },
    { id: "sender-phone", label: "Phone Number", value: "owner.phone" },
  ],
  placeholder: [
    { id: "school-name", label: "School Name", value: "school.name" },
    { id: "program-name", label: "Program Name", value: "program.name" },
    { id: "program-link", label: "Program Link", value: "program.link" },
    { id: "event-name", label: "Event Name", value: "event.name" },
    { id: "event-datetime", label: "Event Date & Time", value: "event.datetime" },
    {
      id: "application-missing-documents",
      label: "Application Missing Documents",
      value: "application.missing_documents",
    },
    { id: "application-link", label: "Application Link", value: "application.link" },
  ],
};

interface MessageTemplateTokenPopoverProps {
  onInsertToken: (token: string) => void;
  placement?: "bottom start" | "bottom end";
}

export default function MessageTemplateTokenPopover({
  onInsertToken,
  placement = "bottom start",
}: MessageTemplateTokenPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MessageTemplateTokenType>("student");
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const selectedTypeLabel = tokenTypes.find((type) => type.id === selectedType)?.label;
  const availableTokens = tokenOptions[selectedType];
  const selectedToken = useMemo(
    () => availableTokens.find((token) => token.id === selectedTokenId),
    [availableTokens, selectedTokenId],
  );

  const handleTypeChange = (value: string) => {
    setSelectedType(value as MessageTemplateTokenType);
    setSelectedTokenId("");
  };

  const handleInsert = () => {
    if (!selectedToken) return;

    onInsertToken(selectedToken.value);
    setIsOpen(false);
    setSelectedTokenId("");
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="xs"
        aria-label="Chèn biến cá nhân hóa"
        className="gap-1 px-1.5 text-sm font-semibold text-text-secondary"
      >
        Chèn
        <ChevronDown size={14} aria-hidden="true" />
      </Button>
      <Popover
        aria-label="Chèn biến cá nhân hóa"
        placement={placement}
        offset={8}
        className="z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border-button-primary-outline-stroke bg-background-white-primary p-0 shadow-lg"
      >
        <div className="border-b border-card-border px-4 py-3">
          <h2 className="text-base font-semibold text-text-primary">Chèn biến cá nhân hóa</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Chọn loại và token muốn thêm vào nội dung.
          </p>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-text-primary">Loại</span>
            <Select
              aria-label="Loại biến cá nhân hóa"
              value={selectedType}
              onChange={(value) => handleTypeChange(String(value ?? "student"))}
              className="gap-0"
            >
              <SelectTrigger className="h-10 rounded-md border-button-primary-outline-stroke bg-background-white-primary px-3 text-sm shadow-none">
                <SelectValue>{selectedTypeLabel}</SelectValue>
                <SelectIndicator>
                  <ChevronDown size={15} />
                </SelectIndicator>
              </SelectTrigger>
              <SelectContent>
                {tokenTypes.map((type) => (
                  <SelectItem key={type.id} id={type.id} textValue={type.label}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-text-primary">Token</span>
            <Select
              aria-label="Token biến cá nhân hóa"
              value={selectedTokenId}
              onChange={(value) => setSelectedTokenId(String(value ?? ""))}
              className="gap-0"
            >
              <SelectTrigger className="h-10 rounded-md border-button-primary-outline-stroke bg-background-white-primary px-3 text-sm shadow-none">
                <SelectValue>{selectedToken?.label ?? "Chọn token"}</SelectValue>
                <SelectIndicator>
                  <ChevronDown size={15} />
                </SelectIndicator>
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.id} id={token.id} textValue={token.label}>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{token.label}</span>
                      <span className="truncate text-xs text-text-tertiary">{`{{${token.value}}}`}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3">
          <Button
            appearance="outline"
            size="sm"
            onPress={() => setIsOpen(false)}
            className="border-button-primary-outline-stroke"
          >
            Hủy
          </Button>
          <Button size="sm" isDisabled={!selectedToken} onPress={handleInsert}>
            Chèn
          </Button>
        </div>
      </Popover>
    </DialogTrigger>
  );
}
