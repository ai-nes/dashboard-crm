"use client";

import { ChevronDown, ChevronUp, Trash1 } from "@tailgrids/icons";
import { useState, type DragEvent } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { AdminSearchInput } from "@/components/common/admin/admin-search-input";
import type {
  AdmissionDocumentTypeOption,
  AdmissionMethodOption,
} from "@/services/api/admission-profile-catalog";

import { AdmissionProfileTemplateDocumentDetailPage } from "./admission-profile-template-document-detail-page";
import { moveCatalogOrderItem } from "./catalog-ordering-panel";
import {
  documentTypeLabel,
  requirementModeLabel,
  updateRequirement,
  type RequirementForm,
} from "./admission-profile-template-editor-types";

export function AdmissionProfileTemplateDocuments({
  requirements,
  documentTypes,
  admissionMethods,
  isSaving,
  selectedGroup,
  documentSearch,
  selectedIndex,
  onAdd,
  onRemove,
  onSelectGroup,
  onSearchChange,
  onSelect,
  onCloseDetail,
  onRequirementsChange,
}: {
  requirements: RequirementForm[];
  documentTypes: AdmissionDocumentTypeOption[];
  admissionMethods: AdmissionMethodOption[];
  isSaving: boolean;
  selectedGroup: string;
  documentSearch: string;
  selectedIndex: number | null;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSelectGroup: (group: string) => void;
  onSearchChange: (value: string) => void;
  onSelect: (index: number) => void;
  onCloseDetail: () => void;
  onRequirementsChange: (requirements: RequirementForm[]) => void;
}) {
  const requirementGroups = Array.from(
    new Set(
      requirements.map(
        (requirement) =>
          requirement.requirement_group.trim() || "Chưa phân nhóm",
      ),
    ),
  );
  const showGroupFilter = requirementGroups.length > 1;
  const showSearch = requirements.length > 3;
  const normalizedSearch = documentSearch.trim().toLowerCase();
  const canReorder = !normalizedSearch && selectedGroup === "all";
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const visibleRequirements = requirements
    .map((requirement, index) => ({ requirement, index }))
    .filter(({ requirement }) => {
      const group = requirement.requirement_group.trim() || "Chưa phân nhóm";
      const matchesGroup = selectedGroup === "all" || group === selectedGroup;
      const matchesSearch =
        !normalizedSearch ||
        `${documentTypeLabel(requirement.document_type, documentTypes)} ${requirement.document_type} ${requirement.section_code} ${requirement.requirement_group}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesGroup && matchesSearch;
    });

  const moveRequirement = (fromIndex: number, toIndex: number) => {
    if (!canReorder) return;
    onRequirementsChange(
      moveCatalogOrderItem(requirements, fromIndex, toIndex).map(
        (requirement, index) => ({
          ...requirement,
          order_display: String(index + 1),
        }),
      ),
    );
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    event.preventDefault();
    if (draggedIndex !== null) moveRequirement(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const selectedRequirement =
    selectedIndex === null ? null : requirements[selectedIndex];
  if (selectedRequirement && selectedIndex !== null) {
    return (
      <AdmissionProfileTemplateDocumentDetailPage
        requirement={selectedRequirement}
        documentTypes={documentTypes}
        admissionMethods={admissionMethods}
        isSaving={isSaving}
        onBack={onCloseDetail}
        onChange={(patch) =>
          onRequirementsChange(
            updateRequirement(requirements, selectedIndex, patch),
          )
        }
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="border-b border-card-border px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Tài liệu cần nộp
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Chỉ các tài liệu trong danh sách này mới xuất hiện trong checklist
              nhập học.
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              {canReorder
                ? "Kéo thả hoặc dùng nút lên/xuống để thay đổi thứ tự."
                : "Bỏ tìm kiếm và bộ lọc nhóm để sắp xếp."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {showSearch && (
              <>
                <AdminSearchInput
                  value={documentSearch}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Tìm tên tài liệu"
                  aria-label="Tìm tài liệu"
                  className="w-48"
                />
                <span className="whitespace-nowrap text-xs text-text-tertiary">
                  {visibleRequirements.length}/{requirements.length}
                </span>
              </>
            )}
            <Button
              size="sm"
              appearance="outline"
              onPress={onAdd}
              isDisabled={isSaving || documentTypes.length === 0}
            >
              + Thêm tài liệu
            </Button>
          </div>
        </div>
      </div>

      {showGroupFilter && (
        <div className="border-b border-card-border px-4 py-3 sm:px-5">
          <div
            className="flex min-w-0 gap-1.5 overflow-x-auto pb-1"
            aria-label="Lọc theo nhóm tài liệu"
          >
            <button
              type="button"
              onClick={() => onSelectGroup("all")}
              aria-pressed={selectedGroup === "all"}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedGroup === "all" ? "bg-badge-primary-background text-badge-primary-text" : "bg-background-gray-secondary text-text-secondary hover:text-text-primary"}`}
            >
              Tất cả{" "}
              <span className="ml-1 text-text-tertiary">
                {requirements.length}
              </span>
            </button>
            {requirementGroups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => onSelectGroup(group)}
                aria-pressed={selectedGroup === group}
                className={`max-w-48 shrink-0 truncate rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedGroup === group ? "bg-badge-primary-background text-badge-primary-text" : "bg-background-gray-secondary text-text-secondary hover:text-text-primary"}`}
              >
                {group}{" "}
                <span className="ml-1 text-text-tertiary">
                  {
                    requirements.filter(
                      (requirement) =>
                        (requirement.requirement_group.trim() ||
                          "Chưa phân nhóm") === group,
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-card-border">
        {visibleRequirements.map(({ requirement, index }) => {
          const isSelected = selectedIndex === index;
          return (
            <div
              key={`${requirement.document_type}-${index}`}
              draggable={canReorder && !isSaving}
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5 ${isSelected ? "bg-badge-primary-background/40" : "bg-card-background"} ${draggedIndex === index ? "opacity-70" : ""}`}
            >
              {canReorder && (
                <span
                  className="cursor-grab select-none text-lg leading-none text-text-tertiary active:cursor-grabbing"
                  title="Kéo để sắp xếp"
                  aria-hidden="true"
                >
                  ⋮⋮
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-pressed={isSelected}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1.5 text-left outline-none transition-colors hover:bg-background-gray-secondary/50 focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="shrink-0 font-mono text-xs text-text-tertiary">
                  #{index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-primary">
                    {documentTypeLabel(
                      requirement.document_type,
                      documentTypes,
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-text-tertiary">
                    {requirement.requirement_group.trim() || "Chưa phân nhóm"} ·{" "}
                    {requirementModeLabel(requirement.requirement_mode)}
                  </span>
                </span>
                <Badge
                  color={requirement.is_required ? "primary" : "gray"}
                  size="sm"
                >
                  {requirement.is_required ? "Bắt buộc" : "Tùy chọn"}
                </Badge>
              </button>
              {canReorder && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    aria-label={`Đưa tài liệu ${documentTypeLabel(requirement.document_type, documentTypes)} lên trên`}
                    iconOnly
                    size="sm"
                    appearance="ghost"
                    onPress={() => moveRequirement(index, index - 1)}
                    isDisabled={isSaving || index === 0}
                  >
                    <ChevronUp size={15} aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label={`Đưa tài liệu ${documentTypeLabel(requirement.document_type, documentTypes)} xuống dưới`}
                    iconOnly
                    size="sm"
                    appearance="ghost"
                    onPress={() => moveRequirement(index, index + 1)}
                    isDisabled={isSaving || index === requirements.length - 1}
                  >
                    <ChevronDown size={15} aria-hidden="true" />
                  </Button>
                </div>
              )}
              <Button
                aria-label={`Xóa ${documentTypeLabel(requirement.document_type, documentTypes)}`}
                iconOnly
                size="sm"
                appearance="ghost"
                variant="danger"
                onPress={() => onRemove(index)}
                isDisabled={isSaving}
              >
                <Trash1 size={15} aria-hidden="true" />
              </Button>
            </div>
          );
        })}
        {visibleRequirements.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-text-primary">
              {requirements.length
                ? "Không có tài liệu phù hợp"
                : "Chưa có tài liệu nào"}
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              {requirements.length
                ? "Thử đổi từ khóa hoặc nhóm tài liệu."
                : "Thêm tài liệu đầu tiên để tạo checklist nhập học."}
            </p>
            {!requirements.length && (
              <Button
                className="mt-4"
                size="sm"
                onPress={onAdd}
                isDisabled={isSaving || documentTypes.length === 0}
              >
                + Thêm tài liệu
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
