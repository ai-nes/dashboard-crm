"use client";

import type { DetailTabItem } from "@/components/common/detail-tabs";
import DetailTabs from "@/components/common/detail-tabs";
import type {
  StudentCallRecord,
  StudentZaloMessage,
} from "@/services/api/students/types";

import StudentCallsTab from "./student-calls-tab";
import StudentZaloTab from "./student-zalo-tab";

interface StudentInteractionsTabsProps {
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
  calls,
  messages,
  isCallsLoading = false,
  isZaloLoading = false,
}: StudentInteractionsTabsProps) {
  const defaultSelectedKey = getDefaultInteractionTab(calls);
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
  ];

  return (
    <DetailTabs
      ariaLabel="Các phần trong tương tác"
      key={defaultSelectedKey}
      defaultSelectedKey={defaultSelectedKey}
      isSticky={false}
      tabs={interactionTabs}
    />
  );
}
