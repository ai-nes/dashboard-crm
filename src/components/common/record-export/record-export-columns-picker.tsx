"use client";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
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
        <Input
          aria-label="Tìm cột xuất"
          placeholder="Tìm cột dữ liệu…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
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
      <section className="min-w-0 space-y-3" aria-label="Thứ tự cột xuất">
        <h3 className="font-semibold text-text-primary">
          Đã chọn {columns.length} cột
        </h3>
        <p className="text-sm text-text-tertiary">
          Thứ tự dưới đây được giữ trong preview và Excel.
        </p>
        <ol className="divide-y divide-card-border rounded-lg border border-card-border">
          {columns.map((id, index) => (
            <li key={id} className="flex min-w-0 items-center gap-2 p-3">
              <span className="text-xs text-text-tertiary">{index + 1}</span>
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
      </section>
    </div>
  );
}
