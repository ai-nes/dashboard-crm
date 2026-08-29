"use client";
import { MoonIcon, SunIcon } from "@/components/common/header/icons";
import { Button } from "@/components/tailgrids/core/button";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      iconOnly
      appearance="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-8.5 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs outline-none focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 [&>svg]:size-4"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
