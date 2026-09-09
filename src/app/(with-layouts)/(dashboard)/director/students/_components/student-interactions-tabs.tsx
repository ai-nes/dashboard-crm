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
}

export default function StudentInteractionsTabs({
  calls,
  messages,
}: StudentInteractionsTabsProps) {
  const interactionTabs: DetailTabItem[] = [
    {
      id: "zalo",
      label: "Zalo",
      content: <StudentZaloTab messages={messages} />,
    },
    {
      id: "calls",
      label: "Cuộc gọi",
      content: <StudentCallsTab calls={calls} />,
    },
  ];

  return (
    <DetailTabs
      ariaLabel="Các phần trong tương tác"
      defaultSelectedKey="zalo"
      isSticky={false}
      tabs={interactionTabs}
    />
  );
}
