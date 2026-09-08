"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { MOCK_SEGMENTS } from "./segment-list-mock-data";
import type { SegmentListItem } from "./segment-list-types";

const SegmentDataContext = createContext<{
  segments: SegmentListItem[];
  setSegments: Dispatch<SetStateAction<SegmentListItem[]>>;
} | null>(null);

export function SegmentDataProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState(MOCK_SEGMENTS);
  return (
    <SegmentDataContext.Provider value={{ segments, setSegments }}>
      {children}
    </SegmentDataContext.Provider>
  );
}

export function useSegmentData() {
  const context = useContext(SegmentDataContext);
  if (!context) throw new Error("useSegmentData requires SegmentDataProvider");
  return context;
}
