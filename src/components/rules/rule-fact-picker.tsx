"use client";

import { Check, ChevronDown, Plus, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { cn } from "@/utils/cn";
import type { CrmFactMetadata } from "@/services/api/rules-config";

import { factLabel } from "./rule-condition-model";

interface RuleFactPickerProps {
  facts: CrmFactMetadata[];
  onSelect: (fact: string) => void;
  triggerLabel?: string;
  className?: string;
  showPlus?: boolean;
  selectedFact?: string;
  ownerId?: string;
  disabled?: boolean;
}

export function RuleFactPicker({
  facts,
  onSelect,
  triggerLabel = "Thêm điều kiện",
  className,
  showPlus = true,
  selectedFact,
  ownerId,
  disabled,
}: RuleFactPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");

  const filteredFacts = useMemo(
    () =>
      facts.filter((item) =>
        `${factLabel(item.fact)} ${item.fact}`.toLocaleLowerCase("vi-VN").includes(normalizedSearch),
      ),
    [facts, normalizedSearch],
  );

  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    if (!nextIsOpen) setSearch("");
  };

  const handleSelect = (fact: string) => {
    onSelect(fact);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <OverlayWrapper isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="primary"
        appearance="outline"
        size="md"
        isDisabled={disabled}
        className={cn("bg-card-surface-area", !showPlus && "justify-between text-left font-normal", className)}
      >
        {showPlus ? <Plus size={17} aria-hidden="true" /> : null}
        {triggerLabel}
        {!showPlus ? <ChevronDown size={16} aria-hidden="true" /> : null}
      </Button>

      <Popover
        placement="bottom"
        {...(ownerId ? { "data-condition-owner": ownerId } : {})}
        className="w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-card-border bg-card-surface-area p-0 shadow-lg"
      >
        <div className="border-b border-card-border p-3">
          <div className="relative">
            <Search1
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-icon-tertiary"
            />
            <Input
              autoFocus
              aria-label="Tìm fact"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm fact..."
              className="h-9 w-full rounded-lg py-1.5 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="max-h-[min(24rem,calc(100dvh-7rem))] overflow-y-auto px-1.5 py-2">
          {filteredFacts.length > 0 ? (
            <div className="space-y-0.5">
              {filteredFacts.map((item) => (
                <Button
                  key={item.fact}
                  variant="primary"
                  appearance="ghost"
                  size="md"
                  aria-pressed={selectedFact === item.fact}
                  className="h-auto w-full flex-col items-start gap-0 rounded-md px-2.5 py-1.5 text-left hover:bg-background-gray-secondary_alt"
                  onPress={() => handleSelect(item.fact)}
                >
                  <span className="flex w-full items-center justify-between gap-2 font-semibold text-text-secondary">
                    {factLabel(item.fact)}
                    {selectedFact === item.fact ? <Check size={16} aria-hidden="true" /> : null}
                  </span>
                  <span className="font-mono text-xs text-text-tertiary">{item.fact}</span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-8 text-center text-sm text-text-tertiary">Không tìm thấy fact phù hợp.</p>
          )}
        </div>
      </Popover>
    </OverlayWrapper>
  );
}
