"use client";

import type { ComponentProps } from "react";

import { TabContent, TabList, TabRoot } from "@/components/tailgrids/core/tabs";
import { cn } from "@/utils/cn";

type AdminTabRootProps = Omit<ComponentProps<typeof TabRoot>, "variant">;

/** Flat tab layout for page-level admin navigation. */
export function AdminTabRoot({ className, ...props }: AdminTabRootProps) {
  return (
    <TabRoot
      variant="minimal"
      className={cn("min-w-0 rounded-none border-0 bg-transparent", className)}
      {...props}
    />
  );
}

export function AdminTabList({
  className,
  ...props
}: ComponentProps<typeof TabList>) {
  return <TabList className={cn("px-0", className)} {...props} />;
}

export function AdminTabContent({
  className,
  ...props
}: ComponentProps<typeof TabContent>) {
  return (
    <TabContent className={cn("min-w-0 pt-4 pb-8", className)} {...props} />
  );
}
