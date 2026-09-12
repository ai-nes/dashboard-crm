"use client";

import { Trash1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { Toggle } from "@/components/tailgrids/core/toggle";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import {
  CrmRuleOutcomeBadge,
  CrmRuleStatusBadge,
} from "@/components/rules/rule-status-badges";
import type { CrmRule } from "@/services/api/rules-config";

interface RulesConfigTableProps {
  rules: CrmRule[];
  total: number;
  isLoading: boolean;
  canDelete: boolean;
  canToggle?: boolean;
  isDeleteDisabled?: boolean;
  onSelect: (rule: CrmRule) => void;
  onDelete: (rule: CrmRule) => void;
  onToggle?: (rule: CrmRule) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RulesConfigTable({
  rules,
  total,
  isLoading,
  canDelete,
  canToggle = false,
  isDeleteDisabled = false,
  onSelect,
  onDelete,
  onToggle,
  currentPage,
  totalPages,
  onPageChange,
}: RulesConfigTableProps) {
  const columnCount = 6 + (canToggle ? 1 : 0) + (canDelete ? 1 : 0);

  return (
    <>
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
            {canToggle ? (
              <TableHead scope="col" className="whitespace-nowrap">
                Bật Rule
              </TableHead>
            ) : null}
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
                  {canToggle ? (
                    <TableCell
                      className="py-5 text-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Toggle
                        size="sm"
                        aria-label={`${rule.enabled ? "Tắt" : "Bật"} Rule ${rule.ruleName}`}
                        checked={rule.enabled}
                        disabled={!onToggle || isDeleteDisabled}
                        onChange={() => onToggle?.(rule)}
                      />
                    </TableCell>
                  ) : null}
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
      {totalPages > 1 && (
        <div className="border-t border-card-border px-5 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            variant="compact"
            isDisabled={isLoading || isDeleteDisabled}
          />
        </div>
      )}
    </>
  );
}
