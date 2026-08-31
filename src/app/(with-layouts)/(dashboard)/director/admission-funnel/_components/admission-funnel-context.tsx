"use client";

import { createContext, useContext } from "react";

import type { DirectorAdmissionFunnelData } from "@/services/api/director-admission-funnel";

const AdmissionFunnelContext = createContext<DirectorAdmissionFunnelData | null>(null);

export function AdmissionFunnelDataProvider({
  data,
  children,
}: {
  data: DirectorAdmissionFunnelData;
  children: React.ReactNode;
}) {
  return <AdmissionFunnelContext.Provider value={data}>{children}</AdmissionFunnelContext.Provider>;
}

export function useAdmissionFunnelData(): DirectorAdmissionFunnelData {
  const data = useContext(AdmissionFunnelContext);
  if (!data) throw new Error("useAdmissionFunnelData must be used inside AdmissionFunnelDataProvider");
  return data;
}
