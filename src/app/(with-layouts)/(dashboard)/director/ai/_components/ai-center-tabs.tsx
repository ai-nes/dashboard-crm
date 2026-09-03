import Link from "next/link";

export const AI_CENTER_TABS = [
  { id: "signals", label: "Luồng tín hiệu", href: "/director/ai?tab=signals" },
  { id: "ask", label: "Hỏi đáp tuyển sinh", href: "/director/ai?tab=ask" },
  { id: "trust", label: "Độ tin cậy AI", href: "/director/ai?tab=trust" },
  { id: "data", label: "Sức khỏe dữ liệu", href: "/director/ai?tab=data" },
  { id: "alerts", label: "Cảnh báo", href: "/director/ai?tab=alerts" },
] as const;

export type AiCenterTab = (typeof AI_CENTER_TABS)[number]["id"];

interface AiCenterTabsProps {
  activeTab: AiCenterTab;
}

export default function AiCenterTabs({ activeTab }: AiCenterTabsProps) {
  return (
    <nav
      aria-label="Khu vực Trung tâm AI & dữ liệu"
      className="sticky top-0 z-30 bg-card-surface-area px-2 pt-2 lg:px-6"
    >
      <div
        className="flex max-w-full gap-1 overflow-x-auto border-b border-card-border px-1 [scrollbar-width:thin]"
        role="tablist"
      >
        {AI_CENTER_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "group relative shrink-0 px-3 py-3 text-sm font-medium text-primary-500 outline-none transition-colors focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring"
                  : "group relative shrink-0 px-3 py-3 text-sm font-medium text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring"
              }
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={
                  isActive
                    ? "absolute inset-x-3 bottom-0 h-0.5 scale-x-100 bg-primary-500 transition-transform duration-200 motion-reduce:transition-none"
                    : "absolute inset-x-3 bottom-0 h-0.5 scale-x-0 bg-primary-500 transition-transform duration-200 motion-reduce:transition-none"
                }
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
