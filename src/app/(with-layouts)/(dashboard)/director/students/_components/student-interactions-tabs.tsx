"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "@tailgrids/icons";

import type { DetailTabItem } from "@/components/common/detail-tabs";
import DetailTabs from "@/components/common/detail-tabs";
import { Button } from "@/components/tailgrids/core/button";
import {
  interactionIntelligenceKeys,
  useInteractionCatalogQuery,
} from "@/hooks/use-interaction-intelligence-queries";
import {
  createInteraction,
  type CreateInteractionInput,
} from "@/services/api/interaction-intelligence";
import type {
  StudentCallRecord,
  StudentZaloMessage,
} from "@/services/api/students/types";

import StudentCallsTab from "./student-calls-tab";
import StudentCreateInteractionDialog from "./student-create-interaction-dialog";
import StudentOtherInteractionsTab from "./student-other-interactions-tab";
import StudentZaloTab from "./student-zalo-tab";
import { isOtherInteractionType } from "./student-interaction-utils";

interface StudentInteractionsTabsProps {
  studentId: string;
  studentName?: string;
  calls: StudentCallRecord[];
  messages: StudentZaloMessage[];
  isCallsLoading?: boolean;
  isZaloLoading?: boolean;
}

export function getDefaultInteractionTab(
  calls: StudentCallRecord[],
): "zalo" | "calls" {
  return calls.length > 0 ? "calls" : "zalo";
}

export default function StudentInteractionsTabs({
  studentId,
  studentName,
  calls,
  messages,
  isCallsLoading = false,
  isZaloLoading = false,
}: StudentInteractionsTabsProps) {
  const defaultSelectedKey = getDefaultInteractionTab(calls);
  const normalizedStudentId = studentId.trim();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const catalogQuery = useInteractionCatalogQuery();
  const allInteractionTypes = useMemo(
    () => catalogQuery.data?.interactionTypes ?? [],
    [catalogQuery.data?.interactionTypes],
  );
  const manualInteractionTypes = useMemo(
    () =>
      allInteractionTypes.filter((type) => isOtherInteractionType(type.code)),
    [allInteractionTypes],
  );
  const createMutation = useMutation({
    mutationFn: (input: Omit<CreateInteractionInput, "student">) =>
      createInteraction({ student: normalizedStudentId, ...input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          ...interactionIntelligenceKeys.all,
          "feed",
          normalizedStudentId,
        ],
      });
      toast.success("Đã tạo tương tác thủ công.");
    },
  });

  const handleCreate = async (
    input: Omit<CreateInteractionInput, "student">,
  ) => {
    await createMutation.mutateAsync(input);
  };

  const interactionTabs: DetailTabItem[] = [
    {
      id: "zalo",
      label: "Zalo",
      content: <StudentZaloTab messages={messages} isLoading={isZaloLoading} />,
    },
    {
      id: "calls",
      label: "Cuộc gọi",
      content: <StudentCallsTab calls={calls} isLoading={isCallsLoading} />,
    },
    {
      id: "other",
      label: "Khác",
      content: (
        <StudentOtherInteractionsTab
          studentId={studentId}
          excludedInteractionIds={[
            ...calls.map((call) => call.id),
            ...messages.map((message) => message.id),
          ]}
          interactionTypes={allInteractionTypes}
        />
      ),
    },
  ];

  return (
    <>
      <DetailTabs
        ariaLabel="Các phần trong tương tác"
        key={defaultSelectedKey}
        defaultSelectedKey={defaultSelectedKey}
        isSticky={false}
        actions={
          <Button
            type="button"
            size="sm"
            onPress={() => setIsCreateDialogOpen(true)}
            isDisabled={
              !normalizedStudentId ||
              catalogQuery.isPending ||
              manualInteractionTypes.length === 0
            }
          >
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Tạo tương tác</span>
            <span className="sm:hidden">Tạo</span>
          </Button>
        }
        tabs={interactionTabs}
      />
      {isCreateDialogOpen && (
        <StudentCreateInteractionDialog
          isOpen
          onOpenChange={setIsCreateDialogOpen}
          studentName={studentName}
          interactionTypes={manualInteractionTypes}
          onCreate={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      )}
    </>
  );
}
