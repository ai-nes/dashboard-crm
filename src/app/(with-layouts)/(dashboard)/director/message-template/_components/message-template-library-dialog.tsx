"use client";

import {
  Check,
  Code1,
  Close,
  UserCircle1,
  UserMultiple1,
  UserPencil,
} from "@tailgrids/icons";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  listMessageTemplateLibrary,
  type MessageTemplateRecord,
} from "@/services/api/message-templates";

import type { MessageTemplateDraft } from "./message-template-create-types";

interface MessageTemplateLibraryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (draft: MessageTemplateDraft) => void;
}

interface MessageTemplateGroup {
  id: string;
  title: string;
  templates: MessageTemplateRecord[];
}

type TokenKind = "student" | "leads" | "sender" | "placeholder";

const TOKEN_KIND_LABELS: Record<TokenKind, string> = {
  student: "Student",
  leads: "Leads",
  sender: "Sender",
  placeholder: "Placeholder",
};

const TOKEN_FIELD_LABELS: Record<string, string> = {
  amount: "Amount",
  career_direction: "Career Direction",
  datetime: "Date & Time",
  email: "Email",
  first_name: "First Name",
  full_name: "Full Name",
  interest_area: "Interest Area",
  interested_program: "Interested Program",
  last_name: "Last Name",
  link: "Link",
  location: "Location",
  missing_documents: "Missing Documents",
  name: "Name",
  next_step: "Next Step",
  phone: "Phone",
  registration_link: "Registration Link",
  source: "Source",
  status: "Status",
  type: "Type",
};

const CATEGORY_ORDER = [
  "first-touch",
  "follow-up",
  "admission-consultation",
  "application-conversion",
  "re-engagement",
];

const CATEGORY_LABELS: Record<string, string> = {
  "first-touch": "Tiếp cận ban đầu",
  "follow-up": "Theo dõi sau liên hệ",
  "admission-consultation": "Tư vấn tuyển sinh",
  "application-conversion": "Hồ sơ & chuyển đổi",
  "re-engagement": "Tái tương tác",
};

function tokenKind(namespace: string): TokenKind {
  if (namespace === "student") return "student";
  if (namespace === "lead") return "leads";
  if (namespace === "owner") return "sender";
  return "placeholder";
}

function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function TokenIcon({ kind }: { kind: TokenKind }) {
  if (kind === "student") return <UserCircle1 size={14} aria-hidden="true" />;
  if (kind === "leads") return <UserMultiple1 size={14} aria-hidden="true" />;
  if (kind === "sender") return <UserPencil size={14} aria-hidden="true" />;
  return <Code1 size={14} aria-hidden="true" />;
}

function renderTemplateToken(token: string, key: string) {
  const [namespace = "placeholder", ...fieldParts] = token.trim().split(".");
  const kind = tokenKind(namespace);
  const field = fieldParts.join("_") || namespace;
  const fieldLabel = TOKEN_FIELD_LABELS[field] ?? titleCase(field);
  const displayFieldLabel = kind === "placeholder"
    ? `${titleCase(namespace)} ${fieldLabel}`
    : fieldLabel;

  return (
    <span
      key={key}
      title={`{{${token}}}`}
      className="mx-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-text-primary/70 bg-background-gray-secondary/70 px-1.5 py-0.5 align-middle text-[0.9em] font-medium leading-5 text-text-primary shadow-none"
    >
      <span className="shrink-0 text-text-secondary">
        <TokenIcon kind={kind} />
      </span>
      <span>{TOKEN_KIND_LABELS[kind]}: {displayFieldLabel}</span>
    </span>
  );
}

function renderTemplateText(text: string) {
  return text.split(/(\{\{[^}]+\}\})/g).map((part, index) => {
    const isToken = part.startsWith("{{") && part.endsWith("}}");

    return isToken
      ? renderTemplateToken(part.slice(2, -2), `${part}-${index}`)
      : <span key={`${part}-${index}`}>{part}</span>;
  });
}

function groupTemplates(templates: MessageTemplateRecord[]): MessageTemplateGroup[] {
  const grouped = new Map<string, MessageTemplateRecord[]>();
  templates.forEach((template) => {
    const category = template.libraryCategory || "general";
    grouped.set(category, [...(grouped.get(category) ?? []), template]);
  });

  const orderedCategories = [
    ...CATEGORY_ORDER,
    ...Array.from(grouped.keys()).filter((category) => !CATEGORY_ORDER.includes(category)),
  ];

  return orderedCategories.flatMap((category) => {
    const categoryTemplates = grouped.get(category);
    if (!categoryTemplates?.length) return [];

    return [{
      id: category,
      title: CATEGORY_LABELS[category] ?? "Mẫu dùng chung",
      templates: categoryTemplates,
    }];
  });
}

export default function MessageTemplateLibraryDialog({
  isOpen,
  onOpenChange,
  onUseTemplate,
}: MessageTemplateLibraryDialogProps) {
  const [templates, setTemplates] = useState<MessageTemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [previewedTemplateId, setPreviewedTemplateId] = useState("");

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await listMessageTemplateLibrary();
      setTemplates(response.templates);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thể tải thư viện mẫu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      void loadLibrary();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, loadLibrary]);

  const groups = useMemo(() => groupTemplates(templates), [templates]);
  const firstTemplate = groups[0]?.templates[0] ?? null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId)
    ?? firstTemplate;
  const previewedTemplate = templates.find((template) => template.id === previewedTemplateId)
    ?? selectedTemplate;
  const totalTemplateCount = templates.length;

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setPreviewedTemplateId(templateId);
  };

  const previewTemplate = (templateId: string) => {
    setPreviewedTemplateId(templateId);
  };

  return (
    <Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog
        aria-label="Message Template Library"
        showCloseButton={false}
        className="flex h-[min(90vh,58rem)] max-h-[calc(100vh-2rem)] max-w-[90rem] flex-col overflow-hidden p-0"
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-card-border bg-card-surface-area px-5 py-4 pr-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <DialogTitle level={2} className="truncate text-xl font-semibold text-text-primary sm:text-2xl">
              Message Template Library
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Chọn mẫu để xem trước nội dung trước khi bắt đầu tạo message.
            </DialogDescription>
          </div>
          <Button
            iconOnly
            size="sm"
            appearance="ghost"
            aria-label="Đóng thư viện mẫu"
            onPress={() => onOpenChange(false)}
          >
            <Close size={20} aria-hidden="true" />
          </Button>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(16rem,0.85fr)_minmax(20rem,1.15fr)] lg:grid-cols-[minmax(22rem,0.78fr)_minmax(0,1.22fr)] lg:grid-rows-1">
          <section
            aria-label="Danh sách nhóm mẫu tin nhắn"
            className="flex min-h-0 flex-col overflow-hidden border-b border-card-border bg-background-white-primary lg:border-r lg:border-b-0"
          >
            <div role="listbox" aria-label="Các mẫu tin nhắn" className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
              {isLoading ? (
                <p className="p-4 text-sm text-text-tertiary">Đang tải thư viện mẫu...</p>
              ) : loadError ? (
                <div className="p-4 text-sm text-button-error-outline-text">
                  <p>{loadError}</p>
                  <button type="button" className="mt-2 underline" onClick={() => void loadLibrary()}>
                    Thử lại
                  </button>
                </div>
              ) : groups.length === 0 ? (
                <p className="p-4 text-sm text-text-tertiary">Chưa có mẫu dùng chung.</p>
              ) : (
                <div className="space-y-6">
                  {groups.map((group, groupIndex) => (
                    <section key={group.id} aria-labelledby={`${group.id}-heading`}>
                      <div className="flex items-center gap-2 border-b border-card-border pb-2.5">
                        <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-text-tertiary">
                          {String(groupIndex + 1).padStart(2, "0")}
                        </span>
                        <h2 id={`${group.id}-heading`} className="text-sm font-bold tracking-[0.02em] text-text-primary">
                          {group.title}
                        </h2>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {group.templates.map((template) => {
                          const isSelected = template.id === selectedTemplate?.id;
                          const isPreviewed = template.id === previewedTemplate?.id;

                          return (
                            <button
                              key={template.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => selectTemplate(template.id)}
                              onMouseEnter={() => previewTemplate(template.id)}
                              onFocus={() => previewTemplate(template.id)}
                              className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-3.5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary-500 ${isPreviewed ? "border-primary-500/25 bg-badge-primary-background/50 shadow-xs" : isSelected ? "border-card-border bg-background-gray-secondary/40" : "border-transparent hover:border-card-border hover:bg-background-gray-secondary/60"}`}
                            >
                              <span
                                aria-hidden="true"
                                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${isSelected ? "border-checkbox-checked-border bg-checkbox-checked-background text-checkbox-checked-icon-color" : "border-button-primary-outline-stroke bg-checkbox-background text-transparent group-hover:border-checkbox-checked-border"}`}
                              >
                                <Check size={14} aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold leading-6 text-text-primary">
                                  {template.name}
                                </span>
                                <span className="mt-0.5 block text-sm leading-6 text-text-tertiary">
                                  {template.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section
            aria-live="polite"
            aria-label={`Nội dung mẫu ${previewedTemplate?.name ?? ""}`}
            className="flex min-h-0 flex-col overflow-hidden bg-background-gray-secondary/55"
          >
            {previewedTemplate ? (
              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
                <div className="mx-auto max-w-3xl">
                  <dl className="space-y-6 text-base">
                    <div>
                      <dt className="text-sm font-medium text-text-tertiary">Template name</dt>
                      <dd className="mt-1 text-lg font-semibold leading-7 text-text-primary">
                        {previewedTemplate.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-text-tertiary">Subject</dt>
                      <dd className="mt-1 text-base leading-8 text-text-secondary">
                        {renderTemplateText(previewedTemplate.subject)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-10 whitespace-pre-wrap text-base leading-8 text-text-secondary">
                    {renderTemplateText(previewedTemplate.body)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-sm text-text-tertiary">
                Chọn một mẫu để xem trước.
              </div>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 flex-col items-stretch gap-3 border-t border-card-border bg-background-white-primary px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span className="min-w-0 truncate text-xs text-text-tertiary">
            {totalTemplateCount} mẫu có sẵn
            {previewedTemplate ? (
              <> · Đang xem: <span className="font-medium text-text-secondary">{previewedTemplate.name}</span></>
            ) : null}
          </span>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button appearance="outline" size="sm" onPress={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button
              size="sm"
              isDisabled={!previewedTemplate}
              onPress={() => {
                if (!previewedTemplate) return;
                onUseTemplate?.({
                  name: previewedTemplate.name,
                  subject: previewedTemplate.subject,
                  body: previewedTemplate.body,
                  sharing: "public",
                });
                onOpenChange(false);
              }}
            >
              Dùng mẫu
            </Button>
          </div>
        </footer>
      </Dialog>
    </Backdrop>
  );
}
