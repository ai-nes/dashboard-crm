"use client";

import { useState } from "react";
import { Plus } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import type { ScoreRule } from "@/services/api/admin-catalog";
import { CatalogPagination } from "./admin-catalog-ui";
import ScoreRuleInlineRow from "./score-rule-inline-row";
import {
  createScoreRuleDraft,
  getScoreRuleKindMeta,
  formatScoreRuleEffect,
} from "./score-rule-model";

const PAGE_SIZE = 5;

export default function ScoreRulesInlineEditor({
  rules,
  canEdit,
  isDisabled,
  onChange,
}: {
  rules: ScoreRule[];
  canEdit: boolean;
  isDisabled: boolean;
  onChange: (rules: ScoreRule[]) => void;
}) {
  const [page, setPage] = useState(1);
  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(rules.length / PAGE_SIZE)),
  );
  const start = (safePage - 1) * PAGE_SIZE;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-secondary">
          {canEdit
            ? "Chọn giá trị để chỉnh sửa trực tiếp."
            : "Cấu hình các thành phần điểm."}
        </p>
        {canEdit ? (
          <Button
            type="button"
            size="sm"
            appearance="outline"
            isDisabled={isDisabled}
            onPress={() => {
              onChange([...rules, createScoreRuleDraft()]);
              setPage(Math.ceil((rules.length + 1) / PAGE_SIZE));
            }}
          >
            <Plus size={15} aria-hidden="true" />
            Thêm rubric
          </Button>
        ) : null}
      </div>
      {rules.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          Chưa có rubric nào.
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-card-border">
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-background-gray-secondary/60 text-xs text-text-secondary">
            <tr>
              <th className="w-[26%] px-4 py-3 font-medium">Tín hiệu</th>
              <th className="w-[19%] px-4 py-3 font-medium">Loại</th>
              <th className="px-4 py-3 font-medium">Cách tính</th>
              <th className="w-[15%] px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rules.slice(start, start + PAGE_SIZE).map((rule, index) =>
              canEdit ? (
                <ScoreRuleInlineRow
                  key={start + index}
                  rule={rule}
                  isDisabled={isDisabled}
                  onChange={(patch) =>
                    onChange(
                      rules.map((item, ruleIndex) =>
                        ruleIndex === start + index
                          ? { ...item, ...patch }
                          : item,
                      ),
                    )
                  }
                />
              ) : (
                <tr
                  key={start + index}
                  className="border-t border-card-border text-sm text-text-secondary"
                >
                  <td className="px-4 py-3">
                    {rule.signal || "Theo thời gian"}
                  </td>
                  <td className="px-4 py-3">
                    {getScoreRuleKindMeta(rule.rule_kind).label}
                  </td>
                  <td className="px-4 py-3">{formatScoreRuleEffect(rule)}</td>
                  <td className="px-4 py-3">
                    {rule.is_active === false ? "Đã tắt" : "Đang dùng"}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      {rules.length > PAGE_SIZE ? (
        <CatalogPagination
          page={safePage}
          total={rules.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
