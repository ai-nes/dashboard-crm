"use client";

import { createContext, useContext, type ReactNode } from "react";

import { acquisitionMapData as fixtureData } from "@/services/api/demographics/acquisition-map-data";
import type { AcquisitionMapData } from "@/services/api/demographics/types";

const AcquisitionMapDataContext = createContext<AcquisitionMapData>(fixtureData);

export function AcquisitionMapDataProvider({
  data,
  children,
}: {
  data?: AcquisitionMapData;
  children: ReactNode;
}) {
  return (
    <AcquisitionMapDataContext.Provider value={data ?? fixtureData}>
      {children}
    </AcquisitionMapDataContext.Provider>
  );
}

export function useAcquisitionMapData(): AcquisitionMapData {
  return useContext(AcquisitionMapDataContext);
}
