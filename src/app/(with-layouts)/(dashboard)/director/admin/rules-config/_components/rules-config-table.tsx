"use client";

import { Trash1 } from "@tailgrids/icons";

import {
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTablePagination,
  AdminTableRoot,
  AdminTableRow,
} from "@/components/common/admin/admin-table";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { TableBody } from "@/components/tailgrids/core/table";
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
      <AdminTableRoot aria-label="Danh sách Rule">
        <AdminTableHeader>
          <AdminTableRow>
            <AdminTableHead scope="col">Mã Rule</AdminTableHead>
            <AdminTableHead scope="col">Tên Rule</AdminTableHead>
            <AdminTableHead scope="col">Nhóm</AdminTableHead>
            <AdminTableHead scope="col">Loại</AdminTableHead>
            <AdminTableHead scope="col">Trạng thái</AdminTableHead>
            <AdminTableHead scope="col">Gate</AdminTableHead>
            {canToggle ? (
              <AdminTableHead scope="col">Bật Rule</AdminTableHead>
            ) : null}
            {canDelete ? (
              <AdminTableHead scope="col">Hành động</AdminTableHead>
            ) : null}
          </AdminTableRow>
        </AdminTableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <AdminTableRow key={index}>
                  <AdminTableCell colSpan={columnCount} className="py-5">
                    <div className="h-4 animate-pulse rounded bg-background-gray-secondary" />
                  </AdminTableCell>
                </AdminTableRow>
              ))
            : null}
          {!isLoading && rules.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell
                colSpan={columnCount}
                className="py-16 text-center text-sm text-text-tertiary"
              >
                {total === 0
                  ? "Chưa có Rule nào. Tạo Rule để bắt đầu."
                  : "Không tìm thấy Rule phù hợp. Thử từ khóa hoặc bộ lọc khác."}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
          {!isLoading
            ? rules.map((rule) => (
                <AdminTableRow
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
                  <AdminTableCell className="whitespace-nowrap font-mono text-xs text-text-tertiary">
                    {rule.ruleId}
                  </AdminTableCell>
                  <AdminTableCell className="font-semibold text-primary-500">
                    {rule.ruleName}
                  </AdminTableCell>
                  <AdminTableCell className="text-text-secondary">
                    <Badge color="gray">{rule.ruleGroup}</Badge>
                  </AdminTableCell>
                  <AdminTableCell className="text-text-secondary">
                    {rule.ruleType}
                  </AdminTableCell>
                  <AdminTableCell>
                    <CrmRuleStatusBadge status={rule.status} />
                  </AdminTableCell>
                  <AdminTableCell>
                    <CrmRuleOutcomeBadge outcome={rule.gateOutcome} />
                  </AdminTableCell>
                  {canToggle ? (
                    <AdminTableCell
                      className="text-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Toggle
                        size="sm"
                        aria-label={`${rule.enabled ? "Tắt" : "Bật"} Rule ${rule.ruleName}`}
                        checked={rule.enabled}
                        disabled={!onToggle || isDeleteDisabled}
                        onChange={() => onToggle?.(rule)}
                      />
                    </AdminTableCell>
                  ) : null}
                  {canDelete ? (
                    <AdminTableCell>
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
                    </AdminTableCell>
                  ) : null}
                </AdminTableRow>
              ))
            : null}
        </TableBody>
      </AdminTableRoot>
      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={onPageChange}
        isDisabled={isLoading || isDeleteDisabled}
      />
    </>
  );
}
