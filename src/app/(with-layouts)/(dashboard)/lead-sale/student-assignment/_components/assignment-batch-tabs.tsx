"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import AssignmentBatchHistory from "./assignment-batch-history";
import AssignmentBatchHeader from "./assignment-batch-header";
import AssignmentBatchWorkflow from "./assignment-batch-workflow";
import AssignmentHistoryHeader from "../../assignment-history/_components/assignment-history-header";

export const ASSIGNMENT_TAB = "assignment";
export const HISTORY_TAB = "history";

type AssignmentTab = typeof ASSIGNMENT_TAB | typeof HISTORY_TAB;

export default function AssignmentBatchTabs({
  activeTab,
}: {
  activeTab: AssignmentTab;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function changeTab(nextTab: string) {
    router.replace(
      nextTab === HISTORY_TAB ? `${pathname}?tab=${HISTORY_TAB}` : pathname,
      {
        scroll: false,
      },
    );
  }

  const tabClassName =
    "group relative flex min-h-11 shrink-0 cursor-pointer items-center px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:text-primary-500 data-[focus-visible]:rounded-md data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500";

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => changeTab(String(key))}
      className="space-y-6"
    >
      <TabList
        aria-label="Khu vực phân công Lead"
        className="flex min-w-0 gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Tab id={ASSIGNMENT_TAB} className={tabClassName}>
          Phân công Lead
          <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
        </Tab>
        <Tab id={HISTORY_TAB} className={tabClassName}>
          Lịch sử phân công
          <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
        </Tab>
      </TabList>

      <TabPanel id={ASSIGNMENT_TAB} className="space-y-6 outline-none">
        <AssignmentBatchHeader />
        <AssignmentBatchWorkflow />
      </TabPanel>
      <TabPanel id={HISTORY_TAB} className="space-y-6 outline-none">
        <AssignmentHistoryHeader />
        <AssignmentBatchHistory />
      </TabPanel>
    </Tabs>
  );
}
