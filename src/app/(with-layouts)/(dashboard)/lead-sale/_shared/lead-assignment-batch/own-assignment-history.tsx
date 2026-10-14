"use client";

import { useState } from "react";
import { Tab, TabList, TabPanel, Tabs, type Key } from "react-aria-components";
import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmCapability } from "@/components/common/auth/permissions";
import AssignmentHistoryHeader from "../../assignment-history/_components/assignment-history-header";
import AssignmentBatchHistory, {
  type HistoryStatus,
} from "../../student-assignment/_components/assignment-batch-history";
import LeadSupportQueue from "../lead-support-queue/lead-support-queue";

/** Sale and CTV Sale only see the outcome of leads assigned to them. */
const OWN_HISTORY_STATUSES: readonly HistoryStatus[] = ["assigned"];

const tabClassName =
  "group relative flex min-h-11 shrink-0 cursor-pointer items-center px-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary data-[selected]:text-primary-500 data-[focus-visible]:rounded-md data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-primary-500";

function TabIndicator() {
  return (
    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-500 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
  );
}

export default function OwnAssignmentHistory() {
  const { user, isLoading } = useAuth();
  const canSupport = !isLoading && hasCrmCapability(user, "lead.support");
  const [tab, setTab] = useState<Key>("history");
  const selected = canSupport ? tab : "history";

  return (
    <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 px-2 py-5 pb-10 lg:px-6">
      <Tabs
        selectedKey={selected}
        onSelectionChange={setTab}
        className="space-y-6"
      >
        <TabList
          aria-label="Khu vực phân công Lead"
          className="flex min-w-0 gap-1 overflow-x-auto border-b border-card-border px-1"
        >
          <Tab id="history" className={tabClassName}>
            Lịch sử phân công
            <TabIndicator />
          </Tab>
          {canSupport && (
            <Tab id="support" className={tabClassName}>
              Lead cần bổ sung
              <TabIndicator />
            </Tab>
          )}
        </TabList>
        <TabPanel id="history" className="space-y-6 outline-none">
          <AssignmentHistoryHeader description="Các Lead đã được phân công cho bạn và thời điểm phân công." />
          <AssignmentBatchHistory statuses={OWN_HISTORY_STATUSES} />
        </TabPanel>
        {canSupport && (
          <TabPanel id="support" className="space-y-6 outline-none">
            <AssignmentHistoryHeader description="Lead chưa có người phụ trách trong cơ sở của bạn đang thiếu dữ liệu. Bổ sung xong, hệ thống kiểm tra lại và tự phân công." />
            <LeadSupportQueue />
          </TabPanel>
        )}
      </Tabs>
    </main>
  );
}
