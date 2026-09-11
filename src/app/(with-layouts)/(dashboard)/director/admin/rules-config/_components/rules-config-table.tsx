"use client";

import { Trash1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { CrmRuleOutcomeBadge, CrmRuleStatusBadge } from "@/components/rules/rule-status-badges";
import type { CrmRule } from "@/services/api/rules-config";

interface RulesConfigTableProps {
  rules: CrmRule[];
  total: number;
  isLoading: boolean;
  canDelete: boolean;
  isDeleteDisabled?: boolean;
  onSelect: (rule: CrmRule) => void;
  onDelete: (rule: CrmRule) => void;
}

export default function RulesConfigTable({
  rules,
  total,
  isLoading,
  canDelete,
  isDeleteDisabled = false,
  onSelect,
  onDelete,
}: RulesConfigTableProps) {
  const columnCount = canDelete ? 7 : 6;

  return (
    <TableRoot fullBleed className="border-0" aria-label="Danh sách Rule">
      <TableHeader className="bg-background-gray-secondary">
        <TableRow>
          <TableHead scope="col" className="whitespace-nowrap">
            Mã Rule
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Tên Rule
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Nhóm
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Loại
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Trạng thái
          </TableHead>
          <TableHead scope="col" className="whitespace-nowrap">
            Gate
          </TableHead>
          {canDelete ? (
            <TableHead scope="col" className="whitespace-nowrap">
              Hành động
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columnCount} className="py-5">
                  <div className="h-4 animate-pulse rounded bg-background-gray-secondary" />
                </TableCell>
              </TableRow>
            ))
          : null}
        {!isLoading && rules.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="py-16 text-center text-sm text-text-tertiary"
            >
              {total === 0
                ? "Chưa có Rule nào. Tạo Rule để bắt đầu."
                : "Không tìm thấy Rule phù hợp. Thử từ khóa hoặc bộ lọc khác."}
            </TableCell>
          </TableRow>
        ) : null}
        {!isLoading
          ? rules.map((rule) => (
              <TableRow
                key={rule.name}
                tabIndex={0}
                className="cursor-pointer hover:bg-background-gray-secondary_alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                onClick={() => onSelect(rule)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(rule);
                  }
                }}
              >
                <TableCell className="whitespace-nowrap py-5 font-mono text-xs text-text-tertiary">
                  {rule.ruleId}
                </TableCell>
                <TableCell className="py-5 text-sm font-semibold text-primary-500">
                  {rule.ruleName}
                </TableCell>
                <TableCell className="py-5 text-sm font-normal text-text-secondary">
                  <Badge color="gray">{rule.ruleGroup}</Badge>
                </TableCell>
                <TableCell className="py-5 text-sm font-normal text-text-secondary">
                  {rule.ruleType}
                </TableCell>
                <TableCell className="py-5 text-sm font-normal">
                  <CrmRuleStatusBadge status={rule.status} />
                </TableCell>
                <TableCell className="py-5 text-sm font-normal">
                  <CrmRuleOutcomeBadge outcome={rule.gateOutcome} />
                </TableCell>
                {canDelete ? (
                  <TableCell className="py-5 text-sm">
                    <div
                      className="inline-flex"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        iconOnly
                        size="sm"
                        variant="ghost"
                        appearance="ghost"
                        aria-label={`Xóa Rule ${rule.ruleName}`}
                        isDisabled={isDeleteDisabled}
                        className="text-text-tertiary hover:text-error-500"
                        onPress={() => onDelete(rule)}
                      >
                        <Trash1 size={16} aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          : null}
      </TableBody>
    </TableRoot>
  );
}
