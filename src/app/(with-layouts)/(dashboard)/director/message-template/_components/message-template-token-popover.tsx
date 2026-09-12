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
import type { SnippetRecord } from "@/services/api/snippets";
import type { MessageTemplateTokenDefinition } from "@/services/api/message-templates";

type InsertMode = "menu" | "personalization" | "snippet";

interface MessageTemplateTokenPopoverProps {
  tokens: MessageTemplateTokenDefinition[];
  isLoadingTokens?: boolean;
  tokensError?: string | null;
  onInsertToken: (token: string) => void;
  placement?: "bottom start" | "bottom end";
  snippets?: SnippetRecord[];
  isLoadingSnippets?: boolean;
  snippetsError?: string | null;
  onInsertSnippet?: (snippet: SnippetRecord) => void;
}

export default function MessageTemplateTokenPopover({
  tokens,
  isLoadingTokens = false,
  tokensError = null,
  onInsertToken,
  placement = "bottom start",
  snippets = [],
  isLoadingSnippets = false,
  snippetsError = null,
  onInsertSnippet,
}: MessageTemplateTokenPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<InsertMode>("menu");
  const [selectedType, setSelectedType] = useState("student");
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [selectedSnippetId, setSelectedSnippetId] = useState("");
  const tokenGroups = useMemo(() => {
    const groups = new Map<
      string,
      { id: string; label: string; tokens: MessageTemplateTokenDefinition[] }
    >();
    tokens.forEach((token) => {
      const group = groups.get(token.group) ?? {
        id: token.group,
        label: token.groupLabel,
        tokens: [],
      };
      group.tokens.push(token);
      groups.set(token.group, group);
    });
    return [...groups.values()];
  }, [tokens]);
  const activeType = tokenGroups.some((group) => group.id === selectedType)
    ? selectedType
    : (tokenGroups[0]?.id ?? "");
  const selectedGroup = tokenGroups.find((group) => group.id === activeType);
  const selectedTypeLabel = selectedGroup?.label;
  const availableTokens = useMemo(
    () => selectedGroup?.tokens ?? [],
    [selectedGroup],
  );
  const selectedToken = useMemo(
    () => availableTokens.find((token) => token.id === selectedTokenId),
    [availableTokens, selectedTokenId],
  );
  const selectedSnippet = useMemo(
    () => snippets.find((snippet) => snippet.id === selectedSnippetId),
    [selectedSnippetId, snippets],
  );

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setSelectedTokenId("");
  };

  const handleInsert = () => {
    if (!selectedToken) return;

    onInsertToken(selectedToken.value);
    setIsOpen(false);
    setMode("menu");
    setSelectedTokenId("");
  };

  const handleInsertSnippet = () => {
    if (!selectedSnippet || !onInsertSnippet) return;

    onInsertSnippet(selectedSnippet);
    setIsOpen(false);
    setMode("menu");
    setSelectedSnippetId("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) return;

    setMode("menu");
    setSelectedTokenId("");
    setSelectedSnippetId("");
  };

  const title =
    mode === "personalization"
      ? "Chèn biến cá nhân hóa"
      : mode === "snippet"
        ? "Chèn snippet"
        : "Chèn nội dung";
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="xs"
        aria-label="Chèn nội dung"
        className="gap-1 px-1.5 text-sm font-semibold text-text-secondary"
      >
        Chèn
        <ChevronDown size={14} aria-hidden="true" />
      </Button>
      <Popover
        aria-label="Chèn nội dung"
        placement={placement}
        offset={8}
        className="z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border-button-primary-outline-stroke bg-background-white-primary p-0 shadow-lg"
      >
        <div className="border-b border-card-border px-4 py-3">
          <div className="flex items-center gap-2">
            {mode !== "menu" ? (
              <Button
                appearance="ghost"
                size="xs"
                aria-label="Quay lại menu chèn"
                onPress={() => setMode("menu")}
                className="px-1 text-lg leading-none text-text-secondary"
              >
                ←
              </Button>
            ) : null}
            <h2 className="text-base font-semibold text-text-primary">
              {title}
            </h2>
          </div>
        </div>

        {mode === "menu" ? (
          <div className="space-y-2 px-4 py-4">
            <Button
              appearance="outline"
              size="sm"
              onPress={() => setMode("personalization")}
              className="w-full justify-between border-button-primary-outline-stroke text-left"
            >
              <span>Chèn cá nhân hóa</span>
              <span aria-hidden="true" className="text-lg text-text-tertiary">
                ›
              </span>
            </Button>
            {onInsertSnippet ? (
              <Button
                appearance="outline"
                size="sm"
                onPress={() => setMode("snippet")}
                className="w-full justify-between border-button-primary-outline-stroke text-left"
              >
                <span>Chèn snippet</span>
                <span aria-hidden="true" className="text-lg text-text-tertiary">
                  ›
                </span>
              </Button>
            ) : null}
          </div>
        ) : mode === "personalization" ? (
          <div className="space-y-3 px-4 py-4">
            <div className="space-y-1.5">
              <span className="block text-sm font-semibold text-text-primary">
                Loại
              </span>
              {isLoadingTokens ? (
                <p className="rounded-md border border-dashed border-card-border px-3 py-2 text-sm text-text-tertiary">
                  Đang tải danh sách token...
                </p>
              ) : tokensError ? (
                <p className="rounded-md border border-dashed border-button-error-outline-stroke px-3 py-2 text-sm text-button-error-outline-text">
                  {tokensError}
                </p>
              ) : null}
              <Select
                aria-label="Loại biến cá nhân hóa"
                value={activeType}
                isDisabled={
                  isLoadingTokens ||
                  Boolean(tokensError) ||
                  tokenGroups.length === 0
                }
                onChange={(value) =>
                  handleTypeChange(String(value ?? "student"))
                }
                className="gap-0"
              >
                <SelectTrigger className="h-10 rounded-md border-button-primary-outline-stroke bg-background-white-primary px-3 text-sm shadow-none">
                  <SelectValue>{selectedTypeLabel}</SelectValue>
                  <SelectIndicator>
                    <ChevronDown size={15} />
                  </SelectIndicator>
                </SelectTrigger>
                <SelectContent>
                  {tokenGroups.map((type) => (
                    <SelectItem
                      key={type.id}
                      id={type.id}
                      textValue={type.label}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-semibold text-text-primary">
                Token
              </span>
              <Select
                aria-label="Token biến cá nhân hóa"
                value={selectedTokenId}
                isDisabled={
                  isLoadingTokens ||
                  Boolean(tokensError) ||
                  availableTokens.length === 0
                }
                onChange={(value) => setSelectedTokenId(String(value ?? ""))}
                className="gap-0"
              >
                <SelectTrigger className="h-10 rounded-md border-button-primary-outline-stroke bg-background-white-primary px-3 text-sm shadow-none">
                  <SelectValue>
                    {selectedToken?.label ?? "Chọn token"}
                  </SelectValue>
                  <SelectIndicator>
                    <ChevronDown size={15} />
                  </SelectIndicator>
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem
                      key={token.id}
                      id={token.id}
                      textValue={token.label}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{token.label}</span>
                        <span className="truncate text-xs text-text-tertiary">
                          {token.sourceType === "user_value"
                            ? "Nhập trong mẫu"
                            : token.sourceType === "admin_value"
                              ? "Giá trị dùng chung"
                              : token.sourceType === "context"
                                ? "Theo ngữ cảnh"
                                : "Từ dữ liệu"}{" "}
                          · {"{{" + token.value + "}}"}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 px-4 py-4">
            <span className="block text-sm font-semibold text-text-primary">
              Snippet
            </span>
            {isLoadingSnippets ? (
              <p className="rounded-md border border-dashed border-card-border px-3 py-3 text-sm text-text-tertiary">
                Đang tải snippet...
              </p>
            ) : snippetsError ? (
              <p className="rounded-md border border-dashed border-button-error-outline-stroke px-3 py-3 text-sm text-button-error-outline-text">
                {snippetsError}
              </p>
            ) : snippets.length === 0 ? (
              <p className="rounded-md border border-dashed border-card-border px-3 py-3 text-sm text-text-tertiary">
                Chưa có snippet khả dụng.
              </p>
            ) : (
              <Select
                aria-label="Chọn snippet"
                value={selectedSnippetId}
                onChange={(value) => setSelectedSnippetId(String(value ?? ""))}
                className="gap-0"
              >
                <SelectTrigger className="h-10 rounded-md border-button-primary-outline-stroke bg-background-white-primary px-3 text-sm shadow-none">
                  <SelectValue>
                    {selectedSnippet?.internalName ?? "Chọn snippet"}
                  </SelectValue>
                  <SelectIndicator>
                    <ChevronDown size={15} />
                  </SelectIndicator>
                </SelectTrigger>
                <SelectContent>
                  {snippets.map((snippet) => (
                    <SelectItem
                      key={snippet.id}
                      id={snippet.id}
                      textValue={snippet.internalName}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{snippet.internalName}</span>
                        <span className="truncate text-xs text-text-tertiary">
                          #{snippet.shortcut} ·{" "}
                          {snippet.sharing === "private"
                            ? "Riêng tư"
                            : "Công khai"}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {mode !== "menu" ? (
          <div className="flex justify-end gap-2 border-t border-card-border px-4 py-3">
            <Button
              appearance="outline"
              size="sm"
              onPress={() => setIsOpen(false)}
              className="border-button-primary-outline-stroke"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              isDisabled={
                mode === "personalization"
                  ? !selectedToken
                  : !selectedSnippet || !onInsertSnippet
              }
              onPress={
                mode === "personalization" ? handleInsert : handleInsertSnippet
              }
            >
              Chèn
            </Button>
          </div>
        ) : null}
      </Popover>
    </DialogTrigger>
  );
}
