"use client";

import { CollapsibleGroup } from "@/components/tailgrids/core/collapsible";
import { useAuth } from "@/components/common/auth/auth-provider";
import { cn } from "@/utils/cn";
import { Logo } from "@/utils/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { getNavigationDataForRoles } from "./data";
import { CloseIcon, SidebarExpandedIcon, ThreeDots } from "./icon";
import NavItem from "./nav-item";
import {
  filterNavigationByRoles,
  findActiveGroupKeyInNavigation,
} from "./utils";

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  isMobileSheet = false,
  onItemClick,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileSheet?: boolean;
  onItemClick?: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const visibleNavData = useMemo(
    () =>
      filterNavigationByRoles(
        getNavigationDataForRoles(user?.roles ?? []),
        user?.roles ?? [],
      ),
    [user?.roles],
  );

  // Compute which group should be open based on the current route
  const activeGroupKey = useMemo(
    () => findActiveGroupKeyInNavigation(pathname, visibleNavData),
    [pathname, visibleNavData],
  );

  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
    () => new Set<Key>(activeGroupKey ? [activeGroupKey] : []),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "flex items-center px-4 pt-5 text-text-primary",
          isSidebarOpen ? "justify-between" : "flex-col justify-center gap-4",
        )}
      >
        <Link
          href="/"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="FAIP — FPTU Admission Intelligence Platform"
        >
          {isSidebarOpen ? (
            <span className="flex min-w-0 items-center gap-3">
              <Logo className="size-10 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-xl leading-5 font-bold tracking-[-0.02em] text-text-primary">
                  FAIP
                </span>
                <span className="mt-1 block max-w-44 text-[11px] leading-4 text-text-tertiary">
                  FPTU Admission Intelligence Platform
                </span>
              </span>
            </span>
          ) : (
            <Logo />
          )}
        </Link>

        <button
          onClick={() => toggleSidebar()}
          className={cn(
            "p-1.5 transition-colors",
            isMobileSheet
              ? "rounded-lg text-icon-tertiary hover:bg-background-gray-primary hover:text-text-primary"
              : "text-icon-tertiary hover:text-text-secondary",
          )}
          aria-label={isMobileSheet ? "Đóng thanh bên" : "Thu gọn thanh bên"}
        >
          {isMobileSheet ? <CloseIcon /> : <SidebarExpandedIcon />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "scrollbar-thin flex-1 overflow-y-auto",
          isSidebarOpen ? "mt-7 space-y-6 px-4" : "mt-5 px-2",
        )}
      >
        <CollapsibleGroup
          expandedKeys={expandedKeys}
          onExpandedChange={setExpandedKeys}
        >
          {visibleNavData.map((section) => (
            <div key={section.label}>
              {/* Expanded: show section label | Collapsed: show divider between sections */}
              {isSidebarOpen ? (
                <p className="mt-6 mb-4 text-xs text-text-tertiary uppercase">
                  {section.label}
                </p>
              ) : (
                section.label && (
                  <span className="flex items-center justify-center pt-6 pb-4 text-icon-secondary">
                    <ThreeDots />
                  </span>
                )
              )}

              <div className={cn("space-y-1", !isSidebarOpen && "space-y-1.5")}>
                {section.items.map((item) => (
                  <NavItem
                    key={item.title}
                    id={item.title}
                    icon={item.icon}
                    label={item.title}
                    href={item.url}
                    exact={item.exact}
                    items={item.items}
                    collapsed={!isSidebarOpen}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </CollapsibleGroup>
      </nav>
    </div>
  );
}
