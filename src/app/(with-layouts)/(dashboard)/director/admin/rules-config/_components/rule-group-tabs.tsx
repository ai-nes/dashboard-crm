"use client";

import { Pencil1, Plus, Trash1 } from "@tailgrids/icons";
import { toast } from "sonner";
import { Tab, TabList, Tabs } from "react-aria-components";

import {
  useCreateCrmRuleGroupMutation,
  useDeleteCrmRuleGroupMutation,
  useUpdateCrmRuleGroupMutation,
} from "@/hooks/use-rules-config-queries";
import { Button } from "@/components/tailgrids/core/button";
import type { CrmRuleGroupSummary } from "@/services/api/rules-config";

interface RuleGroupTabsProps {
  groups: CrmRuleGroupSummary[];
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  versionName?: string;
  versionRevision?: number;
  onChanged?: () => void;
}

export function RuleGroupTabs({
  groups,
  selectedGroup,
  onGroupChange,
  isLoading = false,
  canEdit = false,
  versionName = "",
  versionRevision = 0,
  onChanged,
}: RuleGroupTabsProps) {
  const createMutation = useCreateCrmRuleGroupMutation();
  const updateMutation = useUpdateCrmRuleGroupMutation();
  const deleteMutation = useDeleteCrmRuleGroupMutation();
  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const addGroup = async () => {
    const code = window.prompt("Mã nhóm (lower_snake_case):")?.trim().toLowerCase();
    const label = code ? window.prompt("Tên nhóm:", code.replaceAll("_", " "))?.trim() : "";
    if (!code || !label) return;
    try {
      await createMutation.mutateAsync({ versionName, expectedVersionRevision: versionRevision, code, label });
      toast.success("Đã thêm nhóm Rule.");
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thêm nhóm Rule.");
    }
  };

  const renameGroup = async (group: CrmRuleGroupSummary) => {
    const label = window.prompt("Tên nhóm mới:", group.label)?.trim();
    if (!label || label === group.label) return;
    try {
      await updateMutation.mutateAsync({ versionName, expectedVersionRevision: versionRevision, code: group.groupId, label });
      toast.success("Đã cập nhật nhóm Rule.");
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật nhóm Rule.");
    }
  };

  const removeGroup = async (group: CrmRuleGroupSummary) => {
    if (group.count > 0 || !window.confirm(`Xóa nhóm ${group.label}?`)) return;
    try {
      await deleteMutation.mutateAsync({ versionName, expectedVersionRevision: versionRevision, code: group.groupId });
      toast.success("Đã xóa nhóm Rule.");
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa nhóm Rule.");
    }
  };

  return (
    <Tabs
      selectedKey={selectedGroup}
      onSelectionChange={(key) => onGroupChange(String(key))}
      className="min-w-0"
    >
      <TabList
        aria-label="Nhóm Rule"
        className="flex min-w-0 gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Tab
          id="all"
          className="group relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:text-primary-500 data-[focus-visible]:rounded-md data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500"
        >
          Tất cả
          <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
            {isLoading ? "..." : groups.reduce((total, group) => total + group.count, 0)}
          </span>
          <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
        </Tab>
        {groups.map((group) => (
          <Tab
            key={group.groupId}
            id={group.groupId}
            className="group relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:text-primary-500 data-[focus-visible]:rounded-md data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500"
          >
            {group.label}
            <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
              {group.count}
            </span>
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
            {canEdit ? (
              <span className="ml-1 inline-flex gap-0.5">
                <Button type="button" iconOnly size="xs" appearance="ghost" aria-label={`Đổi tên nhóm ${group.label}`} isDisabled={busy} onPress={() => void renameGroup(group)}>
                  <Pencil1 size={12} aria-hidden="true" />
                </Button>
                <Button type="button" iconOnly size="xs" appearance="ghost" aria-label={`Xóa nhóm ${group.label}`} isDisabled={busy || group.count > 0} onPress={() => void removeGroup(group)}>
                  <Trash1 size={12} aria-hidden="true" />
                </Button>
              </span>
            ) : null}
          </Tab>
        ))}
        {canEdit && versionName ? (
          <Button type="button" size="sm" appearance="ghost" className="ml-1 shrink-0" isDisabled={busy} onPress={() => void addGroup()}>
            <Plus size={15} aria-hidden="true" /> Thêm nhóm
          </Button>
        ) : null}
      </TabList>
    </Tabs>
  );
}
