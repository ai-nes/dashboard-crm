"use client";

import { createContext, useContext } from "react";

import type { RevenueForecastResponse } from "@/services/api/director-revenue-forecast";

const Context = createContext<RevenueForecastResponse | null>(null);

export function RevenueForecastDataProvider({
  data,
  children,
}: {
  data: RevenueForecastResponse;
  children: React.ReactNode;
}) {
  return <Context.Provider value={data}>{children}</Context.Provider>;
}

export function useRevenueForecastData() {
  const data = useContext(Context);
  if (!data) throw new Error("Revenue forecast data provider is missing.");
  return data;
}

export function billions(value: number | null | undefined) {
  return (Number(value) || 0) / 1_000_000_000;
}
export function money(value: number | null | undefined) {
  return `${billions(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}B`;
}
export function percent(value: number | null | undefined) {
  return value == null
    ? "—"
    : `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}
