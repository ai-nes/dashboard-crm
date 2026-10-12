"use client";
import { useState } from "react";
import { Search1 } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";
import type { RecordExportField } from "@/services/api/record-export/types";
import { toggleExportColumn } from "./record-export-state";

export function RecordExportColumnsPicker({
  fields,
  columns,
  defaults,
  onChange,
}: {
  fields: RecordExportField[];
  columns: string[];
  defaults: string[];
  onChange: (columns: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const matching = fields.filter((field) =>
    `${field.label} ${field.group}`
      .toLocaleLowerCase("vi")
      .includes(search.toLocaleLowerCase("vi")),
  );
  const groups = [...new Set(matching.map((field) => field.group))];
  function move(index: number, delta: number) {
    const next = [...columns];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <section className="space-y-4" aria-label="Chọn cột xuất">
        <div className="sticky top-5 z-10 flex flex-wrap items-center gap-2 bg-background-white-primary before:absolute before:inset-x-0 before:-top-5 before:h-5 before:bg-background-white-primary after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-background-white-primary">
          <InputGroup className="h-9 min-w-40 flex-1">
            <InputGroupAddon className="text-icon-tertiary">
              <Search1 size={16} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm cột xuất"
              placeholder="Tìm cột dữ liệu…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 py-2"
            />
          </InputGroup>
          <Button
            appearance="outline"
            size="sm"
            onPress={() => onChange(fields.map((field) => field.id))}
          >
            Chọn tất cả cột
          </Button>
          <Button appearance="ghost" size="sm" onPress={() => onChange([])}>
            Bỏ chọn cột
          </Button>
          <Button
            appearance="ghost"
            size="sm"
            onPress={() => onChange(defaults)}
          >
            Cột mặc định
          </Button>
        </div>
        {groups.map((group) => (
          <fieldset
            key={group}
            className="rounded-lg border border-card-border p-4"
          >
            <legend className="px-1 text-sm font-semibold text-text-primary">
              {group}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {matching
                .filter((field) => field.group === group)
                .map((field) => (
                  <Checkbox
                    key={field.id}
                    isSelected={columns.includes(field.id)}
                    onChange={(selected) =>
                      onChange(toggleExportColumn(columns, field.id, selected))
                    }
                  >
                    {field.label}
                  </Checkbox>
                ))}
            </div>
          </fieldset>
        ))}
        {matching.length === 0 && (
          <p className="text-sm text-text-tertiary">
            Không tìm thấy cột phù hợp.
          </p>
        )}
      </section>
      <section
        className="min-w-0 space-y-3 lg:sticky lg:top-5 lg:self-start"
        aria-label="Thứ tự cột xuất"
      >
        <h3 className="font-semibold text-text-primary">
          Đã chọn {columns.length} cột
        </h3>
        <p className="text-sm text-text-tertiary">
          Thứ tự dưới đây được giữ trong preview và Excel.
        </p>
        <ScrollArea className="overflow-hidden rounded-lg border border-card-border lg:max-h-[calc(100dvh-22rem)]">
          <ScrollAreaViewport className="lg:max-h-[calc(100dvh-22rem)]">
            <ol className="divide-y divide-card-border">
              {columns.map((id, index) => (
                <li key={id} className="flex min-w-0 items-center gap-2 p-3">
                  <span className="text-xs text-text-tertiary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-text-primary">
                    {fields.find((field) => field.id === id)?.label ??
                      "Cột không còn được phép"}
                  </span>
                  <Button
                    appearance="ghost"
                    size="sm"
                    aria-label={`Đưa cột ${index + 1} lên`}
                    isDisabled={index === 0}
                    onPress={() => move(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    appearance="ghost"
                    size="sm"
                    aria-label={`Đưa cột ${index + 1} xuống`}
                    isDisabled={index === columns.length - 1}
                    onPress={() => move(index, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    appearance="ghost"
                    size="sm"
                    aria-label={`Bỏ cột ${index + 1}`}
                    onPress={() =>
                      onChange(columns.filter((column) => column !== id))
                    }
                  >
                    Bỏ
                  </Button>
                </li>
              ))}
            </ol>
          </ScrollAreaViewport>
          <ScrollBar />
        </ScrollArea>
      </section>
    </div>
  );
}
