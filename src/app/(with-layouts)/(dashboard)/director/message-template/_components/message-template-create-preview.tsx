"use client";

import { ChevronDown, EyeDisabled } from "@tailgrids/icons";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import {
  listMessageTemplatePreviewContacts,
  previewMessageTemplate,
  type MessageTemplatePreviewContact,
  type MessageTemplatePreviewResponse,
} from "@/services/api/message-templates";

import type { MessageTemplateDraft } from "./message-template-create-types";

interface MessageTemplateCreatePreviewProps {
  isOpen?: boolean;
  draft: MessageTemplateDraft;
  isPreviewVisible: boolean;
  onPreviewVisibilityChange: (isVisible: boolean) => void;
  selectedContact: string;
  onContactChange: (contact: string) => void;
}

function hasBodyContent(body: string) {
  return body.replace(/<[^>]*>/g, "").trim().length > 0;
}

function previewDocument(body: string) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>body{font-family:Inter,Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.6;margin:24px;word-break:break-word}img{max-width:100%;height:auto}a{color:#ea580c}</style></head><body>${body}</body></html>`;
}

function formatMissingReference(reference: string) {
  return reference.startsWith("#(") && reference.endsWith(")")
    ? reference
    : `{{${reference}}}`;
}

export default function MessageTemplateCreatePreview({
  isOpen = false,
  draft,
  isPreviewVisible,
  onPreviewVisibilityChange,
  selectedContact,
  onContactChange,
}: MessageTemplateCreatePreviewProps) {
  const [contacts, setContacts] = useState<MessageTemplatePreviewContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<
    (MessageTemplatePreviewResponse & {
      sourceSubject: string;
      sourceBody: string;
    }) | null
  >(null);

  const loadContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    setContactsError(null);
    try {
      const response = await listMessageTemplatePreviewContacts({ pageLength: 100 });
      setContacts(response.contacts);
    } catch (error) {
      setContactsError(error instanceof Error ? error.message : "Không thể tải danh sách liên hệ.");
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      void loadContacts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, loadContacts]);

  const selectedContactLabel = contacts.find((contact) => contact.id === selectedContact)?.label;
  const canGenerate = Boolean(
    selectedContact && draft.name.trim() && draft.subject.trim() && hasBodyContent(draft.body),
  );
  const currentPreview = useMemo(
    () =>
      preview &&
      preview.lead.id === selectedContact &&
      preview.sourceSubject === draft.subject &&
      preview.sourceBody === draft.body
        ? preview
        : null,
    [draft.body, draft.subject, preview, selectedContact],
  );

  const handlePreview = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setPreviewError(null);
    try {
      const response = await previewMessageTemplate(selectedContact, {
        subject: draft.subject,
        body: draft.body,
      });
      setPreview({ ...response, sourceSubject: draft.subject, sourceBody: draft.body });
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Không thể tạo bản xem trước.");
    } finally {
      setIsGenerating(false);
    }
  };

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
            isDisabled={isLoadingContacts || contacts.length === 0}
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
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{contact.label}</span>
                    <span className="truncate text-xs text-text-tertiary">
                      {contact.email || contact.phone || "Không có thông tin liên hệ"}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            isDisabled={!canGenerate || isGenerating}
            isPending={isGenerating}
            onPress={() => void handlePreview()}
            className="h-11 shrink-0 px-4"
          >
            Tạo bản xem trước
          </Button>
        </div>

        {isPreviewVisible ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-card-border bg-background-white-primary">
            {contactsError ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-sm text-button-error-outline-text">
                <p>{contactsError}</p>
                <button type="button" className="mt-3 underline" onClick={() => void loadContacts()}>
                  Thử lại
                </button>
              </div>
            ) : previewError ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-button-error-outline-text">
                {previewError}
              </div>
            ) : currentPreview ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 border-b border-card-border px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Tiêu đề
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {currentPreview.subject}
                  </p>
                  {currentPreview.missingTokens.length > 0 ? (
                    <p className="mt-2 text-xs text-text-tertiary">
                      Chưa có dữ liệu: {currentPreview.missingTokens
                        .map(formatMissingReference)
                        .join(", ")}
                    </p>
                  ) : null}
                </div>
                <iframe
                  title="Nội dung email preview"
                  sandbox=""
                  srcDoc={previewDocument(currentPreview.body)}
                  className="min-h-0 flex-1 border-0 bg-background-white-primary"
                />
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <StudentCardEmptyState
                  message={
                    contacts.length === 0
                      ? "Chưa có contact Lead để xem trước."
                      : "Soạn mẫu email, chọn một contact và bấm Tạo bản xem trước."
                  }
                  className="py-8"
                />
              </div>
            )}
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
