"use client";

import { ChevronDown, EyeDisabled } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import type { MessageTemplateDraft } from "./message-template-create-types";

interface MessageTemplateCreatePreviewProps {
  draft: MessageTemplateDraft;
  isPreviewVisible: boolean;
  onPreviewVisibilityChange: (isVisible: boolean) => void;
  selectedContact: string;
  onContactChange: (contact: string) => void;
}

const contacts = [
  { id: "minh-anh", label: "Nguyễn Minh Anh" },
  { id: "hoang-nam", label: "Trần Hoàng Nam" },
  { id: "thao-nguyen", label: "Lê Ngọc Thảo" },
];

function hasBodyContent(body: string) {
  return body.replace(/<[^>]*>/g, "").trim().length > 0;
}

export default function MessageTemplateCreatePreview({
  draft,
  isPreviewVisible,
  onPreviewVisibilityChange,
  selectedContact,
  onContactChange,
}: MessageTemplateCreatePreviewProps) {
  const selectedContactLabel = contacts.find((contact) => contact.id === selectedContact)?.label;
  const canGenerate = Boolean(
    selectedContact && draft.name.trim() && draft.subject.trim() && hasBodyContent(draft.body),
  );

  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">Xem trước email</h2>
        <Button
          appearance="ghost"
          size="xs"
          aria-pressed={!isPreviewVisible}
          onPress={() => onPreviewVisibilityChange(!isPreviewVisible)}
          className="shrink-0 gap-1.5 px-1.5 text-sm font-semibold text-text-primary"
        >
          <EyeDisabled size={16} aria-hidden="true" />
          {isPreviewVisible ? "Ẩn xem trước" : "Hiện xem trước"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex items-center gap-3">
          <Select
            aria-label="Chọn liên hệ preview"
            className="min-w-0 flex-1 gap-0"
            value={selectedContact}
            onChange={(value) => onContactChange(String(value ?? ""))}
          >
            <SelectTrigger className="h-11 min-w-0 border-button-primary-outline-stroke bg-background-white-primary px-4 text-sm shadow-none">
              <SelectValue>{selectedContactLabel ?? "Chọn liên hệ"}</SelectValue>
              <SelectIndicator>
                <ChevronDown size={16} />
              </SelectIndicator>
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} id={contact.id} textValue={contact.label}>
                  {contact.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" isDisabled={!canGenerate} className="h-11 shrink-0 px-4">
            Tạo bản xem trước
          </Button>
        </div>

        {isPreviewVisible ? (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-card-border bg-background-white-primary px-6 text-center">
            <StudentCardEmptyState
              message="Soạn mẫu email và chọn một liên hệ để xem trước nội dung email."
              className="py-8"
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-card-border bg-background-gray-secondary/30 px-6 py-12 text-center">
            <p className="text-sm text-text-tertiary">Đã ẩn phần xem trước.</p>
          </div>
        )}
      </div>
    </section>
  );
}
