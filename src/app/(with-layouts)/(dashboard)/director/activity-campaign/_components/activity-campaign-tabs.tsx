import Link from "next/link";

export const ACTIVITY_CAMPAIGN_TABS = [
  { id: "field", label: "Hoạt động trường" },
  { id: "campaign", label: "Chiến dịch & chuyển đổi" },
] as const;

export type ActivityCampaignTab = (typeof ACTIVITY_CAMPAIGN_TABS)[number]["id"];

export default function ActivityCampaignTabs({ activeTab }: { activeTab: ActivityCampaignTab }) {
  return (
    <nav aria-label="Nội dung hoạt động và chiến dịch" className="sticky top-0 z-30 bg-card-surface-area">
      <div className="flex max-w-full gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:thin]" role="tablist">
        {ACTIVITY_CAMPAIGN_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Link key={tab.id} href={`/director/activity-campaign?tab=${tab.id}`} role="tab" aria-selected={isActive} aria-current={isActive ? "page" : undefined} className={isActive ? "group relative shrink-0 px-3 py-3 text-sm font-medium text-primary-500 outline-none transition-colors focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring" : "group relative shrink-0 px-3 py-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring"}>
              {tab.label}
              <span aria-hidden="true" className={isActive ? "absolute inset-x-3 bottom-0 h-0.5 scale-x-100 bg-primary-500 transition-transform duration-200 motion-reduce:transition-none" : "absolute inset-x-3 bottom-0 h-0.5 scale-x-0 bg-primary-500 transition-transform duration-200 motion-reduce:transition-none"} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
