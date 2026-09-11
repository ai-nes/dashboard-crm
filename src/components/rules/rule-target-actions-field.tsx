"use client";

import { Check, ChevronDown, Close, Plus, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { Popover } from "@/components/tailgrids/core/popover";
import { useNbaActionsQuery } from "@/hooks/use-nba-actions-queries";
import { cn } from "@/utils/cn";

interface RuleTargetActionsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function RuleTargetActionsField({ value, onChange, disabled }: RuleTargetActionsFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const actionsQuery = useNbaActionsQuery({ pageLength: 100 });
  const actions = useMemo(() => actionsQuery.data?.actions ?? [], [actionsQuery.data]);

  const labelByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const action of actions) map.set(action.code, action.displayName);
    return map;
  }, [actions]);

  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");
  const filteredActions = useMemo(
    () =>
      actions.filter((item) =>
        `${item.displayName} ${item.code}`.toLocaleLowerCase("vi-VN").includes(normalizedSearch),
      ),
    [actions, normalizedSearch],
  );

  const toggle = (code: string) => {
    onChange(value.includes(code) ? value.filter((item) => item !== code) : [...value, code]);
  };

  const remove = (code: string) => onChange(value.filter((item) => item !== code));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((code) => (
        <span
          key={code}
          className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-background-gray-secondary py-1 pr-1.5 pl-2.5 text-xs font-medium text-text-secondary"
        >
          <span className="max-w-40 truncate">{labelByCode.get(code) ?? code}</span>
          {!disabled ? (
            <button
              type="button"
              aria-label={`Bỏ chọn ${labelByCode.get(code) ?? code}`}
              className="rounded-full p-0.5 text-text-tertiary hover:bg-background-gray-secondary_alt hover:text-text-primary"
              onClick={() => remove(code)}
            >
              <Close size={12} aria-hidden="true" />
            </button>
          ) : null}
        </span>
      ))}

      <OverlayWrapper isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button
          variant="primary"
          appearance="outline"
          size="sm"
          isDisabled={disabled}
          className="bg-card-surface-area"
        >
          <Plus size={15} aria-hidden="true" />
          Thêm action
          <ChevronDown size={14} aria-hidden="true" />
        </Button>

        <Popover
          placement="bottom start"
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
                aria-label="Tìm action"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm action..."
                className="h-9 w-full rounded-lg py-1.5 pr-3 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="max-h-[min(24rem,calc(100dvh-7rem))] overflow-y-auto px-1.5 py-2">
            {actionsQuery.isPending ? (
              <p className="px-3 py-8 text-center text-sm text-text-tertiary">Đang tải danh mục action…</p>
            ) : filteredActions.length > 0 ? (
              <div className="space-y-0.5">
                {filteredActions.map((item) => {
                  const selected = value.includes(item.code);
                  return (
                    <Button
                      key={item.code}
                      variant="primary"
                      appearance="ghost"
                      size="md"
                      aria-pressed={selected}
                      className={cn(
                        "h-auto w-full flex-col items-start gap-0 rounded-md px-2.5 py-1.5 text-left hover:bg-background-gray-secondary_alt",
                        selected && "bg-background-gray-secondary_alt",
                      )}
                      onPress={() => toggle(item.code)}
                    >
                      <span className="flex w-full items-center justify-between gap-2 font-semibold text-text-secondary">
                        {item.displayName}
                        {selected ? <Check size={16} aria-hidden="true" /> : null}
                      </span>
                      <span className="font-mono text-xs text-text-tertiary">{item.code}</span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="px-3 py-8 text-center text-sm text-text-tertiary">Không tìm thấy action phù hợp.</p>
            )}
          </div>
        </Popover>
      </OverlayWrapper>
    </div>
  );
}
