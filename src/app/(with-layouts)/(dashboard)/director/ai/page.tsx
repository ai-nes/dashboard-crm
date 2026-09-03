import type { Metadata } from "next";

import AlertsSubscriptionsPage from "../alerts/page";
import DataHealthPage from "../data-health/page";
import AskAdmissionAiPage from "./ask-admission/page";
import AiCenterTabs, { type AiCenterTab } from "./_components/ai-center-tabs";
import AiCommandStreamPage from "./command-stream/page";
import AiTrustModelHealthPage from "./trust-model-health/page";

export const metadata: Metadata = {
  title: "Trung tâm AI & dữ liệu",
  description:
    "Theo dõi tín hiệu, hỏi đáp, độ tin cậy, dữ liệu và cảnh báo trong một không gian làm việc.",
};

const TAB_PAGES: Record<AiCenterTab, React.ComponentType> = {
  signals: AiCommandStreamPage,
  ask: AskAdmissionAiPage,
  trust: AiTrustModelHealthPage,
  data: DataHealthPage,
  alerts: AlertsSubscriptionsPage,
};

function isAiCenterTab(value: string | undefined): value is AiCenterTab {
  return (
    value === "signals" ||
    value === "ask" ||
    value === "trust" ||
    value === "data" ||
    value === "alerts"
  );
}

export default async function AiCenterPage({
  searchParams,
}: PageProps<"/director/ai">) {
  const { tab } = await searchParams;
  const tabValue = typeof tab === "string" ? tab : undefined;
  const activeTab: AiCenterTab = isAiCenterTab(tabValue) ? tabValue : "signals";
  const ActivePage = TAB_PAGES[activeTab];

  return (
    <>
      <AiCenterTabs activeTab={activeTab} />
      <ActivePage />
    </>
  );
}
