"use client";

import { useRef } from "react";
import { ChevronDown } from "@tailgrids/icons";
import { DialogTrigger, Dialog as AriaDialog } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import { Badge } from "@/components/tailgrids/core/badge";
import { Popover } from "@/components/tailgrids/core/popover";
import ReminderTemplateSource from "./reminder-template-source";

const LABELS: Record<string, string> = {
  recipientName: "Tên Sales",
  total: "Tổng số task",
  overdueTasks: "Danh sách quá hạn",
  dueSoonTasks: "Danh sách sắp đến hạn",
  taskLink: "Liên kết công việc",
};
interface Props {
  html: string;
  tokens: string[];
  disabled: boolean;
  onChange: (html: string) => void;
}
export default function ReminderTemplateEditor({
  html,
  tokens,
  disabled,
  onChange,
}: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  const source = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  function insert(token: string) {
    const field = input.current;
    const start = field?.selectionStart ?? html.length;
    const end = field?.selectionEnd ?? start;
    const value = `{{${token}}}`;
    onChange(html.slice(0, start) + value + html.slice(end));
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(start + value.length, start + value.length);
    });
  }
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          Soạn mẫu email
        </h2>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-button-primary-outline-stroke bg-background-white-primary lg:min-h-0">
        <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-card-border px-3 text-sm">
          <span className="font-semibold text-text-primary">
            Mẫu email nhắc task
          </span>
          <Badge color="gray">Dùng chung</Badge>
        </div>
        <div className="flex min-h-8 shrink-0 items-center gap-3 border-b border-card-border px-3 text-sm">
          <span className="font-semibold text-text-primary">Tiêu đề:</span>
          <span
            className="truncate text-text-secondary"
            title="Tiêu đề được tạo từ số task quá hạn và sắp đến hạn"
          >
            Tự động theo công việc cần nhắc
          </span>
        </div>
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-card-border bg-background-gray-secondary/30 px-3 text-xs">
          <label
            htmlFor="reminder-template-html"
            className="font-semibold text-text-secondary"
          >
            Nội dung HTML
          </label>
          <span className="font-mono text-text-tertiary">HTML</span>
        </div>
        <div className="relative flex min-h-32 min-w-0 flex-1 overflow-hidden focus-within:ring-1 focus-within:ring-inset focus-within:ring-primary-500">
          <div
            ref={gutter}
            aria-hidden="true"
            className="w-12 shrink-0 overflow-hidden border-r border-card-border bg-background-gray-secondary/30 py-2 text-right font-mono text-[13px] leading-6 text-text-tertiary"
          >
            {html.split("\n").map((_, index) => (
              <div key={index} className="pr-3">
                {index + 1}
              </div>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <pre
              ref={source}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden p-2 font-mono text-[13px] leading-6 whitespace-pre text-text-primary [tab-size:2]"
            >
              <ReminderTemplateSource value={html} />
            </pre>
            <textarea
              ref={input}
              id="reminder-template-html"
              value={html}
              onChange={(event) => onChange(event.target.value)}
              onScroll={(event) => {
                if (source.current) {
                  source.current.scrollTop = event.currentTarget.scrollTop;
                  source.current.scrollLeft = event.currentTarget.scrollLeft;
                }
                if (gutter.current)
                  gutter.current.scrollTop = event.currentTarget.scrollTop;
              }}
              disabled={disabled}
              wrap="off"
              spellCheck={false}
              maxLength={100000}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-2 font-mono text-[13px] leading-6 whitespace-pre text-transparent caret-text-primary outline-none [tab-size:2] focus:ring-0"
            />
          </div>
        </div>
        <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-t border-card-border px-3">
          <DialogTrigger>
            <Button
              appearance="ghost"
              size="xs"
              isDisabled={disabled}
              className="gap-1.5 text-text-secondary"
            >
              Chèn biến
              <ChevronDown size={14} />
            </Button>
            <Popover placement="top start" className="w-72 p-2">
              <AriaDialog aria-label="Chèn biến email" className="outline-none">
                {({ close }) => (
                  <div>
                    {tokens.map((token) => (
                      <Button
                        key={token}
                        appearance="ghost"
                        size="sm"
                        onPress={() => {
                          insert(token);
                          close();
                        }}
                        className="h-auto w-full justify-between gap-3 rounded-md px-3 py-2 text-left"
                      >
                        <span className="text-sm text-text-primary">
                          {LABELS[token] ?? token}
                        </span>
                        <span className="font-mono text-[10px] text-text-tertiary">{`{{${token}}}`}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </AriaDialog>
            </Popover>
          </DialogTrigger>
          <span className="text-xs text-text-tertiary">
            {html.split("\n").length} dòng
          </span>
        </div>
      </div>
      <p className="text-xs text-text-tertiary">
        Danh sách task tự động điền qua{" "}
        <span className="font-mono">overdueTasks</span> và{" "}
        <span className="font-mono">dueSoonTasks</span>.
      </p>
    </section>
  );
}
