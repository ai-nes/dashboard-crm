"use client";

import { CollapsibleGroup } from "@/components/tailgrids/core/collapsible";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/tailgrids/core/scroll-area";
import { cn } from "@/utils/cn";
import { Logo } from "@/utils/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { NAV_DATA } from "./data";
import { CloseIcon, SidebarExpandedIcon, ThreeDots } from "./icon";
import NavItem from "./nav-item";
import { findActiveGroupKey } from "./utils";

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
  const pathname = usePathname();

  // Compute which group should be open based on the current route
  const activeGroupKey = useMemo(
    () => findActiveGroupKey(pathname),
    [pathname],
  );

  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
    () => new Set<Key>(activeGroupKey ? [activeGroupKey] : []),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "flex items-center px-4 pt-7 text-text-primary",
          isSidebarOpen ? "justify-between" : "flex-col justify-center gap-4",
        )}
      >
        <Link href="/">
          {isSidebarOpen ? (
            <span className="flex min-w-0 items-center gap-2.5">
              <Logo className="size-8" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-xl font-semibold tracking-[-0.04em] text-text-primary">
                  FAIP
                </span>
                <span className="block max-w-44 text-[10px] leading-3 text-text-tertiary">
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
      <ScrollArea className="min-h-0 flex-1">
        <ScrollAreaViewport>
          <nav
            className={cn(isSidebarOpen ? "mt-7 space-y-6 px-4" : "mt-5 px-2")}
          >
            <CollapsibleGroup
              expandedKeys={expandedKeys}
              onExpandedChange={setExpandedKeys}
            >
              {NAV_DATA.map((section) => (
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

                  <div
                    className={cn("space-y-1", !isSidebarOpen && "space-y-1.5")}
                  >
                    {section.items.map((item) => (
                      <NavItem
                        key={item.title}
                        id={item.title}
                        icon={item.icon}
                        label={item.title}
                        href={item.url}
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
        </ScrollAreaViewport>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
}
